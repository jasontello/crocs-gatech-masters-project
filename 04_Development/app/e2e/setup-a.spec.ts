import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("landing page introduces the research project and has no serious accessibility violations", async ({
  page,
}) => {
  await page.goto("./");

  await expect(page.getByRole("heading", { name: "CROCS Refrigerator Inventory" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "The Problem" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Research Goal" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Prototype", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Current Stage" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Project Information" })).toBeVisible();
  await expect(page.getByText(/Live AI recognition is not implemented/)).toBeVisible();
  await expect(page.getByRole("link", { name: "View GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/jasontello/crocs-gatech-masters-project",
  );

  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(horizontalOverflow).toBe(false);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(({ impact }) => impact === "serious" || impact === "critical"))
    .toEqual([]);
});

test("landing page launches the existing prototype", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("link", { name: "Launch Prototype" }).first().click();

  await expect(page).toHaveURL(/\?prototype$/);
  await expect(page.getByRole("heading", { name: "Your fridge" })).toBeVisible();
  await page.getByRole("button", { name: "Scan groceries" }).click();
  await expect(page.getByRole("heading", { name: "Scan groceries" })).toBeVisible();
});

test("prototype homepage works at a mobile viewport and has no serious accessibility violations", async ({
  page,
}) => {
  await page.goto("./?prototype&skipIntro");

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
  await expect(page.getByRole("heading", { name: "CROCS Refrigerator Inventory" })).toBeVisible();
  await page.getByRole("link", { name: "Launch Prototype" }).first().click();
  await expect(page.getByRole("heading", { name: "Your fridge" })).toBeVisible();
  await context.setOffline(false);
});

test("landing page and prototype remain usable in landscape", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("./");

  await expect(page.getByRole("heading", { name: "CROCS Refrigerator Inventory" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Launch Prototype" }).first()).toBeVisible();
  await page.goto("./?prototype&skipIntro");

  await expect(page.getByRole("heading", { name: "Your fridge" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Scan groceries" })).toBeVisible();
});
