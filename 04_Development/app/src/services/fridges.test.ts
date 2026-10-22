import { beforeEach, expect, it } from "vitest";
import {
  loadFridges,
  fridgeStorageKey,
  mainFridgeId,
  validateFridgeName,
} from "./fridges";
import type { InventoryItem } from "../types/inventory";
beforeEach(() => localStorage.clear());
it("creates the legacy inventory's Main fridge", () => {
  expect(loadFridges([])).toEqual({
    fridges: [{ id: mainFridgeId, name: "Main fridge" }],
    selectedId: mainFridgeId,
  });
});
it("recovers orphaned fridge references without hiding items", () => {
  localStorage.setItem(fridgeStorageKey, "broken");
  const state = loadFridges([{ fridgeId: "garage" }] as InventoryItem[]);
  expect(state.fridges.map((f) => f.id)).toEqual([mainFridgeId, "garage"]);
});
it("restores valid selection and rejects unknown selection", () => {
  const fridges = [{ id: "garage", name: "Garage" }];
  localStorage.setItem(
    fridgeStorageKey,
    JSON.stringify({ fridges, selectedId: "garage" }),
  );
  expect(loadFridges([]).selectedId).toBe("garage");
  localStorage.setItem(
    fridgeStorageKey,
    JSON.stringify({ fridges, selectedId: "missing" }),
  );
  expect(loadFridges([]).selectedId).toBe(mainFridgeId);
});
it("rejects empty, duplicate and excessive names", () => {
  const fridges = [{ id: mainFridgeId, name: "Main fridge" }];
  expect(validateFridgeName(" ", fridges)).toBeTruthy();
  expect(validateFridgeName(" MAIN FRIDGE ", fridges)).toBeTruthy();
  expect(validateFridgeName("x".repeat(41), fridges)).toBeTruthy();
  expect(validateFridgeName("Garage", fridges)).toBeUndefined();
});
