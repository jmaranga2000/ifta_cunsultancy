/**
 * eTIMS configuration read from environment variables.
 *
 * Set ETIMS_MODE to OSCU or VSCU and fill in the values below in `.env` and
 * the portal talks to KRA with no code changes and no admin-screen setup.
 *
 *   ETIMS_MODE            OSCU (online, hosted by KRA) or VSCU (virtual, the KRA
 *                         VSCU application running on your own server)
 *   ETIMS_ENVIRONMENT     SANDBOX (default) or PRODUCTION
 *   ETIMS_BASE_URL        e.g. https://etims-api-sbx.kra.go.ke/etims-api  (OSCU)
 *                         or   http://localhost:8088                      (VSCU)
 *   ETIMS_TIN             your KRA PIN
 *   ETIMS_BRANCH_ID       branch id, default 00 (head office)
 *   ETIMS_DEVICE_SERIAL   device serial number registered with KRA (OSCU)
 *   ETIMS_CMC_KEY         communication key returned by `npm run etims:init` (OSCU)
 *
 * Endpoint paths have sensible defaults for each mode and can be overridden:
 *   ETIMS_PATH_INIT, ETIMS_PATH_SALES, ETIMS_PATH_CREDIT_NOTE,
 *   ETIMS_PATH_DEBIT_NOTE, ETIMS_PATH_ITEM
 */

export type EtimsMode = "OSCU" | "VSCU";
export type EtimsEnvironment = "SANDBOX" | "PRODUCTION";

export type EtimsEnvConfig = {
  enabled: boolean;
  mode: EtimsMode;
  environment: EtimsEnvironment;
  baseUrl: string;
  tin: string;
  branchId: string;
  deviceSerial: string;
  cmcKey: string;
  paths: {
    init: string;
    sales: string;
    creditNote: string;
    debitNote: string;
    item: string;
  };
  qrBaseUrl: string;
  /** KRA result codes that mean "try again later" rather than "rejected". */
  retryableResultCodes: string[];
  missing: string[];
};

type EnvSource = Record<string, string | undefined>;

const DEFAULT_PATHS: Record<EtimsMode, { init: string; sales: string }> = {
  OSCU: { init: "/selectInitOsdcInfo", sales: "/saveTrnsSalesOsdc" },
  VSCU: { init: "/selectInitVsdcInfo", sales: "/saveTrnsSalesVsdc" },
};

const DEFAULT_QR_BASE_URLS: Record<EtimsEnvironment, string> = {
  SANDBOX: "https://etims-sbx.kra.go.ke/common/link/etims/receipt/indexEtimsReceiptData?Data=",
  PRODUCTION: "https://etims.kra.go.ke/common/link/etims/receipt/indexEtimsReceiptData?Data=",
};

const DEFAULT_RETRYABLE_RESULT_CODES = ["990", "991", "992", "993", "994", "995", "996", "997", "998", "999"];

function clean(value: string | undefined) {
  return (value ?? "").trim();
}

function normalisePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  const text = clean(value).toLowerCase();
  if (!text) return fallback;
  return ["1", "true", "yes", "on"].includes(text);
}

/**
 * Returns the environment-driven configuration, or null when ETIMS_MODE is not
 * set (in which case the admin-screen configuration and the generic
 * certified-integrator connector remain in charge).
 */
export function resolveEtimsEnv(source: EnvSource = process.env): EtimsEnvConfig | null {
  const modeText = clean(source.ETIMS_MODE).toUpperCase();
  if (!modeText) return null;
  const mode: EtimsMode = modeText === "VSCU" ? "VSCU" : "OSCU";
  const environment: EtimsEnvironment = clean(source.ETIMS_ENVIRONMENT).toUpperCase() === "PRODUCTION" ? "PRODUCTION" : "SANDBOX";

  const baseUrl = clean(source.ETIMS_BASE_URL).replace(/\/+$/, "");
  const tin = clean(source.ETIMS_TIN).toUpperCase();
  const branchId = clean(source.ETIMS_BRANCH_ID) || "00";
  const deviceSerial = clean(source.ETIMS_DEVICE_SERIAL);
  const cmcKey = clean(source.ETIMS_CMC_KEY);

  const defaults = DEFAULT_PATHS[mode];
  const sales = normalisePath(clean(source.ETIMS_PATH_SALES) || defaults.sales);
  const retryable = clean(source.ETIMS_RETRYABLE_RESULT_CODES)
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean);

  const missing: string[] = [];
  if (!baseUrl) missing.push("ETIMS_BASE_URL");
  else if (!/^https?:\/\//i.test(baseUrl)) missing.push("ETIMS_BASE_URL (must start with http:// or https://)");
  if (!tin) missing.push("ETIMS_TIN");
  if (mode === "OSCU") {
    if (!deviceSerial) missing.push("ETIMS_DEVICE_SERIAL");
    if (!cmcKey) missing.push("ETIMS_CMC_KEY (run `npm run etims:init` to get it)");
  }

  return {
    enabled: parseBoolean(source.ETIMS_ENABLED, true),
    mode,
    environment,
    baseUrl,
    tin,
    branchId,
    deviceSerial,
    cmcKey,
    paths: {
      init: normalisePath(clean(source.ETIMS_PATH_INIT) || defaults.init),
      sales,
      creditNote: normalisePath(clean(source.ETIMS_PATH_CREDIT_NOTE) || sales),
      debitNote: normalisePath(clean(source.ETIMS_PATH_DEBIT_NOTE) || sales),
      item: normalisePath(clean(source.ETIMS_PATH_ITEM) || "/saveItem"),
    },
    qrBaseUrl: clean(source.ETIMS_QR_BASE_URL) || DEFAULT_QR_BASE_URLS[environment],
    retryableResultCodes: retryable.length ? retryable : DEFAULT_RETRYABLE_RESULT_CODES,
    missing,
  };
}
