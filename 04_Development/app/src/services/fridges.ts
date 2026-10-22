import type { InventoryItem } from "../types/inventory";

export interface Fridge {
  id: string;
  name: string;
}
export const mainFridgeId = "main-fridge";
export const fridgeStorageKey = "crocs-fridges-v1";
export interface FridgeState {
  fridges: Fridge[];
  selectedId: string;
}

export function loadFridges(items: InventoryItem[]): FridgeState {
  let fridges: Fridge[] = [{ id: mainFridgeId, name: "Main fridge" }];
  let selectedId = mainFridgeId;
  try {
    const saved = JSON.parse(localStorage.getItem(fridgeStorageKey) || "null");
    if (saved && Array.isArray(saved.fridges)) {
      const valid: Fridge[] = saved.fridges.filter(
        (f: Fridge) =>
          f &&
          typeof f.id === "string" &&
          f.id &&
          typeof f.name === "string" &&
          f.name.trim(),
      );
      fridges = [
        ...fridges,
        ...valid.filter(
          (f, i) =>
            f.id !== mainFridgeId &&
            valid.findIndex((v) => v.id === f.id) === i,
        ),
      ];
      selectedId = saved.selectedId;
    }
  } catch {
    /* Recover metadata without discarding inventory. */
  }
  for (const item of items) {
    if (item.fridgeId && !fridges.some((f) => f.id === item.fridgeId)) {
      fridges.push({
        id: item.fridgeId,
        name: `Recovered fridge ${fridges.length}`,
      });
    }
  }
  return {
    fridges,
    selectedId: fridges.some((f) => f.id === selectedId)
      ? selectedId
      : mainFridgeId,
  };
}

export function validateFridgeName(
  name: string,
  fridges: Fridge[],
): string | undefined {
  if (!name.trim()) return "Enter a fridge name.";
  if (name.trim().length > 40) return "Use 40 characters or fewer.";
  if (fridges.some((f) => f.name.toLowerCase() === name.trim().toLowerCase()))
    return "A fridge with this name already exists.";
}
