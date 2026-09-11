import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BottomNavigation } from "./BottomNavigation";

describe("BottomNavigation", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0,
      writable: true,
    });
  });

  it("hides while scrolling down and reappears while scrolling up", () => {
    render(
      <BottomNavigation
        activeSection="home"
        onHome={vi.fn()}
        onInventory={vi.fn()}
        onScan={vi.fn()}
        onSettings={vi.fn()}
      />,
    );

    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(navigation).toHaveAttribute("data-visible", "true");

    window.scrollY = 100;
    fireEvent.scroll(window);
    expect(navigation).toHaveAttribute("data-visible", "false");

    window.scrollY = 70;
    fireEvent.scroll(window);
    expect(navigation).toHaveAttribute("data-visible", "true");
  });

  it("reappears near the top of the page", () => {
    render(
      <BottomNavigation
        activeSection="home"
        onHome={vi.fn()}
        onInventory={vi.fn()}
        onScan={vi.fn()}
        onSettings={vi.fn()}
      />,
    );

    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    window.scrollY = 100;
    fireEvent.scroll(window);
    window.scrollY = 5;
    fireEvent.scroll(window);

    expect(navigation).toHaveAttribute("data-visible", "true");
  });
});
