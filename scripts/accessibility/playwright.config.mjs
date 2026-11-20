import { defineConfig } from "@playwright/test";
import { join } from "node:path";

const { PILOT_URL, PILOT_OUTPUT } = process.env;
if (!PILOT_OUTPUT || new URL(PILOT_URL).hostname !== "127.0.0.1") {
  throw new Error("Start the disposable sandbox with scripts/accessibility/run.sh");
}

export default defineConfig({
  testMatch: "pilot.spec.mjs",
  outputDir: join(PILOT_OUTPUT, "playwright"),
  workers: 1,
  timeout: 180_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: PILOT_URL,
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    viewport: { width: 1440, height: 900 },
  },
});
