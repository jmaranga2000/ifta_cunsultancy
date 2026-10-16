import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveEtimsEnv } from "@/features/etims/env-config";
import { KraEtimsConnector, type KraConnectorConfiguration } from "@/features/etims/kra-connector";
import { buildReceiptQrUrl, buildSalesPayload, KraPayloadError, kraDate, kraDateTime, paymentTypeCode } from "@/features/etims/kra-payloads";
import type { EtimsSubmissionEnvelope } from "@/features/etims/types";

describe("resolveEtimsEnv", () => {
  it("stays out of the way when ETIMS_MODE is not set", () => {
    expect(resolveEtimsEnv({})).toBeNull();
    expect(resolveEtimsEnv({ ETIMS_BASE_URL: "https://x.test" })).toBeNull();
  });

  it("applies OSCU defaults and reports what is still missing", () => {
    const env = resolveEtimsEnv({ ETIMS_MODE: "oscu", ETIMS_BASE_URL: "https://etims-api-sbx.kra.go.ke/etims-api/", ETIMS_TIN: "p051234567z" });
    expect(env).toMatchObject({
      mode: "OSCU",
      environment: "SANDBOX",
      baseUrl: "https://etims-api-sbx.kra.go.ke/etims-api",
      tin: "P051234567Z",
      branchId: "00",
      enabled: true,
    });
    expect(env?.paths.init).toBe("/selectInitOsdcInfo");
    expect(env?.paths.sales).toBe("/saveTrnsSalesOsdc");
    expect(env?.paths.creditNote).toBe("/saveTrnsSalesOsdc");
    expect(env?.missing).toEqual(["ETIMS_DEVICE_SERIAL", "ETIMS_CMC_KEY (run `npm run etims:init` to get it)"]);
  });

  it("needs no communication key or serial for VSCU", () => {
    const env = resolveEtimsEnv({ ETIMS_MODE: "VSCU", ETIMS_BASE_URL: "http://localhost:8088", ETIMS_TIN: "P051234567Z" });
    expect(env?.missing).toEqual([]);
    expect(env?.paths.sales).toBe("/saveTrnsSalesVsdc");
    expect(env?.qrBaseUrl).toContain("etims-sbx.kra.go.ke");
  });

  it("lets every endpoint be overridden from .env", () => {
    const env = resolveEtimsEnv({
      ETIMS_MODE: "VSCU",
      ETIMS_ENVIRONMENT: "PRODUCTION",
      ETIMS_BASE_URL: "http://10.0.0.5:8080",
      ETIMS_TIN: "P1",
      ETIMS_PATH_SALES: "trnsSales/saveSales",
      ETIMS_PATH_INIT: "/initializer/selectInitInfo",
      ETIMS_PATH_CREDIT_NOTE: "/custom/refund",
      ETIMS_RETRYABLE_RESULT_CODES: "991, 995",
      ETIMS_ENABLED: "false",
    });
    expect(env).toMatchObject({ enabled: false, environment: "PRODUCTION", retryableResultCodes: ["991", "995"] });
    expect(env?.paths).toMatchObject({ sales: "/trnsSales/saveSales", init: "/initializer/selectInitInfo", creditNote: "/custom/refund", debitNote: "/trnsSales/saveSales" });
    expect(env?.qrBaseUrl).toContain("//etims.kra.go.ke");
  });

  it("rejects a base URL without a scheme", () => {
    expect(resolveEtimsEnv({ ETIMS_MODE: "VSCU", ETIMS_BASE_URL: "localhost:8088", ETIMS_TIN: "P1" })?.missing[0]).toContain("must start with http");
  });
});

const line = {
  description: "Tax advisory",
  quantity: 2,
  unitPrice: 5000,
  discountAmount: 0,
  taxableAmount: 10000,
  taxTypeCode: "B",
  taxRate: 16,
  taxAmount: 1600,
  totalAmount: 11600,
  quantityUnitCode: "U",
  itemCode: "KE2ISRTAX0001",
  itemClassificationCode: "8011150600",
  packageUnitCode: "NT",
};

