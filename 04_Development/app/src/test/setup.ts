import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

Object.defineProperty(URL, "createObjectURL", {
  writable: true,
  value: () => "blob:prototype-image",
});

Object.defineProperty(URL, "revokeObjectURL", {
  writable: true,
  value: () => undefined,
});

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => undefined,
});
