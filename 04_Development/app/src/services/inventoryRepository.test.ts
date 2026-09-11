import { beforeEach, describe, expect, it } from "vitest";
import type { InventoryItem } from "../types/inventory";
import {
  inventoryStorageKey,
  localInventoryRepository,
} from "./inventoryRepository";

const item: InventoryItem = {
  id: "item-1",
  name: "Spinach",
  addedAt: "2026-08-05",
  entryMethod: "manual",
  recognitionOutcome: null,
  createdAt: "2026-08-05T12:00:00.000Z",
  updatedAt: "2026-08-05T12:00:00.000Z",
};

describe("localInventoryRepository", () => {
  beforeEach(() => window.localStorage.clear());

  it("returns an empty list when storage has not been initialized", () => {
    expect(localInventoryRepository.load()).toEqual([]);
  });

  it("saves and reloads inventory items", () => {
    localInventoryRepository.save([item]);
    expect(localInventoryRepository.load()).toEqual([item]);
  });

  it("rejects malformed stored data", () => {
    window.localStorage.setItem(inventoryStorageKey, JSON.stringify({ item }));
    expect(() => localInventoryRepository.load()).toThrow(
      "Stored inventory is not a list.",
    );
  });
});
