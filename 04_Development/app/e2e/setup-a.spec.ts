import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("homepage works at a mobile viewport and has no serious accessibility violations", async ({
  page,
}) => {
  await page.goto("./");

  await expect(page.getByRole("heading", { name: "Your fridge" })).toBeVisible();
  await expect(page.getByText("Georgia Tech CS 8903")).toBeVisible();
  await expect(page.getByRole("button", { name: "Scan groceries" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();

  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(horizontalOverflow).toBe(false);

  const results = await new AxeBuilder({ page }).analyze();
  const seriousViolations = results.violations.filter(({ impact }) =>
    impact === "serious" || impact === "critical",
  );
  expect(seriousViolations).toEqual([]);
});

test("the production build exposes an installable offline PWA shell", async ({
  context,
  page,
}) => {
  await page.goto("./");

  const manifestResponse = await page.request.get("./manifest.webmanifest");
  expect(manifestResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json();
  expect(manifest.name).toBe("CROCS Refrigerator Inventory");
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ sizes: "192x192" }),
      expect.objectContaining({ sizes: "512x512" }),
    ]),
  );

  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker?.getRegistration()))
    .not.toBeNull();

  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Your fridge" })).toBeVisible();
  await context.setOffline(false);
});

test("homepage remains usable in landscape", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("./");

  await expect(page.getByRole("heading", { name: "Your fridge" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Scan groceries" })).toBeVisible();
});
