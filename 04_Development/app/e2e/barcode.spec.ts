import { expect, test } from "@playwright/test";

test("barcode lookup recovers from errors and accepts a corrected product", async ({
  page,
}) => {
  await page.goto("./?prototype&skipIntro");
  await page
    .getByRole("main")
    .getByRole("button", { name: "Scan groceries", exact: true })
    .click();
  const barcode = page.getByLabel("Package barcode");
  const lookup = page.getByRole("button", { name: "Look up product" });
  await barcode.fill("123");
  await lookup.click();
  await expect(
    page.getByText("Enter 8, 12, 13, or 14 barcode digits."),
  ).toBeVisible();
  const api = "**/api/v2/product/**";
  await barcode.fill("3017620422003");
  await page.route(api, (route) => route.fulfill({ status: 404 }));
  await lookup.click();
  await expect(
    page.getByText("No product found.", { exact: false }),
  ).toBeVisible();
  await page.route(api, (route) => route.abort());
  await lookup.click();
  await expect(
    page.getByText("Lookup unavailable.", { exact: false }),
  ).toBeVisible();
  await page.route(api, (route) =>
    route.fulfill({
      json: { status: 1, product: { product_name: "Nutella" } },
    }),
  );
  await lookup.click();
  await expect(page.getByLabel("Item name *")).toHaveValue("Nutella");
  await page.getByLabel("Item name *").fill("Hazelnut spread");
  await page.getByRole("button", { name: "Add to batch" }).click();
  await expect(
    page.getByText("Hazelnut spread added to the batch.", { exact: false }),
  ).toBeVisible();
});

test("reads a barcode image after an unreadable photo and sends the decoded digits to lookup", async ({
  page,
}) => {
  await page.goto("./?prototype&skipIntro");
  await page
    .getByRole("main")
    .getByRole("button", { name: "Scan groceries", exact: true })
    .click();
  const photo = page.getByLabel("Scan a barcode photo");
  await photo.setInputFiles({
    name: "broken.png",
    mimeType: "image/png",
    buffer: Buffer.from("invalid"),
  });
  await expect(
    page.getByRole("status").filter({ hasText: "Could not read the barcode" }),
  ).toBeVisible();
  await photo.setInputFiles("e2e/fixtures/ean13.png");
  await expect(page.getByLabel("Package barcode")).toHaveValue("4006381333931");
  await page.route("**/api/v2/product/4006381333931.json?*", (route) =>
    route.fulfill({
      json: { status: 1, product: { product_name: "Test package" } },
    }),
  );
  await page.getByRole("button", { name: "Look up product" }).click();
  await expect(page.getByLabel("Item name *")).toHaveValue("Test package");
});
