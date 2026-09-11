import type { InventoryItem } from "../../types/inventory";

export type ExpirationState = "fresh" | "use-soon" | "expired" | "unknown";

export interface ExpirationSummary {
  state: ExpirationState;
  label: string;
  daysRemaining: number | null;
}

const startOfLocalDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

export function daysUntil(date: string, now = new Date()): number {
  const target = new Date(`${date}T00:00:00`);
  const millisecondsPerDay = 86_400_000;
  return Math.round(
    (startOfLocalDay(target).getTime() - startOfLocalDay(now).getTime()) /
      millisecondsPerDay,
  );
}

export function getExpirationSummary(
  expiresAt?: string,
  now = new Date(),
): ExpirationSummary {
  if (!expiresAt) {
    return { state: "unknown", label: "Date needs confirmation", daysRemaining: null };
  }

  const daysRemaining = daysUntil(expiresAt, now);

  if (daysRemaining < 0) {
    const daysExpired = Math.abs(daysRemaining);
    return {
      state: "expired",
      label: `Expired ${daysExpired} day${daysExpired === 1 ? "" : "s"} ago`,
      daysRemaining,
    };
  }

  if (daysRemaining === 0) {
    return { state: "use-soon", label: "Use today", daysRemaining };
  }

  if (daysRemaining <= 4) {
    return {
      state: "use-soon",
      label: `Use soon · ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`,
      daysRemaining,
    };
  }

  return {
    state: "fresh",
    label: `Fresh · ${daysRemaining} days left`,
    daysRemaining,
  };
}

export const isExpiringSoon = (item: InventoryItem) =>
  getExpirationSummary(item.expiresAt).state === "use-soon";
