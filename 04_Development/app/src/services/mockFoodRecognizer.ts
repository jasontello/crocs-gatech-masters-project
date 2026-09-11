export type RecognitionScenario = "success" | "no-result" | "error";

export interface RecognitionResult {
  label: string;
  confidence: number;
}

const knownLabels = ["spinach", "milk", "yogurt", "apple", "chicken", "cheese"];

export async function recognizeFood(
  file: File,
  scenario: RecognitionScenario,
): Promise<RecognitionResult | null> {
  await new Promise((resolve) => window.setTimeout(resolve, 850));

  if (scenario === "error") {
    throw new Error("The prototype recognizer could not analyze this image.");
  }

  if (scenario === "no-result") return null;

  const normalizedName = file.name.toLowerCase();
  const matchedLabel = knownLabels.find((label) => normalizedName.includes(label));
  const label = matchedLabel
    ? matchedLabel.charAt(0).toUpperCase() + matchedLabel.slice(1)
    : "Spinach";

  return { label, confidence: 0.84 };
}
