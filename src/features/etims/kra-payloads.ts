import type { EtimsSubmissionEnvelope } from "@/features/etims/types";

/**
 * Builds the JSON body KRA's OSCU/VSCU expects for a sales transaction
 * (invoice, credit note or debit note) from IFTA's immutable fiscal snapshot.
 *
 * KRA amounts are VAT-inclusive: `taxblAmt`/`totAmt` are gross and `taxAmt`
 * is the VAT contained in them, so IFTA's net lines are grossed up here.
 */

export class KraPayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KraPayloadError";
  }
}

export type KraPayloadContext = {
  tin: string;
  branchId: string;
  /** Item codes that exist at KRA; used when a snapshot line carries no mapping. */
  defaultPackageUnitCode?: string;
};

type Row = Record<string, unknown>;

const TAX_TYPES = ["A", "B", "C", "D", "E"] as const;
type TaxType = (typeof TAX_TYPES)[number];
const DEFAULT_TAX_RATES: Record<TaxType, number> = { A: 0, B: 16, C: 0, D: 0, E: 8 };

const PAYMENT_TYPE_CODES: Record<string, string> = {
  CASH: "01",
  CREDIT: "02",
  CASH_CREDIT: "03",
  BANK_CHEQUE: "04",
  BANK_TRANSFER: "04",
  CARD: "05",
  CREDIT_CARD: "05",
  DEBIT_CARD: "05",
  MOBILE_MONEY: "06",
  MPESA: "06",
  M_PESA: "06",
  OTHER: "07",
};

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function asRow(value: unknown): Row {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Row) : {};
}

function text(row: Row, key: string) {
  const value = row[key];
  return typeof value === "string" ? value.trim() : typeof value === "number" ? String(value) : "";
}

