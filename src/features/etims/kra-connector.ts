import { buildItemRegistrationPayload, buildReceiptQrUrl, buildSalesPayload, KraPayloadError } from "@/features/etims/kra-payloads";
import type {
  EtimsConnectionResult,
  EtimsConnector,
  EtimsReconciliationResult,
  EtimsSubmissionEnvelope,
  EtimsSubmissionResult,
} from "@/features/etims/types";

/**
 * Connector for KRA's own OSCU (online) and VSCU (virtual) sales control units.
 * Both speak the same JSON protocol; they differ only in where they run and
 * which endpoint names they use, which come from `.env` (see env-config.ts).
 */

export type KraConnectorConfiguration = {
  mode: "OSCU" | "VSCU";
  baseUrl: string;
  tin: string;
  branchId: string;
  deviceSerial: string;
  cmcKey: string;
  paths: { init: string; sales: string; creditNote: string; debitNote: string; item: string };
  qrBaseUrl: string;
  retryableResultCodes: string[];
};

type Row = Record<string, unknown>;

const SUCCESS_CODE = "000";
/** OSCU answers 902 when a device was already initialised: KRA was reached and knows the device. */
const ALREADY_INITIALISED_CODE = "902";
const SUBMIT_TIMEOUT_MS = 30_000;
const QUICK_TIMEOUT_MS = 15_000;

function asRow(value: unknown): Row {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Row) : {};
}

