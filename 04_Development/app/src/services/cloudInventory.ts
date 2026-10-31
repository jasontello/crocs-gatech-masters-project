import { createClient } from "@supabase/supabase-js";
import type { InventoryItem } from "../types/inventory";
import type { FridgeState } from "./fridges";

// Publishable browser key. Access to rows is enforced by database RLS.
export const supabase = createClient(
  "https://tvviwewkfmynbaydiazr.supabase.co",
  "sb_publishable_z92bXueh_xo2A6fBYHtolA_fvpMf-Dr",
);
export interface InventorySnapshot {
  items: InventoryItem[];
  fridgeState: FridgeState;
}
export const emptySnapshot = (): InventorySnapshot => ({
  items: [],
  fridgeState: {
    fridges: [{ id: "main-fridge", name: "Main fridge" }],
    selectedId: "main-fridge",
  },
});
export function parseSnapshot(
  items: unknown,
  fridgeState: unknown,
): InventorySnapshot {
  const state = fridgeState as FridgeState;
  if (
    !Array.isArray(items) ||
    !state ||
    !Array.isArray(state.fridges) ||
    !state.fridges.length ||
    !state.fridges.every(
      (f) => f && typeof f.id === "string" && typeof f.name === "string",
    ) ||
    !state.fridges.some((f) => f.id === state.selectedId) ||
    !items.every(
      (i) =>
        i &&
        typeof i.id === "string" &&
        typeof i.name === "string" &&
        typeof i.addedAt === "string" &&
        state.fridges.some((f) => f.id === i.fridgeId),
    )
  ) {
    throw new Error(
      "Saved inventory could not be read. Your account data has not been changed.",
    );
  }
  return { items, fridgeState: state };
}
export async function loadCloudInventory(userId: string) {
  const { data, error } = await supabase
    .from("inventory_snapshots")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error)
    throw new Error(
      "Unable to load your account inventory. Check your connection and try again.",
    );
  return {
    snapshot: data
      ? parseSnapshot(data.items, data.fridge_state)
      : emptySnapshot(),
    revision: data?.revision ?? 0,
  };
}
export async function saveCloudInventory(
  userId: string,
  snapshot: InventorySnapshot,
  revision: number,
) {
  const row = {
    user_id: userId,
    items: snapshot.items,
    fridge_state: snapshot.fridgeState,
    revision: revision + 1,
    updated_at: new Date().toISOString(),
  };
  const query =
    revision === 0
      ? supabase.from("inventory_snapshots").insert(row)
      : supabase
          .from("inventory_snapshots")
          .update(row)
          .eq("user_id", userId)
          .eq("revision", revision);
  const { data, error } = await query.select("revision").maybeSingle();
  if (error?.code === "23505" || (!error && !data))
    throw new Error(
      "Another session saved changes. Refresh from account before editing again. Your current changes have not been saved.",
    );
  if (error)
    throw new Error(
      "Save failed. Your changes are still on this screen. Check your connection and try again.",
    );
  return data!.revision as number;
}
