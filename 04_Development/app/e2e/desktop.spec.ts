import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("laptop layout exposes a desktop workspace and preserves the inventory flow", async ({ page }) => {
  await page.goto("./?prototype&skipIntro");

  const navigation = page.getByRole("navigation", { name: "Desktop primary navigation" });
  await expect(navigation).toBeVisible();
  await expect(page.locator(".bottom-navigation")).toBeHidden();
  await expect(page.getByRole("heading", { name: "Your fridge" })).toBeVisible();
  expect(await page.locator(".app-shell").evaluate((element) => element.getBoundingClientRect().width))
    .toBeGreaterThan(700);

  await navigation.getByRole("button", { name: "My Fridge" }).click();
  await expect(page.getByRole("heading", { name: "My Fridge" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Inventory overview" })).toBeVisible();

  await page.getByRole("searchbox", { name: "Search my fridge" }).fill("milk");
  await expect(page.getByRole("button", { name: /Whole Milk/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Chicken Thighs/ })).toHaveCount(0);

  await navigation.getByRole("button", { name: "Scan groceries" }).click();
  await expect(page.getByRole("heading", { name: "Scan groceries" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Current batch" })).toBeVisible();
  await page.getByRole("button", { name: "Enter an item manually" }).click();
  await expect(page.getByRole("heading", { name: "Enter grocery manually" })).toBeVisible();
  await expect(navigation).toBeVisible();

  await navigation.getByRole("button", { name: "Scan groceries" }).click();
  await page.getByRole("button", { name: "Open camera scanner" }).click();
  await page.getByRole("button", { name: "Enable camera" }).click();
  const cameraDialog = page.getByRole("dialog", { name: "Camera scanner" });
  await expect(cameraDialog).toBeVisible();
  expect((await cameraDialog.boundingBox())?.width).toBeGreaterThan(600);
  await cameraDialog.getByRole("button", { name: "Close" }).click();

  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});

test("desktop home and scanner have no serious accessibility violations", async ({ page }) => {
  await page.goto("./?prototype&skipIntro");
  const navigation = page.getByRole("navigation", { name: "Desktop primary navigation" });

  for (const view of ["home", "scanner"] as const) {
    if (view === "scanner") await navigation.getByRole("button", { name: "Scan groceries" }).click();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(({ impact }) => impact === "serious" || impact === "critical"))
      .toEqual([]);
  }
});
