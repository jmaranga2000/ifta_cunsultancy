import * as nextEnv from "@next/env";

const envLoader = nextEnv as typeof nextEnv & { default?: typeof nextEnv };
(envLoader.loadEnvConfig ?? envLoader.default?.loadEnvConfig)?.(process.cwd());

/**
 * Registers every active service mapping with KRA so it can appear on invoices.
 *
 *   npm run etims:register-items
 *
 * KRA only accepts a sale whose item codes it already knows. Run this after
 * adding or editing service mappings in Finance > eTIMS > Service mappings.
 */
async function main() {
  const { resolveEtimsEnv } = await import("@/features/etims/env-config");
  const { KraEtimsConnector } = await import("@/features/etims/kra-connector");
  const { listEtimsServiceMappings } = await import("@/repositories/etims-configuration-repository");

  const env = resolveEtimsEnv();
  if (!env) {
    console.error("Set ETIMS_MODE=OSCU (or VSCU) in .env first. See .env.example.");
    process.exit(1);
  }
  if (env.missing.length) {
    console.error(`Finish the eTIMS settings in .env first: ${env.missing.join(", ")}`);
    process.exit(1);
  }

  const connector = new KraEtimsConnector({
    mode: env.mode,
    baseUrl: env.baseUrl,
    tin: env.tin,
    branchId: env.branchId,
    deviceSerial: env.deviceSerial,
    cmcKey: env.cmcKey,
    paths: env.paths,
    qrBaseUrl: env.qrBaseUrl,
    retryableResultCodes: env.retryableResultCodes,
  });

  const mappings = (await listEtimsServiceMappings()).filter((mapping) => mapping.mapped && mapping.active);
  if (!mappings.length) {
    console.log("No active service mappings found. Create them in Finance > eTIMS > Service mappings first.");
    return;
  }

  let failed = 0;
  for (const mapping of mappings) {
    if (!mapping.itemCode || !mapping.classificationCode) {
      failed += 1;
      console.log(`SKIPPED  ${mapping.serviceTitle}: add an item code and classification code first.`);
      continue;
    }
    const result = await connector.registerItem({
      itemCode: mapping.itemCode,
      classificationCode: mapping.classificationCode,
      title: mapping.serviceTitle,
      taxTypeCode: mapping.taxTypeCode,
      quantityUnitCode: mapping.quantityUnitCode,
      packageUnitCode: mapping.packageUnitCode,
    });
    if (!result.ok) failed += 1;
    console.log(`${result.ok ? "OK      " : "FAILED  "} ${mapping.serviceTitle} (${mapping.itemCode}): ${result.message}`);
  }
  console.log(failed ? `\n${failed} item(s) need attention.` : "\nAll items are registered with KRA.");
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
