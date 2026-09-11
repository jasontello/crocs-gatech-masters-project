import type { InventoryItem } from "../types/inventory";

const STORAGE_KEY = "crocs-refrigerator-inventory-v01";

export interface InventoryRepository {
  load(): InventoryItem[];
  save(items: InventoryItem[]): void;
}

export const localInventoryRepository: InventoryRepository = {
  load() {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      throw new Error("Stored inventory is not a list.");
    }

    return parsed as InventoryItem[];
  },
  save(items) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },
};

export const inventoryStorageKey = STORAGE_KEY;