function str(row: Row, key: string) {
  const value = row[key];
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

type CallResult =
  | { kind: "response"; status: number; body: Row }
  | { kind: "timeout" }
  | { kind: "unreachable"; message: string };

export class KraEtimsConnector implements EtimsConnector {
  constructor(private readonly config: KraConnectorConfiguration) {}

  private headers() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      tin: this.config.tin,
      bhfId: this.config.branchId,
    };
    if (this.config.cmcKey) headers.cmcKey = this.config.cmcKey;
    return headers;
  }

  private async call(path: string, payload: unknown, timeoutMs: number): Promise<CallResult> {
    try {
      const response = await fetch(joinUrl(this.config.baseUrl, path), {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs),
      });
      const raw = await response.text();
      let body: Row = {};
      if (raw) {
        try {
          body = asRow(JSON.parse(raw));
        } catch {
          body = { resultMsg: raw.slice(0, 300) };
        }
      }
      return { kind: "response", status: response.status, body };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed.";
      if (/timeout|aborted/i.test(message)) return { kind: "timeout" };
      return { kind: "unreachable", message: message.slice(0, 300) };
    }
  }

  private pathFor(envelope: EtimsSubmissionEnvelope) {
    if (envelope.kind === "CREDIT_NOTE") return this.config.paths.creditNote;
    if (envelope.kind === "DEBIT_NOTE") return this.config.paths.debitNote;
    return this.config.paths.sales;
  }

  private accepted(
    body: Row,
    envelope: EtimsSubmissionEnvelope,
  ): Extract<EtimsSubmissionResult, { outcome: "ACCEPTED" }> | null {
    const data = asRow(body.data);
    const receiptNumber = str(data, "rcptNo");
    if (!receiptNumber) return null;
    const signature = str(data, "rcptSign");
    return {
      outcome: "ACCEPTED",
      requestId: envelope.idempotencyKey,
      traderInvoiceNumber: str(envelope.snapshot, "traderInvoiceNumber") || str(envelope.snapshot, "noteNumber"),
      kraInvoiceNumber: receiptNumber,
      receiptNumber: str(data, "totRcptNo") || receiptNumber,
      receiptSignature: signature,
      controlUnitId: str(data, "sdcId"),
      internalData: str(data, "intrlData"),
      qrData: buildReceiptQrUrl(this.config.qrBaseUrl, this.config.tin, this.config.branchId, signature),
      responseCode: SUCCESS_CODE,
      responseMessage: str(body, "resultMsg") || "Successful",
      connectorResponse: {
        resultCd: str(body, "resultCd"),
        resultMsg: str(body, "resultMsg"),
        resultDt: str(body, "resultDt"),
        rcptNo: receiptNumber,
        totRcptNo: str(data, "totRcptNo"),
        sdcId: str(data, "sdcId"),
        mrcNo: str(data, "mrcNo"),
        rcptPbctDate: str(data, "vsdcRcptPbctDate") || str(data, "rcptPbctDate"),
      },
    };
  }

  private interpret(result: CallResult, envelope: EtimsSubmissionEnvelope): EtimsSubmissionResult {
    if (result.kind === "timeout") {
      return {
        outcome: "RECONCILIATION_REQUIRED",
        responseMessage: "KRA did not answer in time after the invoice was sent, so the result must be reconciled.",
      };
    }
    if (result.kind === "unreachable") {
      return { outcome: "RETRY_REQUIRED", responseMessage: `Could not reach the ${this.config.mode}: ${result.message}` };
    }

    const { status, body } = result;
    const code = str(body, "resultCd");
    const message = str(body, "resultMsg");

    if ([408, 504].includes(status)) {
      return { outcome: "RECONCILIATION_REQUIRED", responseCode: String(status), responseMessage: "The submission result is uncertain and must be reconciled." };
    }
    if (status === 429 || status >= 500) {
      return { outcome: "RETRY_REQUIRED", responseCode: String(status), responseMessage: message || "The eTIMS service is temporarily unavailable." };
    }
    if (code === SUCCESS_CODE) {
      return (
        this.accepted(body, envelope) ?? {
          outcome: "RECONCILIATION_REQUIRED",
          responseCode: code,
          responseMessage: "KRA reported success but returned no receipt number, so the result must be reconciled.",
        }
      );
    }
    if (this.config.retryableResultCodes.includes(code)) {
      return { outcome: "RETRY_REQUIRED", responseCode: code, responseMessage: message || "KRA reported a temporary error." };
    }
    return {
      outcome: "REJECTED",
      responseCode: code || String(status),
      responseMessage: message || "KRA eTIMS rejected the transaction.",
      connectorResponse: { resultCd: code, resultMsg: message, resultDt: str(body, "resultDt") },
    };
  }

  private async submit(envelope: EtimsSubmissionEnvelope): Promise<EtimsSubmissionResult> {
    let payload: Record<string, unknown>;
    try {
      payload = buildSalesPayload(envelope, { tin: this.config.tin, branchId: this.config.branchId });
    } catch (error) {
      if (error instanceof KraPayloadError) {
        return { outcome: "REJECTED", responseCode: "IFTA", responseMessage: error.message, connectorResponse: {} };
      }
      throw error;
    }
    return this.interpret(await this.call(this.pathFor(envelope), payload, SUBMIT_TIMEOUT_MS), envelope);
  }

  submitSale(transaction: EtimsSubmissionEnvelope) {
    return this.submit(transaction);
  }

  submitCreditNote(transaction: EtimsSubmissionEnvelope) {
    return this.submit(transaction);
  }

  submitDebitNote(transaction: EtimsSubmissionEnvelope) {
    return this.submit(transaction);
  }

  /**
   * KRA exposes no "look up my sale" call, but each sale is identified by its
   * sequential invoice number. Re-sending the identical payload is therefore
   * safe: success means KRA had not recorded it, a duplicate answer means it
   * had and a person must link it from the eTIMS portal.
   */
  async reconcileTransaction(transaction: EtimsSubmissionEnvelope): Promise<EtimsReconciliationResult> {
    const outcome = await this.submit(transaction);
    if (outcome.outcome === "ACCEPTED") return { outcome: "ACCEPTED", result: outcome };
    if (outcome.outcome === "REJECTED") {
      if (/already|duplicate|exist/i.test(outcome.responseMessage)) {
        return {
          outcome: "UNRESOLVED",
          message: "KRA says this invoice number already exists. Confirm the receipt in the eTIMS portal and link it manually.",
        };
      }
      return { outcome: "REJECTED", result: outcome };
    }
    return { outcome: "UNRESOLVED", message: outcome.responseMessage };
  }

  private initPayload() {
    return { tin: this.config.tin, bhfId: this.config.branchId, dvcSrlNo: this.config.deviceSerial };
  }

  async verifyConnection(): Promise<EtimsConnectionResult> {
    const checkedAt = new Date();
    const result = await this.call(this.config.paths.init, this.initPayload(), QUICK_TIMEOUT_MS);
    if (result.kind === "timeout") return { ok: false, message: `The ${this.config.mode} did not answer in time.`, checkedAt };
    if (result.kind === "unreachable") return { ok: false, message: `Could not reach the ${this.config.mode}: ${result.message}`, checkedAt };

    const code = str(result.body, "resultCd");
    const message = str(result.body, "resultMsg");
    if (code === SUCCESS_CODE) return { ok: true, message: `Connected to KRA ${this.config.mode}. ${message}`.trim(), checkedAt };
    if (code === ALREADY_INITIALISED_CODE) {
      return { ok: true, message: `Connected to KRA ${this.config.mode}. The device is already initialised.`, checkedAt };
    }
    return { ok: false, message: `KRA ${this.config.mode} answered ${code || result.status}: ${message || "no message"}.`, checkedAt };
  }

  /** Device initialisation: returns the communication key to store as ETIMS_CMC_KEY. */
  async initialize() {
    const result = await this.call(this.config.paths.init, this.initPayload(), QUICK_TIMEOUT_MS);
    if (result.kind !== "response") {
      return { ok: false as const, message: result.kind === "timeout" ? "The request timed out." : result.message };
    }
    const code = str(result.body, "resultCd");
    const info = asRow(asRow(result.body.data).info);
    if (code !== SUCCESS_CODE) {
      return { ok: false as const, code, message: str(result.body, "resultMsg") || `KRA answered ${code || result.status}.` };
    }
    return {
      ok: true as const,
      cmcKey: str(info, "cmcKey"),
      taxpayerName: str(info, "taxprNm"),
      branchName: str(info, "bhfNm"),
      controlUnitId: str(info, "sdcId"),
      message: str(result.body, "resultMsg"),
    };
  }

  /** Registers (or re-registers) a service so it can appear on sales. */
  async registerItem(item: Parameters<typeof buildItemRegistrationPayload>[0]) {
    const payload = buildItemRegistrationPayload(item, { tin: this.config.tin, branchId: this.config.branchId });
    const result = await this.call(this.config.paths.item, payload, QUICK_TIMEOUT_MS);
    if (result.kind !== "response") {
      return { ok: false as const, message: result.kind === "timeout" ? "The request timed out." : result.message };
    }
    const code = str(result.body, "resultCd");
    const message = str(result.body, "resultMsg");
    if (code === SUCCESS_CODE) return { ok: true as const, message: message || "Registered." };
    if (/already|exist/i.test(message)) return { ok: true as const, message: "Already registered." };
    return { ok: false as const, code, message: message || `KRA answered ${code || result.status}.` };
  }
}