function sale(overrides: Record<string, unknown> = {}): EtimsSubmissionEnvelope {
  return {
    aggregateId: "inv1",
    kind: "SALE",
    idempotencyKey: "idem-1",
    payloadHash: "hash",
    payloadVersion: 1,
    snapshot: {
      kraSequenceNumber: 41,
      traderInvoiceNumber: "INV-2026-0041",
      clientLegalName: "Acme Ltd",
      clientKraPin: "a000111222b",
      invoiceDate: "2026-10-13T21:30:00.000Z", // already 14 Oct in Nairobi
      approvedAt: "2026-10-13T08:05:09.000Z",
      paymentMethod: "BANK_TRANSFER",
      approverId: "507f1f77bcf86cd799439011aaaa",
      approverName: "Jane Finance",
      seller: { legalName: "IFTA Consulting (K) Ltd", address: "Nairobi, Kenya" },
      lines: [line],
      ...overrides,
    },
  };
}

const context = { tin: "P051234567Z", branchId: "00" };

describe("buildSalesPayload", () => {
  it("builds a KRA sale from a VAT-exclusive IFTA invoice", () => {
    const payload = buildSalesPayload(sale(), context) as Record<string, any>;
    expect(payload).toMatchObject({
      tin: "P051234567Z",
      bhfId: "00",
      invcNo: 41,
      orgInvcNo: 0,
      custTin: "A000111222B",
      custNm: "Acme Ltd",
      salesTyCd: "N",
      rcptTyCd: "S",
      pmtTyCd: "04",
      salesSttsCd: "02",
      cfmDt: "20261013110509",
      salesDt: "20261014",
      totItemCnt: 1,
      taxblAmtB: 11600,
      taxRtB: 16,
      taxAmtB: 1600,
      taxblAmtA: 0,
      totTaxblAmt: 11600,
      totTaxAmt: 1600,
      totAmt: 11600,
      rfdRsnCd: null,
      regrId: "507f1f77bcf86cd79943",
    });
    expect(payload.itemList[0]).toMatchObject({
      itemSeq: 1,
      itemCd: "KE2ISRTAX0001",
      itemClsCd: "8011150600",
      qty: 2,
      prc: 5800,
      splyAmt: 11600,
      taxTyCd: "B",
      taxblAmt: 11600,
      taxAmt: 1600,
      totAmt: 11600,
    });
    expect(payload.receipt.trdeNm).toBe("IFTA Consulting (K) Ltd");
  });

  it("accounts for discounts in VAT-inclusive terms", () => {
    const discounted = { ...line, discountAmount: 1000, taxableAmount: 9000, taxAmount: 1440, totalAmount: 10440 };
    const payload = buildSalesPayload(sale({ lines: [discounted] }), context) as Record<string, any>;
    expect(payload.itemList[0]).toMatchObject({ dcAmt: 1160, splyAmt: 11600, totAmt: 10440, taxAmt: 1440 });
    expect(payload.totAmt).toBe(10440);
  });

  it("totals several tax types separately", () => {
    const exempt = { ...line, description: "Training", taxTypeCode: "A", taxRate: 0, taxAmount: 0, taxableAmount: 3000, totalAmount: 3000, quantity: 1, unitPrice: 3000 };
    const payload = buildSalesPayload(sale({ lines: [line, exempt] }), context) as Record<string, any>;
    expect(payload).toMatchObject({ taxblAmtA: 3000, taxAmtA: 0, taxblAmtB: 11600, totAmt: 14600, totItemCnt: 2, totTaxAmt: 1600 });
  });

  it("builds a credit note that points back at the original invoice number", () => {
    const note: EtimsSubmissionEnvelope = {
      aggregateId: "cn1",
      kind: "CREDIT_NOTE",
      idempotencyKey: "idem-2",
      payloadHash: "h",
      payloadVersion: 1,
      snapshot: {
        kraSequenceNumber: 42,
        originalKraSequenceNumber: 41,
        noteNumber: "CN-2026-0007",
        clientName: "Acme Ltd",
        clientKraPin: "A000111222B",
        paymentMethod: "BANK_TRANSFER",
        confirmedAt: "2026-10-14T06:00:00.000Z",
        confirmedByAdminId: "admin1",
        approverName: "Jane Finance",
        reasonCode: "11",
        lines: [{ ...line, adjustmentQuantity: 1, adjustmentUnitPrice: 5000, taxableAmount: 5000, taxAmount: 800, totalAmount: 5800 }],
      },
    };
    expect(buildSalesPayload(note, context)).toMatchObject({
      invcNo: 42,
      orgInvcNo: 41,
      rcptTyCd: "R",
      rfdRsnCd: "11",
      totAmt: 5800,
      salesDt: "20261014",
    });
  });

  it("explains what is missing instead of sending a bad request", () => {
    expect(() => buildSalesPayload(sale({ kraSequenceNumber: undefined }), context)).toThrow(/sequence number/);
    expect(() => buildSalesPayload(sale({ lines: [{ ...line, itemCode: "" }] }), context)).toThrow(/item code/);
    expect(() => buildSalesPayload(sale({ lines: [{ ...line, taxTypeCode: "Z" }] }), context)).toThrow(KraPayloadError);
    expect(() => buildSalesPayload({ ...sale(), kind: "CREDIT_NOTE" }, context)).toThrow();
  });

  it("formats dates and payment types the way KRA expects", () => {
    expect(kraDateTime("2026-12-31T22:30:00.000Z")).toBe("20270101013000");
    expect(kraDate("2026-12-31T22:30:00.000Z")).toBe("20270101");
    expect(paymentTypeCode("mpesa")).toBe("06");
    expect(paymentTypeCode("Bank transfer")).toBe("04");
    expect(paymentTypeCode("05")).toBe("05");
    expect(paymentTypeCode("something else")).toBe("07");
    expect(buildReceiptQrUrl("https://q.test/?Data=", "P1", "00", "ABCD")).toBe("https://q.test/?Data=P100ABCD");
    expect(buildReceiptQrUrl("https://q.test/?Data=", "P1", "00", "")).toBe("");
  });
});