function numeric(row: Row, key: string) {
  const value = row[key];
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Kenya is UTC+3 all year; KRA expects local time. */
function kenyaParts(input: Date) {
  const shifted = new Date(input.getTime() + 3 * 60 * 60 * 1000);
  const iso = shifted.toISOString(); // 2026-10-13T08:05:09.000Z
  return { date: iso.slice(0, 10).replace(/-/g, ""), time: iso.slice(11, 19).replace(/:/g, "") };
}

export function kraDate(value: unknown, fallback = new Date()) {
  const parsed = typeof value === "string" || value instanceof Date ? new Date(value) : fallback;
  return kenyaParts(Number.isNaN(parsed.getTime()) ? fallback : parsed).date;
}

export function kraDateTime(value: unknown, fallback = new Date()) {
  const parsed = typeof value === "string" || value instanceof Date ? new Date(value) : fallback;
  const parts = kenyaParts(Number.isNaN(parsed.getTime()) ? fallback : parsed);
  return `${parts.date}${parts.time}`;
}

export function paymentTypeCode(method: unknown) {
  const key = typeof method === "string" ? method.trim().toUpperCase().replace(/[\s-]+/g, "_") : "";
  if (/^0[1-7]$/.test(key)) return key;
  return PAYMENT_TYPE_CODES[key] ?? "07";
}

function clip(value: string, length: number) {
  return value.length > length ? value.slice(0, length) : value;
}

type NormalisedLine = {
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxType: TaxType;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  itemCode: string;
  classificationCode: string;
  quantityUnitCode: string;
  packageUnitCode: string;
};

function normaliseLines(envelope: EtimsSubmissionEnvelope, context: KraPayloadContext): NormalisedLine[] {
  const rawLines = envelope.snapshot.lines;
  if (!Array.isArray(rawLines) || rawLines.length === 0) throw new KraPayloadError("The transaction has no lines.");
  const isNote = envelope.kind !== "SALE";

  return rawLines.map((raw, index) => {
    const line = asRow(raw);
    const label = text(line, "description") || `line ${index + 1}`;
    const taxType = text(line, "taxTypeCode").toUpperCase() as TaxType;
    if (!TAX_TYPES.includes(taxType)) {
      throw new KraPayloadError(`The tax type of "${label}" must be one of A, B, C, D or E.`);
    }
    const itemCode = text(line, "itemCode");
    const classificationCode = text(line, "itemClassificationCode");
    if (!itemCode || !classificationCode) {
      throw new KraPayloadError(
        `"${label}" has no KRA item code or classification code. Complete its eTIMS service mapping, then re-approve the invoice.`,
      );
    }
    const quantity = isNote ? numeric(line, "adjustmentQuantity") : numeric(line, "quantity");
    if (quantity <= 0) throw new KraPayloadError(`The quantity of "${label}" must be greater than zero.`);
    return {
      description: label,
      quantity,
      unitPrice: isNote ? numeric(line, "adjustmentUnitPrice") : numeric(line, "unitPrice"),
      discount: isNote ? 0 : numeric(line, "discountAmount"),
      taxType,
      taxRate: numeric(line, "taxRate"),
      taxAmount: numeric(line, "taxAmount"),
      totalAmount: numeric(line, "totalAmount"),
      itemCode,
      classificationCode,
      quantityUnitCode: text(line, "quantityUnitCode") || "U",
      packageUnitCode: text(line, "packageUnitCode") || context.defaultPackageUnitCode || "NT",
    };
  });
}

export function buildSalesPayload(envelope: EtimsSubmissionEnvelope, context: KraPayloadContext): Record<string, unknown> {
  const snapshot = envelope.snapshot;
  const isNote = envelope.kind !== "SALE";
  const lines = normaliseLines(envelope, context);

  const sequence = numeric(snapshot, "kraSequenceNumber");
  if (!Number.isInteger(sequence) || sequence <= 0) {
    throw new KraPayloadError("The transaction has no KRA sequence number. Re-approve it so one is assigned.");
  }
  let originalSequence = 0;
  if (isNote) {
    originalSequence = numeric(snapshot, "originalKraSequenceNumber");
    if (!Number.isInteger(originalSequence) || originalSequence <= 0) {
      throw new KraPayloadError("The original invoice's KRA sequence number is missing, so this note cannot reference it.");
    }
  }

  const items = lines.map((line, index) => {
    const factor = 1 + line.taxRate / 100;
    const discountGross = roundMoney(line.discount * factor);
    const supplyAmount = roundMoney(line.totalAmount + discountGross);
    return {
      itemSeq: index + 1,
      itemCd: clip(line.itemCode, 20),
      itemClsCd: clip(line.classificationCode, 10),
      itemNm: clip(line.description, 200),
      bcd: null,
      pkgUnitCd: line.packageUnitCode,
      pkg: 1,
      qtyUnitCd: line.quantityUnitCode,
      qty: line.quantity,
      prc: roundMoney(supplyAmount / line.quantity),
      splyAmt: supplyAmount,
      dcRt: supplyAmount > 0 ? roundMoney((discountGross / supplyAmount) * 100) : 0,
      dcAmt: discountGross,
      isrccCd: null,
      isrccNm: null,
      isrcRt: null,
      isrcAmt: null,
      taxTyCd: line.taxType,
      taxblAmt: roundMoney(line.totalAmount),
      taxAmt: roundMoney(line.taxAmount),
      totAmt: roundMoney(line.totalAmount),
    };
  });

  const taxable: Record<string, number> = {};
  const tax: Record<string, number> = {};
  const rate: Record<string, number> = { ...DEFAULT_TAX_RATES };
  for (const type of TAX_TYPES) {
    taxable[type] = 0;
    tax[type] = 0;
  }
  lines.forEach((line, index) => {
    taxable[line.taxType] += items[index].taxblAmt;
    tax[line.taxType] += items[index].taxAmt;
    rate[line.taxType] = line.taxRate;
  });

  const taxFields: Record<string, number> = {};
  for (const type of TAX_TYPES) {
    taxFields[`taxblAmt${type}`] = roundMoney(taxable[type]);
    taxFields[`taxRt${type}`] = rate[type];
    taxFields[`taxAmt${type}`] = roundMoney(tax[type]);
  }

  const totalTaxable = roundMoney(items.reduce((sum, item) => sum + item.taxblAmt, 0));
  const totalTax = roundMoney(items.reduce((sum, item) => sum + item.taxAmt, 0));
  const total = roundMoney(items.reduce((sum, item) => sum + item.totAmt, 0));

  const customerPin = text(snapshot, "clientKraPin").toUpperCase();
  const customerName = clip(text(snapshot, isNote ? "clientName" : "clientLegalName"), 60);
  const confirmedAt = snapshot.approvedAt ?? snapshot.confirmedAt;
  const operatorId = clip(text(snapshot, isNote ? "confirmedByAdminId" : "approverId"), 20) || "IFTA";
  const operatorName = clip(text(snapshot, "approverName") || "IFTA Consulting", 60);
  const seller = asRow(snapshot.seller);
  const reference = text(snapshot, isNote ? "noteNumber" : "traderInvoiceNumber");
  const reasonCode = text(snapshot, "reasonCode");

  return {
    tin: context.tin,
    bhfId: context.branchId,
    invcNo: sequence,
    orgInvcNo: originalSequence,
    custTin: customerPin || null,
    custNm: customerName || null,
    salesTyCd: "N",
    rcptTyCd: envelope.kind === "CREDIT_NOTE" ? "R" : "S",
    pmtTyCd: paymentTypeCode(snapshot.paymentMethod),
    salesSttsCd: "02",
    cfmDt: kraDateTime(confirmedAt),
    salesDt: kraDate(isNote ? confirmedAt : snapshot.invoiceDate),
    stockRlsDt: null,
    cnclReqDt: null,
    cnclDt: null,
    rfdDt: envelope.kind === "CREDIT_NOTE" ? kraDateTime(confirmedAt) : null,
    rfdRsnCd: envelope.kind === "CREDIT_NOTE" ? (/^\d{2}$/.test(reasonCode) ? reasonCode : "06") : null,
    totItemCnt: items.length,
    ...taxFields,
    totTaxblAmt: totalTaxable,
    totTaxAmt: totalTax,
    totAmt: total,
    prchrAcptcYn: "N",
    remark: clip(reference ? `${envelope.kind === "SALE" ? "Invoice" : "Note"} ${reference}` : "", 400) || null,
    regrId: operatorId,
    regrNm: operatorName,
    modrId: operatorId,
    modrNm: operatorName,
    receipt: {
      custTin: customerPin || null,
      custMblNo: null,
      rptNo: 1,
      trdeNm: clip(text(seller, "tradingName") || text(seller, "legalName"), 100) || null,
      adrs: clip(text(seller, "address"), 200) || null,
      topMsg: null,
      btmMsg: null,
      prchrAcptcYn: "N",
    },
    itemList: items,
  };
}

/** Body for registering a service/item with KRA before it can appear on a sale. */
export function buildItemRegistrationPayload(
  item: {
    itemCode: string;
    classificationCode: string;
    title: string;
    taxTypeCode: string;
    quantityUnitCode: string;
    packageUnitCode?: string;
  },
  context: KraPayloadContext & { operatorName?: string },
) {
  const operator = clip(context.operatorName || "IFTA", 60);
  return {
    tin: context.tin,
    bhfId: context.branchId,
    itemCd: clip(item.itemCode, 20),
    itemClsCd: clip(item.classificationCode, 10),
    itemTyCd: "3", // 1 raw material, 2 finished product, 3 service
    itemNm: clip(item.title, 200),
    itemStdNm: null,
    orgnNatCd: "KE",
    pkgUnitCd: item.packageUnitCode || context.defaultPackageUnitCode || "NT",
    qtyUnitCd: item.quantityUnitCode || "U",
    taxTyCd: item.taxTypeCode.toUpperCase(),
    btchNo: null,
    bcd: null,
    dftPrc: 0,
    grpPrcL1: null,
    grpPrcL2: null,
    grpPrcL3: null,
    grpPrcL4: null,
    grpPrcL5: null,
    addInfo: null,
    sftyQty: null,
    isrcAplcbYn: "N",
    useYn: "Y",
    regrNm: operator,
    regrId: "IFTA",
    modrNm: operator,
    modrId: "IFTA",
  };
}

/** KRA's public receipt-verification link: base + TIN + branch + receipt signature. */
export function buildReceiptQrUrl(qrBaseUrl: string, tin: string, branchId: string, receiptSignature: string) {
  if (!receiptSignature) return "";
  return `${qrBaseUrl}${tin}${branchId}${receiptSignature}`;
}
