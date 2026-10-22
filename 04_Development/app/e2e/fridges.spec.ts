import { expect, test } from "@playwright/test";
for (const width of [390, 1440]) {
  test(`multiple fridges preserve legacy items and assignments at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("./?prototype&skipIntro");
    await page.evaluate(() => {
      localStorage.setItem(
        "crocs-refrigerator-inventory-v01",
        JSON.stringify([
          {
            id: "legacy",
            name: "Legacy apples",
            quantity: "3",
            addedAt: "2026-10-21",
            expiresAt: "2026-10-28",
            entryMethod: "manual",
            recognitionOutcome: null,
            createdAt: "2026-10-21",
            updatedAt: "2026-10-21",
          },
        ]),
      );
      localStorage.removeItem("crocs-fridges-v1");
    });
    await page.reload();
    await page.getByRole("button", { name: "My Fridge", exact: true }).click();
    await expect(
      page.getByRole("button", { name: /Legacy apples/ }),
    ).toBeVisible();
    await page.getByRole("button", { name: "New fridge", exact: true }).click();
    await page.getByLabel("Fridge name", { exact: true }).fill(" main fridge ");
    await page.getByRole("button", { name: "Create fridge" }).click();
    await expect(page.getByRole("alert")).toContainText("already exists");
    await page.getByLabel("Fridge name", { exact: true }).fill("Garage fridge");
    await page.getByRole("button", { name: "Create fridge" }).click();
    await expect(
      page.getByRole("button", { name: /Legacy apples/ }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Home", exact: true }).click();
    await page
      .getByRole("main")
      .getByRole("button", { name: "Scan groceries", exact: true })
      .click();
    await expect(page.getByLabel("Add batch to")).toHaveValue(/.+/);
    await page
      .getByRole("button", { name: "Enter an item manually", exact: true })
      .click();
    await page.getByLabel("Item name *").fill("Garage carrots");
    await page.getByLabel("Quantity", { exact: true }).fill("2");
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
      page.getByRole("button", { name: /Garage carrots/ }),
    ).toBeVisible();
    await page
      .getByLabel("Current fridge")
      .selectOption({ label: "Main fridge" });
    await expect(
      page.getByRole("button", { name: /Garage carrots/ }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: /Legacy apples/ }).click();
    await page
      .getByLabel("Move to fridge")
      .selectOption({ label: "Garage fridge" });
    await page.getByRole("button", { name: "Move item", exact: true }).click();
    await expect(
      page.getByRole("button", { name: /Legacy apples/ }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByLabel("Current fridge").locator("option:checked"),
    ).toHaveText("Garage fridge");
    await page.getByRole("button", { name: "My Fridge", exact: true }).click();
    await expect(
      page.getByRole("button", { name: /Garage carrots/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Legacy apples/ }),
    ).toBeVisible();
    const saved = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("crocs-refrigerator-inventory-v01")!),
    );
    expect(
      saved.find((item: { id: string }) => item.id === "legacy"),
    ).toMatchObject({ quantity: "3", expiresAt: "2026-10-28" });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `reports/r09-fridges-${width}.png`,
      fullPage: true,
    });
  });
}
