import * as nextEnv from "@next/env";

const envLoader = nextEnv as typeof nextEnv & { default?: typeof nextEnv };
(envLoader.loadEnvConfig ?? envLoader.default?.loadEnvConfig)?.(process.cwd());

/**
 * One-time KRA device initialisation.
 *
 *   npm run etims:init
 *
 * Reads ETIMS_* from `.env`, asks KRA to initialise the device and prints the
 * communication key to paste into `.env` as ETIMS_CMC_KEY (OSCU only).
 */
async function main() {
  const { resolveEtimsEnv } = await import("@/features/etims/env-config");
  const { KraEtimsConnector } = await import("@/features/etims/kra-connector");

  const env = resolveEtimsEnv();
  if (!env) {
    console.error("Set ETIMS_MODE=OSCU (or VSCU) in .env first. See .env.example.");
    process.exit(1);
  }
  const required = [
    ["ETIMS_BASE_URL", env.baseUrl],
    ["ETIMS_TIN", env.tin],
    ...(env.mode === "OSCU" ? [["ETIMS_DEVICE_SERIAL", env.deviceSerial]] : []),
  ].filter(([, value]) => !value);
  if (required.length) {
    console.error(`Fill these in .env before initialising: ${required.map(([name]) => name).join(", ")}`);
    process.exit(1);
  }

  console.log(`Initialising ${env.mode} (${env.environment}) at ${env.baseUrl}${env.paths.init} ...`);
  const result = await new KraEtimsConnector({
    mode: env.mode,
    baseUrl: env.baseUrl,
    tin: env.tin,
    branchId: env.branchId,
    deviceSerial: env.deviceSerial,
    cmcKey: env.cmcKey,
    paths: env.paths,
    qrBaseUrl: env.qrBaseUrl,
    retryableResultCodes: env.retryableResultCodes,
  }).initialize();

  if (!result.ok) {
    console.error(`KRA did not initialise the device: ${result.message}`);
    if ("code" in result && result.code === "902") {
      console.error("Code 902 means this device was already initialised. Use the communication key you saved the first time.");
    }
    process.exit(1);
  }

  console.log(`Taxpayer: ${result.taxpayerName || "(not returned)"}   Branch: ${result.branchName || env.branchId}`);
  if (result.controlUnitId) console.log(`Control unit: ${result.controlUnitId}`);
  if (result.cmcKey) {
    console.log("\nAdd this line to your .env file, then restart the app:\n");
    console.log(`ETIMS_CMC_KEY=${result.cmcKey}\n`);
  } else {
    console.log("KRA returned no communication key (normal for VSCU). Nothing else to add.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
