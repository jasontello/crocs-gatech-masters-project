import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PortraitOnly } from "./PortraitOnly";

describe("PortraitOnly", () => {
  it("keeps the app mounted and provides a landscape instruction", () => {
    render(
      <PortraitOnly>
        <button type="button">App content</button>
      </PortraitOnly>,
    );

    expect(screen.getByRole("button", { name: "App content" })).toBeInTheDocument();
    expect(screen.getByRole("alert", { name: "Portrait mode required" })).toHaveTextContent(
      "Rotate your phone upright",
    );
  });
});
