import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OpeningAnimation } from "./OpeningAnimation";

describe("OpeningAnimation", () => {
  it("allows the intro to be skipped", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OpeningAnimation onComplete={onComplete} />);

    await user.click(
      screen.getByRole("button", { name: "Skip intro animation" }),
    );
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
