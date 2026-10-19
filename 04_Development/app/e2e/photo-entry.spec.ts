import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`photo reference and inventory persistence at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("./?prototype&skipIntro");
    await page
      .getByRole("main")
      .getByRole("button", { name: "Scan groceries", exact: true })
      .click();
    await page.getByRole("button", { name: "Add from a real photo" }).click();
    const input = page.getByLabel("Choose grocery photo");
    await input.setInputFiles({
      name: "invalid.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("invalid"),
    });
    await expect(page.getByRole("alert")).toContainText("Choose a JPEG");
    const png = readFileSync("../../03_Design/assets/editorial/whole-milk.png");
    await input.setInputFiles({
      name: "grocery.png",
      mimeType: "image/png",
      buffer: png,
    });
    await expect(page.getByAltText("Selected grocery reference")).toBeVisible();
    await page.getByRole("button", { name: "Remove photo" }).click();
    await expect(page.getByAltText("Selected grocery reference")).toHaveCount(
      0,
    );
    await input.setInputFiles({
      name: "replacement.png",
      mimeType: "image/png",
      buffer: png,
    });
    await expect(
      page.getByText("replacement.png", { exact: true }),
    ).toBeVisible();
    await page.getByLabel("Item name *").fill("R08 photo apples");
    await page.getByLabel("Quantity", { exact: true }).fill("2");
    await page.screenshot({
      path: `reports/r08-photo-${width}.png`,
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Add to batch", exact: true })
      .click();
    await page.getByRole("button", { name: "Finish", exact: true }).click();
    await page
      .getByRole("button", { name: "Confirm item", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Add 1 grocery to my fridge", exact: true })
      .click();
    await page
      .getByRole("button", { name: "View my fridge", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: /R08 photo apples/ }),
    ).toBeVisible();
    await page.reload();
    await page.getByRole("button", { name: "My Fridge", exact: true }).click();
    await expect(
      page.getByRole("button", { name: /R08 photo apples/ }),
    ).toBeVisible();
  });
}
