import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";

describe("unified camera grocery flow", () => {
  beforeEach(() => window.localStorage.clear());

  it("scans, confirms, and adds a grocery without leaving the scanner", async () => {
    const user = userEvent.setup();
    render(<App skipIntro />);

    await user.click(screen.getByRole("button", { name: "Scan groceries" }));
    await user.click(screen.getByRole("button", { name: "Open camera scanner" }));
    expect(screen.getByRole("heading", { name: "Enable camera access" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Camera scanner" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Enable camera" }));

    expect(screen.getByRole("dialog", { name: "Camera scanner" })).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Is this it?" }, { timeout: 2500 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    expect(screen.getByText("Estimated use-first date")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Yes, add it" }));

    expect(screen.getByText("1 added")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open camera scanner" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Finish" }));
    expect(screen.getByText("Everything is ready")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add 1 grocery to my fridge" }));
    expect(screen.getByRole("heading", { name: "Groceries added" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "View my fridge" }));
    expect(screen.getByRole("heading", { name: "My Fridge" })).toBeInTheDocument();
    expect(screen.getByText("1 grocery added.")).toBeInTheDocument();
  });

  it("keeps manual entry as a fallback inside the batch", async () => {
    const user = userEvent.setup();
    render(<App skipIntro />);

    await user.click(screen.getByRole("button", { name: "Scan groceries" }));
    await user.click(screen.getByRole("button", { name: /enter an item manually/i }));
    await user.type(screen.getByLabelText(/item name/i), "Greek yogurt");
    await user.type(screen.getByLabelText(/quantity/i), "2 cups");
    await user.click(screen.getByRole("button", { name: "Add to batch" }));

    expect(screen.getByText("Greek yogurt")).toBeInTheDocument();
    expect(screen.getByText(/added manually/i)).toBeInTheDocument();
  });

  it("recovers from denied camera access through iPhone settings or manual entry", async () => {
    const user = userEvent.setup();
    render(<App skipIntro />);

    await user.click(screen.getByRole("button", { name: "Scan groceries" }));
    await user.click(screen.getByRole("button", { name: "Open camera scanner" }));
    await user.click(screen.getByRole("button", { name: "Not now" }));

    expect(screen.getByRole("heading", { name: "Camera access is off" })).toBeInTheDocument();
    expect(screen.getByText("Open iPhone Settings.")).toBeInTheDocument();
    expect(screen.getByText(/find the browser you used/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Enter manually" }));
    expect(screen.getByRole("heading", { name: "Enter grocery manually" })).toBeInTheDocument();
  });

  it("provides recoverable camera uncertainty states", async () => {
    const user = userEvent.setup();
    render(<App skipIntro />);

    await user.click(screen.getByRole("button", { name: "Scan groceries" }));
    await user.click(screen.getByText("Try a prototype detection"));
    await user.click(screen.getByRole("button", { name: "Open camera uncertainty states" }));
    await user.click(screen.getByRole("button", { name: "Enable camera" }));

    expect(screen.getByRole("heading", { name: "Try an uncertainty state" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Nothing detected" }));
    expect(screen.getByRole("heading", { name: "We couldn’t find a product" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back to uncertainty states" }));

    await user.click(screen.getByRole("button", { name: "Multiple products" }));
    expect(screen.getByRole("heading", { name: "Show one item at a time" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back to uncertainty states" }));

    await user.click(screen.getByRole("button", { name: "Low-confidence match" }));
    expect(screen.getByRole("heading", { name: "Which item is this?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Greek Yogurt/i })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Back to uncertainty states" }));

    await user.click(screen.getByRole("button", { name: "Conflicting results" }));
    expect(screen.getByRole("heading", { name: "Two results disagree" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back to uncertainty states" }));

    await user.click(screen.getByRole("button", { name: "Unreadable printed date" }));
    expect(screen.getByRole("heading", { name: "The date isn’t readable" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Enter the date manually" }));

    expect(screen.getByRole("heading", { name: "Review corrected item" })).toBeInTheDocument();
    expect(screen.getByLabelText(/item name/i)).toHaveValue("Whole Milk");
    expect(screen.getByLabelText(/storage note/i)).toHaveValue("Printed date needs confirmation.");
  });

  it("reviews only the uncertain grocery at the end of a batch", async () => {
    const user = userEvent.setup();
    render(<App skipIntro />);

    await user.click(screen.getByRole("button", { name: "Scan groceries" }));
    for (let index = 0; index < 3; index += 1) {
      await user.click(screen.getByRole("button", { name: "Open camera scanner" }));
      if (index === 0) {
        await user.click(screen.getByRole("button", { name: "Enable camera" }));
      }
      await screen.findByRole("heading", { name: "Is this it?" }, { timeout: 2500 });
      await user.click(screen.getByRole("button", { name: "Yes, add it" }));
    }
    await user.click(screen.getByRole("button", { name: "Finish" }));

    expect(screen.getByRole("status")).toHaveTextContent("1item needs review");
    expect(screen.getByRole("heading", { name: "Chicken Thighs" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Whole Milk" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Large Brown Eggs" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirm item" }));
    expect(screen.getByText("Everything is ready")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add 3 groceries to my fridge" })).toBeEnabled();
  });

  it("adds an AI-assisted leftover after asking only the needed questions", async () => {
    const user = userEvent.setup();
    render(<App skipIntro />);

    await user.click(screen.getByRole("button", { name: "Scan groceries" }));
    await user.click(screen.getByRole("button", { name: "Open camera scanner" }));
    await user.click(screen.getByRole("button", { name: "Enable camera" }));
    await user.click(screen.getByRole("button", { name: "Try unpackaged food demo" }));

    expect(
      await screen.findByRole("heading", { name: "Confirm the food" }, { timeout: 2500 }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Yes, this is correct" }));

    expect(screen.getByRole("heading", { name: "When was it opened or prepared?" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Today" }));
    expect(screen.getByRole("heading", { name: "Has it stayed refrigerated?" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Yes, continuously refrigerated" }));

    expect(screen.getByText("Recommended use by")).toBeInTheDocument();
    expect(screen.getByText("Source: FoodSafety.gov Cold Food Storage Chart")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add to current batch" }));

    expect(screen.getByText("1 added")).toBeInTheDocument();
    expect(screen.getByText("Leftover Tuna")).toBeInTheDocument();
    expect(screen.getByText(/added from photo/i)).toBeInTheDocument();
  });

  it("skips follow-up questions for a confirmed printed package date", async () => {
    const user = userEvent.setup();
    render(<App skipIntro />);

    await user.click(screen.getByRole("button", { name: "Scan groceries" }));
    await user.click(screen.getByText("Try a prototype detection"));
    await user.click(screen.getByRole("button", { name: "Open photo edge-case scenarios" }));
    await user.click(screen.getByText("Try a prototype scenario"));
    await user.click(screen.getByRole("button", { name: "Try packaged salsa demo" }));

    expect(await screen.findByRole("heading", { name: "Confirm the food" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Yes, this is correct" }));

    expect(screen.getByRole("heading", { name: "Review printed date" })).toBeInTheDocument();
    expect(screen.getByText("Best if used by")).toBeInTheDocument();
    expect(screen.queryByText(/Question 1 of 2/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirm date and add to batch" }));

    expect(screen.getByText("Salsa Verde")).toBeInTheDocument();
    expect(screen.getByText("1 added")).toBeInTheDocument();
  });

  it("lets the user review an uploaded photo before analysis", async () => {
    const user = userEvent.setup();
    const { container } = render(<App skipIntro />);

    await user.click(screen.getByRole("button", { name: "Scan groceries" }));
    await user.click(screen.getByText("Try a prototype detection"));
    await user.click(screen.getByRole("button", { name: "Open photo edge-case scenarios" }));

    const cameraInput = container.querySelector(
      'input[type="file"][capture="environment"]',
    ) as HTMLInputElement;
    await user.upload(cameraInput, new File(["food"], "tuna.jpg", { type: "image/jpeg" }));

    expect(screen.getByRole("heading", { name: "Review photo" })).toBeInTheDocument();
    expect(screen.getByAltText("Food selected for review")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Analyze this photo" }));

    expect(await screen.findByRole("heading", { name: "Confirm the food" })).toBeInTheDocument();
  });

  it("offers recovery when a photo is unclear or analysis fails", async () => {
    const user = userEvent.setup();
    render(<App skipIntro />);

    await user.click(screen.getByRole("button", { name: "Scan groceries" }));
    await user.click(screen.getByText("Try a prototype detection"));
    await user.click(screen.getByRole("button", { name: "Open photo edge-case scenarios" }));
    await user.click(screen.getByText("Try a prototype scenario"));
    await user.click(screen.getByRole("button", { name: "Try unclear photo recovery" }));

    expect(
      await screen.findByRole("heading", { name: "We couldn't read this photo" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No food suggestion was created")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try another photo" }));
    await user.click(screen.getByText("Try a prototype scenario"));
    await user.click(screen.getByRole("button", { name: "Try analysis error recovery" }));

    expect(
      await screen.findByRole("heading", { name: "Analysis didn't finish" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try analysis again" }));
    expect(await screen.findByRole("heading", { name: "Confirm the food" })).toBeInTheDocument();
  });

  it("carries a corrected food name into manual details", async () => {
    const user = userEvent.setup();
    render(<App skipIntro />);

    await user.click(screen.getByRole("button", { name: "Scan groceries" }));
    await user.click(screen.getByText("Try a prototype detection"));
    await user.click(screen.getByRole("button", { name: "Open photo edge-case scenarios" }));
    await user.click(screen.getByText("Try a prototype scenario"));
    await user.click(screen.getByRole("button", { name: "Try leftover tuna demo" }));
    expect(await screen.findByRole("heading", { name: "Confirm the food" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "No, correct the item" }));

    const correctedName = screen.getByLabelText("Food name");
    expect(correctedName).toHaveValue("Tuna");
    await user.clear(correctedName);
    await user.type(correctedName, "Chicken salad");
    await user.click(screen.getByRole("button", { name: "Continue with this name" }));

    expect(screen.getByRole("heading", { name: "Review corrected item" })).toBeInTheDocument();
    expect(screen.getByLabelText(/item name/i)).toHaveValue("Chicken salad");
  });

  it("provides a file-upload fallback when the camera is unavailable", async () => {
    const user = userEvent.setup();
    render(<App skipIntro />);

    await user.click(screen.getByRole("button", { name: "Scan groceries" }));
    await user.click(screen.getByText("Try a prototype detection"));
    await user.click(screen.getByRole("button", { name: "Open photo edge-case scenarios" }));
    await user.click(screen.getByText("Try a prototype scenario"));
    await user.click(screen.getByRole("button", { name: "Try camera unavailable" }));

    expect(
      screen.getByRole("heading", { name: "Camera access is unavailable" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Choose existing photo" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Enter manually instead" })).toBeEnabled();
  });

  it("does not generate a precise date when preparation context is unknown", async () => {
    const user = userEvent.setup();
    render(<App skipIntro />);

    await user.click(screen.getByRole("button", { name: "Scan groceries" }));
    await user.click(screen.getByText("Try a prototype detection"));
    await user.click(screen.getByRole("button", { name: "Open photo edge-case scenarios" }));
    await user.click(screen.getByText("Try a prototype scenario"));
    await user.click(screen.getByRole("button", { name: "Try leftover tuna demo" }));
    expect(await screen.findByRole("heading", { name: "Confirm the food" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Yes, this is correct" }));
    await user.click(screen.getByRole("button", { name: "I'm not sure" }));

    expect(screen.getByRole("heading", { name: "More context is needed" })).toBeInTheDocument();
    expect(screen.getByText("No recommended date was generated")).toBeInTheDocument();
    expect(screen.queryByText("Recommended use by")).not.toBeInTheDocument();
  });

  it("announces a missing required manual item name", async () => {
    const user = userEvent.setup();
    render(<App skipIntro />);

    await user.click(screen.getByRole("button", { name: "Scan groceries" }));
    await user.click(screen.getByRole("button", { name: /enter an item manually/i }));
    await user.click(screen.getByRole("button", { name: "Add to batch" }));

    expect(screen.getByText(/enter an item name before saving/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/item name/i)).toHaveAttribute("aria-invalid", "true");
  });

  it("moves between home, fridge, scan, and settings", async () => {
    const user = userEvent.setup();
    render(<App skipIntro />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset camera permission" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "My Fridge" }));
    expect(screen.getByRole("heading", { name: "My Fridge" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Home" }));
    expect(screen.getByRole("heading", { name: "Your fridge" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Scan" }));
    expect(screen.getByRole("heading", { name: "Scan groceries" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Scan" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
