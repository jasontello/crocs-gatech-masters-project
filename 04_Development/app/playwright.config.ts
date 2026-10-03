import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173/crocs-gatech-masters-project/",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run preview",
    url: "http://127.0.0.1:4173/crocs-gatech-masters-project/",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "mobile-chromium",
      testIgnore: "**/desktop.spec.ts",
      use: { ...devices["iPhone 13"], browserName: "chromium" },
    },
    {
      name: "desktop-chromium",
      testMatch: "**/desktop.spec.ts",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
});
