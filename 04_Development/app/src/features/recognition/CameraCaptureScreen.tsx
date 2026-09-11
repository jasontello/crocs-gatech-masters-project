import { useRef } from "react";
import { ScreenLayout } from "../../components/ScreenLayout";
import type { RecognitionScenario } from "../../services/mockFoodRecognizer";
import type { EntryMethod } from "../../types/inventory";

interface CameraCaptureScreenProps {
  scenario: RecognitionScenario;
  message?: string;
  onScenarioChange: (scenario: RecognitionScenario) => void;
  onImageSelected: (file: File, method: EntryMethod) => void;
  onManual: () => void;
  onBack: () => void;
}

export function CameraCaptureScreen({
  scenario,
  message,
  onScenarioChange,
  onImageSelected,
  onManual,
  onBack,
}: CameraCaptureScreenProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleSelectedFile = (
    files: FileList | null,
    method: EntryMethod,
  ) => {
    const file = files?.[0];
    if (file) onImageSelected(file, method);
  };

  return (
    <ScreenLayout
      title="Scan a food item"
      intro="Take one clear photo or choose one from your device."
      onBack={onBack}
    >
      {message ? (
        <div className="notice" role="alert">
          {message}
        </div>
      ) : null}

      <div className="camera-placeholder" aria-hidden="true">
        <strong>Camera / uploaded image preview</strong>
        <span>Keep one item centered and well lit.</span>
      </div>

      <input
        ref={cameraInputRef}
        hidden
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(event) => handleSelectedFile(event.target.files, "camera")}
      />
      <input
        ref={uploadInputRef}
        hidden
        type="file"
        accept="image/*"
        onChange={(event) => handleSelectedFile(event.target.files, "upload")}
      />

      <button
        className="primary-button"
        type="button"
        onClick={() => cameraInputRef.current?.click()}
      >
        Take photo
      </button>
      <button
        className="secondary-button"
        type="button"
        onClick={() => uploadInputRef.current?.click()}
      >
        Choose existing photo
      </button>
      <button className="text-button" type="button" onClick={onManual}>
        Enter manually instead
      </button>

      <details className="prototype-controls">
        <summary>Prototype recognition scenario</summary>
        <label htmlFor="recognition-scenario">Simulated result</label>
        <select
          id="recognition-scenario"
          value={scenario}
          onChange={(event) =>
            onScenarioChange(event.target.value as RecognitionScenario)
          }
        >
          <option value="success">Suggested item</option>
          <option value="no-result">No match found</option>
          <option value="error">Service error</option>
        </select>
        <p>This control is only for testing the prototype flow.</p>
      </details>
    </ScreenLayout>
  );
}
