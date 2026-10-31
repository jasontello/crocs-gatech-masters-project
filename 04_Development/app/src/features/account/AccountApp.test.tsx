import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import AccountApp from "./AccountApp";
import {
  loadCloudInventory,
  saveCloudInventory,
} from "../../services/cloudInventory";
import { inventoryStorageKey } from "../../services/inventoryRepository";
const state = vi.hoisted(() => ({
  user: { id: "account-a", email: "test@example.test" },
}));
vi.mock("../../services/cloudInventory", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../services/cloudInventory")>();
  return {
    ...actual,
    loadCloudInventory: vi.fn(),
    saveCloudInventory: vi.fn(),
    supabase: {
      auth: {
        onAuthStateChange: (
          callback: (event: string, session: unknown) => void,
        ) => {
          callback("INITIAL_SESSION", { user: state.user });
          return { data: { subscription: { unsubscribe: vi.fn() } } };
        },
      },
    },
  };
});
const snapshot = {
  items: [],
  fridgeState: {
    fridges: [{ id: "main-fridge", name: "Main fridge" }],
    selectedId: "main-fridge",
  },
};
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  vi.mocked(loadCloudInventory).mockResolvedValue({ snapshot, revision: 0 });
  vi.mocked(saveCloudInventory).mockResolvedValue(1);
});
it("loads an empty account without copying sample groceries or replacing browser data", async () => {
  localStorage.setItem(inventoryStorageKey, '[{"id":"local-only"}]');
  render(<AccountApp skipIntro />);
  await screen.findByRole("button", { name: "Save to account" });
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Save to account" }),
    ).toBeEnabled(),
  );
  expect(localStorage.getItem(inventoryStorageKey)).toBe(
    '[{"id":"local-only"}]',
  );
  expect(saveCloudInventory).not.toHaveBeenCalled();
  await userEvent.click(
    screen.getByRole("button", { name: "Save to account" }),
  );
  expect(saveCloudInventory).toHaveBeenCalledWith("account-a", snapshot, 0);
  await screen.findByText(/Saved to your account/);
});
it("fails closed if account loading fails and allows retry", async () => {
  vi.mocked(loadCloudInventory).mockRejectedValueOnce(
    new Error("Network unavailable"),
  );
  render(<AccountApp skipIntro />);
  await screen.findByRole("alert");
  expect(
    screen.getByRole("button", { name: "Save to account" }),
  ).toBeDisabled();
  expect(
    screen.queryByRole("heading", { name: "My Fridge" }),
  ).not.toBeInTheDocument();
  await userEvent.click(
    screen.getByRole("button", { name: "Refresh from account" }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Save to account" }),
    ).toBeEnabled(),
  );
});
it("preserves the draft and reports a save failure", async () => {
  vi.mocked(saveCloudInventory).mockRejectedValue(
    new Error("Another session saved changes."),
  );
  render(<AccountApp skipIntro />);
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Save to account" }),
    ).toBeEnabled(),
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Save to account" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent("Another session");
  expect(screen.getByRole("button", { name: "Save to account" })).toBeEnabled();
});
