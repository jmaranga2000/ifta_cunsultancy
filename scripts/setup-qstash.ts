import * as nextEnv from "@next/env";

const envLoader = nextEnv as typeof nextEnv & {
  default?: typeof nextEnv;
};

(envLoader.loadEnvConfig ?? envLoader.default?.loadEnvConfig)?.(process.cwd());

async function main() {
  const { ensureEtimsQStashSchedule } = await import("@/lib/qstash");
  const schedule = await ensureEtimsQStashSchedule();
  console.log(
    `${schedule.created ? "Created" : "Updated"} QStash eTIMS schedule ${schedule.scheduleId}.`,
  );
  console.log(`Destination: ${schedule.destination}`);
  console.log(`Schedule: ${schedule.cron}`);
}

main().catch((error) => {
  console.error(
    error instanceof Error
      ? error.message
      : "Unable to configure the QStash eTIMS schedule.",
  );
  process.exitCode = 1;
});
