import { describe, expect, it } from "vitest";
import { getExpirationSummary } from "./expiration";

const now = new Date("2026-08-05T12:00:00");

describe("getExpirationSummary", () => {
  it("marks past dates as expired", () => {
    expect(getExpirationSummary("2026-08-03", now)).toEqual({
      state: "expired",
      label: "Expired 2 days ago",
      daysRemaining: -2,
    });
  });

  it("marks the next four days as use soon", () => {
    expect(getExpirationSummary("2026-08-07", now).state).toBe("use-soon");
  });

  it("marks later dates as fresh", () => {
    expect(getExpirationSummary("2026-08-15", now).state).toBe("fresh");
  });

  it("handles an item without an expiration date", () => {
    expect(getExpirationSummary(undefined, now).state).toBe("unknown");
  });
});
