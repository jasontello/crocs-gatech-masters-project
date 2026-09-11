import { ScreenLayout } from "../../components/ScreenLayout";
import type { RecognitionResult } from "../../services/mockFoodRecognizer";

interface AnalyzingScreenProps {
  imageUrl: string;
  onCancel: () => void;
}

export function AnalyzingScreen({ imageUrl, onCancel }: AnalyzingScreenProps) {
  return (
    <ScreenLayout
      title="Analyzing photo"
      intro="The prototype is preparing a simulated suggestion."
    >
      <div className="image-preview analyzing-preview">
        <img src={imageUrl} alt="Selected food item awaiting analysis" />
        <div className="analysis-overlay" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <strong>Analyzing…</strong>
        </div>
      </div>
      <p className="supporting-copy">
        No photo is uploaded or sent to a real recognition service in this prototype.
      </p>
      <button className="secondary-button" type="button" onClick={onCancel}>
        Cancel
      </button>
    </ScreenLayout>
  );
}

interface ReviewSuggestionScreenProps {
  imageUrl: string;
  result: RecognitionResult;
  onConfirm: () => void;
  onCorrect: () => void;
  onReject: () => void;
  onManual: () => void;
}

export function ReviewSuggestionScreen({
  imageUrl,
  result,
  onConfirm,
  onCorrect,
  onReject,
  onManual,
}: ReviewSuggestionScreenProps) {
  return (
    <ScreenLayout
      title="Review suggestion"
      intro="This simulated suggestion can be wrong. Nothing is saved until you confirm."
      onBack={onReject}
      backLabel="Try another photo"
    >
      <div className="image-preview">
        <img src={imageUrl} alt="Food item selected for this suggestion" />
      </div>

      <section className="suggestion-card" aria-labelledby="suggested-item-heading">
        <span id="suggested-item-heading">Prototype suggestion</span>
        <strong>{result.label}</strong>
        <small>Simulated confidence: {Math.round(result.confidence * 100)}%</small>
      </section>

      <button className="primary-button" type="button" onClick={onConfirm}>
        Yes, this is correct
      </button>
      <button className="secondary-button" type="button" onClick={onCorrect}>
        No, type the right item
      </button>
      <button className="secondary-button" type="button" onClick={onReject}>
        Not a food item / try again
      </button>
      <button className="text-button" type="button" onClick={onManual}>
        Switch to manual entry
      </button>
    </ScreenLayout>
  );
}
