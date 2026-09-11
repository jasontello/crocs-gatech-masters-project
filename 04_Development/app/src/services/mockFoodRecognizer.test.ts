import { afterEach, describe, expect, it, vi } from "vitest";
import { recognizeFood } from "./mockFoodRecognizer";

describe("recognizeFood", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a deterministic label for known filenames", async () => {
    vi.useFakeTimers();
    const recognition = recognizeFood(
      new File(["image"], "milk-photo.jpg", { type: "image/jpeg" }),
      "success",
    );
    await vi.advanceTimersByTimeAsync(850);
    await expect(recognition).resolves.toMatchObject({ label: "Milk" });
  });

  it("supports the no-result prototype scenario", async () => {
    vi.useFakeTimers();
    const recognition = recognizeFood(
      new File(["image"], "unknown.jpg", { type: "image/jpeg" }),
      "no-result",
    );
    await vi.advanceTimersByTimeAsync(850);
    await expect(recognition).resolves.toBeNull();
  });
});