const connectorConfig: KraConnectorConfiguration = {
  mode: "OSCU",
  baseUrl: "https://kra.test/etims-api",
  tin: "P051234567Z",
  branchId: "00",
  deviceSerial: "DEV123",
  cmcKey: "CMC-SECRET",
  paths: { init: "/selectInitOsdcInfo", sales: "/saveTrnsSalesOsdc", creditNote: "/saveTrnsSalesOsdc", debitNote: "/saveTrnsSalesOsdc", item: "/saveItem" },
  qrBaseUrl: "https://etims-sbx.kra.go.ke/common/link/etims/receipt/indexEtimsReceiptData?Data=",
  retryableResultCodes: ["990", "999"],
};

function reply(body: unknown, status = 200) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

describe("KraEtimsConnector", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sends the sale to the configured endpoint with KRA headers and maps the receipt", async () => {
    const fetchMock = reply({
      resultCd: "000",
      resultMsg: "Successful",
      resultDt: "20261013110510",
      data: { rcptNo: 17, totRcptNo: 25, rcptSign: "ABCDEFGHIJKLMNOP", intrlData: "INTERNALDATA", sdcId: "SDC0010000001", mrcNo: "WIS0001", vsdcRcptPbctDate: "20261013110510" },
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = await new KraEtimsConnector(connectorConfig).submitSale(sale());

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://kra.test/etims-api/saveTrnsSalesOsdc");
    expect(init.headers).toMatchObject({ tin: "P051234567Z", bhfId: "00", cmcKey: "CMC-SECRET" });
    expect(JSON.parse(String(init.body))).toMatchObject({ invcNo: 41, rcptTyCd: "S", totAmt: 11600 });

    expect(result).toMatchObject({
      outcome: "ACCEPTED",
      kraInvoiceNumber: "17",
      receiptNumber: "25",
      receiptSignature: "ABCDEFGHIJKLMNOP",
      controlUnitId: "SDC0010000001",
      internalData: "INTERNALDATA",
      traderInvoiceNumber: "INV-2026-0041",
      qrData: "https://etims-sbx.kra.go.ke/common/link/etims/receipt/indexEtimsReceiptData?Data=P051234567Z00ABCDEFGHIJKLMNOP",
    });
    expect(JSON.stringify(result)).not.toContain("CMC-SECRET");
  });

  it("treats a KRA validation error as a rejection and a 99x code as retryable", async () => {
    vi.stubGlobal("fetch", reply({ resultCd: "910", resultMsg: "Request parameter error" }));
    expect(await new KraEtimsConnector(connectorConfig).submitSale(sale())).toMatchObject({ outcome: "REJECTED", responseCode: "910", responseMessage: "Request parameter error" });

    vi.stubGlobal("fetch", reply({ resultCd: "999", resultMsg: "Unexpected error" }));
    expect(await new KraEtimsConnector(connectorConfig).submitSale(sale())).toMatchObject({ outcome: "RETRY_REQUIRED", responseCode: "999" });
  });

  it("retries server and network failures but reconciles timeouts", async () => {
    vi.stubGlobal("fetch", reply({ message: "bad gateway" }, 502));
    expect(await new KraEtimsConnector(connectorConfig).submitSale(sale())).toMatchObject({ outcome: "RETRY_REQUIRED" });

    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("connect ECONNREFUSED 127.0.0.1:8088"); }));
    expect(await new KraEtimsConnector(connectorConfig).submitSale(sale())).toMatchObject({ outcome: "RETRY_REQUIRED" });

    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("The operation was aborted due to timeout"); }));
    expect(await new KraEtimsConnector(connectorConfig).submitSale(sale())).toMatchObject({ outcome: "RECONCILIATION_REQUIRED" });
  });

  it("flags a success reply with no receipt number for reconciliation", async () => {
    vi.stubGlobal("fetch", reply({ resultCd: "000", resultMsg: "Successful", data: {} }));
    expect(await new KraEtimsConnector(connectorConfig).submitSale(sale())).toMatchObject({ outcome: "RECONCILIATION_REQUIRED" });
  });

  it("never calls KRA when the invoice is not ready, and says why", async () => {
    const fetchMock = reply({});
    vi.stubGlobal("fetch", fetchMock);
    const result = await new KraEtimsConnector(connectorConfig).submitSale(sale({ lines: [{ ...line, itemCode: "" }] }));
    expect(result).toMatchObject({ outcome: "REJECTED" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reconciles by re-sending, and defers to a person when KRA already has the number", async () => {
    vi.stubGlobal("fetch", reply({ resultCd: "000", resultMsg: "Successful", data: { rcptNo: 3, rcptSign: "SIGN" } }));
    expect(await new KraEtimsConnector(connectorConfig).reconcileTransaction(sale())).toMatchObject({ outcome: "ACCEPTED" });

    vi.stubGlobal("fetch", reply({ resultCd: "921", resultMsg: "Invoice number already exists" }));
    expect(await new KraEtimsConnector(connectorConfig).reconcileTransaction(sale())).toMatchObject({ outcome: "UNRESOLVED" });
  });

  it("verifies the connection through device initialisation", async () => {
    vi.stubGlobal("fetch", reply({ resultCd: "000", resultMsg: "Successful" }));
    expect(await new KraEtimsConnector(connectorConfig).verifyConnection()).toMatchObject({ ok: true });
    vi.stubGlobal("fetch", reply({ resultCd: "902", resultMsg: "This device is installed" }));
    expect(await new KraEtimsConnector(connectorConfig).verifyConnection()).toMatchObject({ ok: true });
    vi.stubGlobal("fetch", reply({ resultCd: "901", resultMsg: "It is not valid device" }));
    const bad = await new KraEtimsConnector(connectorConfig).verifyConnection();
    expect(bad.ok).toBe(false);
    expect(bad.message).toContain("901");
  });

  it("returns the communication key from initialisation", async () => {
    vi.stubGlobal("fetch", reply({ resultCd: "000", resultMsg: "Successful", data: { info: { cmcKey: "NEWKEY", taxprNm: "IFTA Consulting", bhfNm: "Head Office", sdcId: "SDC1" } } }));
    expect(await new KraEtimsConnector(connectorConfig).initialize()).toMatchObject({ ok: true, cmcKey: "NEWKEY", taxpayerName: "IFTA Consulting" });
  });

  it("registers items and treats an existing item as success", async () => {
    const item = { itemCode: "KE2ISRTAX0001", classificationCode: "8011150600", title: "Tax advisory", taxTypeCode: "B", quantityUnitCode: "U" };
    vi.stubGlobal("fetch", reply({ resultCd: "000", resultMsg: "Successful" }));
    expect(await new KraEtimsConnector(connectorConfig).registerItem(item)).toMatchObject({ ok: true });
    vi.stubGlobal("fetch", reply({ resultCd: "892", resultMsg: "Item already exists" }));
    expect(await new KraEtimsConnector(connectorConfig).registerItem(item)).toMatchObject({ ok: true, message: "Already registered." });
    vi.stubGlobal("fetch", reply({ resultCd: "910", resultMsg: "bad" }));
    expect(await new KraEtimsConnector(connectorConfig).registerItem(item)).toMatchObject({ ok: false });
  });
});
