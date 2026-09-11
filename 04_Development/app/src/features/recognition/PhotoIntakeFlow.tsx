import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Camera, CameraOff, ImageOff, Search, ShieldCheck } from "lucide-react";
import { FoodIcon } from "../../components/FoodIcon";
import { ScreenLayout } from "../../components/ScreenLayout";
import { addDays, createId, toDateInput } from "../../services/prototypeData";
import type { EntryMethod, InventoryItem, ItemInput } from "../../types/inventory";

type DemoScenario = "tuna" | "salsa" | "unusable" | "error";
type Step =
  | "capture"
  | "photo-review"
  | "analyzing"
  | "confirm"
  | "correct"
  | "opened"
  | "refrigerated"
  | "recommendation"
  | "printed-date"
  | "unable"
  | "unusable-photo"
  | "analysis-error"
  | "camera-unavailable";

interface PhotoIntakeFlowProps {
  initialDetection?: "tuna";
  onBack: () => void;
  onManual: (initialValues?: ItemInput) => void;
  onAddItem: (item: InventoryItem) => void;
}

const foodSafetySource = {
  name: "FoodSafety.gov Cold Food Storage Chart",
  url: "https://www.foodsafety.gov/food-safety-charts/cold-food-storage-charts",
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric" }).format(
    new Date(`${date}T00:00:00`),
  );

const makeItem = (
  input: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">,
): InventoryItem => {
  const now = new Date().toISOString();
  return { id: createId(), ...input, createdAt: now, updatedAt: now };
};

export function PhotoIntakeFlow({
  initialDetection,
  onBack,
  onManual,
  onAddItem,
}: PhotoIntakeFlowProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>(initialDetection ? "analyzing" : "capture");
  const [scenario, setScenario] = useState<DemoScenario>(initialDetection ?? "tuna");
  const [entryMethod, setEntryMethod] = useState<EntryMethod>("camera");
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [openedAt, setOpenedAt] = useState(toDateInput(new Date()));
  const [correctedName, setCorrectedName] = useState("");
  const [correctionError, setCorrectionError] = useState("");

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  useEffect(() => {
    if (step !== "analyzing") return;
    const timer = window.setTimeout(() => {
      if (scenario === "unusable") {
        setStep("unusable-photo");
        return;
      }
      if (scenario === "error") {
        setStep("analysis-error");
        return;
      }
      setStep("confirm");
    }, 420);
    return () => window.clearTimeout(timer);
  }, [scenario, step]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    window.setTimeout(() => document.getElementById("main-content")?.focus(), 0);
  }, [step]);

  const beginAnalysis = (nextScenario: DemoScenario, method: EntryMethod = "camera") => {
    setPreviewUrl(undefined);
    setScenario(nextScenario);
    setEntryMethod(method);
    setStep("analyzing");
  };

  const handleSelectedFile = (files: FileList | null, method: EntryMethod) => {
    const file = files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setScenario("tuna");
    setEntryMethod(method);
    setStep("photo-review");
  };

  const resetPhoto = () => {
    if (initialDetection) {
      onBack();
      return;
    }
    setPreviewUrl(undefined);
    setStep("capture");
  };

  const retryAnalysis = () => {
    setScenario("tuna");
    setStep("analyzing");
  };

  const beginCorrection = () => {
    setCorrectedName(scenario === "salsa" ? "Salsa Verde" : "Tuna");
    setCorrectionError("");
    setStep("correct");
  };

  const continueWithCorrection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = correctedName.trim();
    if (!name) {
      setCorrectionError("Enter the correct food name to continue.");
      return;
    }
    onManual({ name, quantity: "", expiresAt: "", notes: "" });
  };

  const addTuna = () => {
    const recommendedUseBy = addDaysFrom(openedAt, 3);
    onAddItem(
      makeItem({
        name: "Leftover Tuna",
        quantity: "1 container",
        addedAt: toDateInput(new Date()),
        expiresAt: recommendedUseBy,
        entryMethod,
        recognitionOutcome: "confirmed",
        originalSuggestion: "Tuna",
        identificationStatus: "identified",
        dateType: "recommended",
        estimateBasis: "3–4 days refrigerated after preparation",
        recommendationSourceName: foodSafetySource.name,
        recommendationSourceUrl: foodSafetySource.url,
        recommendationConfidence: "high",
        reasoningSummary:
          "Based on tuna prepared today, continuously refrigerated, and government cold-storage guidance.",
        openedAt,
        continuouslyRefrigerated: true,
        aiAssisted: true,
      }),
    );
  };

  const addSalsa = () => {
    const printedDate = addDays(43);
    onAddItem(
      makeItem({
        name: "Salsa Verde",
        brand: "Casa Sol",
        quantity: "1 sealed jar",
        addedAt: toDateInput(new Date()),
        expiresAt: printedDate,
        entryMethod,
        recognitionOutcome: "confirmed",
        originalSuggestion: "Salsa Verde",
        identificationStatus: "identified",
        dateType: "confirmed",
        estimateBasis: "Printed package date confirmed by user",
        printedDateLabel: "Best if used by",
        recommendationConfidence: "high",
        reasoningSummary: "A clearly printed package date was confirmed, so no storage estimate was added.",
        aiAssisted: true,
      }),
    );
  };

  if (step === "capture") {
    return (
      <ScreenLayout
        className="photo-flow-screen"
        title="Add with photo"
        intro="Photograph one item. A photo can identify food, but it cannot prove that food is safe."
        onBack={onBack}
        backLabel="Scanner"
      >
        <div className="photo-capture-panel">
          <Camera className="photo-capture-icon" aria-hidden="true" />
          <strong>Keep one food item in frame</strong>
          <span>Include the label or printed date when one is available.</span>
        </div>

        <input
          ref={cameraInputRef}
          hidden
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => {
            handleSelectedFile(event.target.files, "camera");
            event.currentTarget.value = "";
          }}
        />
        <input
          ref={uploadInputRef}
          hidden
          type="file"
          accept="image/*"
          onChange={(event) => {
            handleSelectedFile(event.target.files, "upload");
            event.currentTarget.value = "";
          }}
        />

        <button className="primary-button" type="button" onClick={() => cameraInputRef.current?.click()}>
          Take photo
        </button>
        <button className="secondary-button" type="button" onClick={() => uploadInputRef.current?.click()}>
          Choose existing photo
        </button>

        <details className="prototype-controls">
          <summary>Try a prototype scenario</summary>
          <p>These deterministic examples let you test the flow without uploading a photo.</p>
          <div className="prototype-scenario-list">
            <button className="secondary-button" type="button" onClick={() => beginAnalysis("tuna")}>
              Try leftover tuna demo
            </button>
            <button className="secondary-button" type="button" onClick={() => beginAnalysis("salsa")}>
              Try packaged salsa demo
            </button>
            <button className="secondary-button" type="button" onClick={() => beginAnalysis("unusable")}>
              Try unclear photo recovery
            </button>
            <button className="secondary-button" type="button" onClick={() => beginAnalysis("error")}>
              Try analysis error recovery
            </button>
            <button className="secondary-button" type="button" onClick={() => setStep("camera-unavailable")}>
              Try camera unavailable
            </button>
          </div>
        </details>

        <button className="text-button" type="button" onClick={() => onManual()}>
          Enter manually instead
        </button>
      </ScreenLayout>
    );
  }

  if (step === "photo-review") {
    return (
      <ScreenLayout
        className="photo-flow-screen"
        title="Review photo"
        intro="Check the image before CROCS analyzes it. Nothing has been uploaded or saved."
        onBack={resetPhoto}
        backLabel="Photo options"
      >
        {previewUrl ? (
          <div className="image-preview photo-review-image">
            <img src={previewUrl} alt="Food selected for review" />
          </div>
        ) : null}
        <section className="photo-quality-checklist" aria-labelledby="photo-check-heading">
          <h2 id="photo-check-heading">Before continuing</h2>
          <p>One food item should be centered and easy to see.</p>
          <p>Keep any package label or printed date readable.</p>
        </section>
        <button className="primary-button" type="button" onClick={() => setStep("analyzing")}>
          Analyze this photo
        </button>
        <button className="secondary-button" type="button" onClick={resetPhoto}>
          Retake or choose another
        </button>
        <button className="text-button" type="button" onClick={() => onManual()}>
          Enter manually instead
        </button>
      </ScreenLayout>
    );
  }

  if (step === "analyzing") {
    return (
      <ScreenLayout
        className="photo-flow-screen"
        title="Analyzing photo"
        intro="Looking for the food, package state, and visible dates."
      >
        {previewUrl ? (
          <div className="image-preview analyzing-preview">
            <img src={previewUrl} alt="Food selected for analysis" />
            <div className="analysis-overlay" role="status" aria-live="polite">
              <span className="spinner" aria-hidden="true" />
              <strong>Checking the image…</strong>
            </div>
          </div>
        ) : (
          <div className="analysis-stage" role="status" aria-live="polite">
            <Search aria-hidden="true" />
            <strong>Checking the image…</strong>
            <span>Prototype analysis is simulated.</span>
          </div>
        )}
        <button className="secondary-button" type="button" onClick={resetPhoto}>
          Cancel
        </button>
      </ScreenLayout>
    );
  }

  if (step === "unusable-photo") {
    return (
      <ScreenLayout
        className="photo-flow-screen"
        title="We couldn't read this photo"
        intro="The food may be too dark, blurry, or partly outside the frame."
        onBack={resetPhoto}
        backLabel="Photo options"
      >
        <div className="recovery-panel" role="alert">
          <ImageOff aria-hidden="true" />
          <div>
            <strong>No food suggestion was created</strong>
            <p>Try more light, move closer, and keep one item in the center.</p>
          </div>
        </div>
        <button className="primary-button" type="button" onClick={resetPhoto}>
          Try another photo
        </button>
        <button className="secondary-button" type="button" onClick={() => onManual()}>
          Enter manually
        </button>
      </ScreenLayout>
    );
  }

  if (step === "analysis-error") {
    return (
      <ScreenLayout
        className="photo-flow-screen"
        title="Analysis didn't finish"
        intro="Your photo is still on this device. Nothing was added to the fridge."
        onBack={resetPhoto}
        backLabel="Photo options"
      >
        {previewUrl ? (
          <div className="image-preview photo-review-image">
            <img src={previewUrl} alt="Food photo awaiting another analysis attempt" />
          </div>
        ) : null}
        <div className="recovery-panel" role="alert">
          <Search aria-hidden="true" />
          <div>
            <strong>The recognition service did not respond</strong>
            <p>You can retry without answering any questions again.</p>
          </div>
        </div>
        <button className="primary-button" type="button" onClick={retryAnalysis}>
          Try analysis again
        </button>
        <button className="secondary-button" type="button" onClick={resetPhoto}>
          Use another photo
        </button>
        <button className="text-button" type="button" onClick={() => onManual()}>
          Enter manually instead
        </button>
      </ScreenLayout>
    );
  }

  if (step === "camera-unavailable") {
    return (
      <ScreenLayout
        className="photo-flow-screen"
        title="Camera access is unavailable"
        intro="CROCS could not open the camera. You can still choose a photo from this device."
        onBack={() => setStep("capture")}
        backLabel="Photo options"
      >
        <input
          ref={uploadInputRef}
          hidden
          type="file"
          accept="image/*"
          onChange={(event) => {
            handleSelectedFile(event.target.files, "upload");
            event.currentTarget.value = "";
          }}
        />
        <div className="recovery-panel" role="alert">
          <CameraOff aria-hidden="true" />
          <div>
            <strong>The camera did not open</strong>
            <p>Check browser camera permission, or continue with an existing photo.</p>
          </div>
        </div>
        <button className="primary-button" type="button" onClick={() => uploadInputRef.current?.click()}>
          Choose existing photo
        </button>
        <button className="secondary-button" type="button" onClick={() => setStep("capture")}>
          Return to photo options
        </button>
        <button className="text-button" type="button" onClick={() => onManual()}>
          Enter manually instead
        </button>
      </ScreenLayout>
    );
  }

  if (step === "confirm") {
    const isTuna = scenario === "tuna";
    const itemName = isTuna ? "Tuna" : "Salsa Verde";
    return (
      <ScreenLayout
        className="photo-flow-screen"
        title="Confirm the food"
        intro="The suggestion can be wrong. Confirm it before CROCS looks for a date."
        onBack={resetPhoto}
        backLabel={initialDetection ? "Camera" : "Retake"}
      >
        {previewUrl ? (
          <div className="image-preview photo-review-image">
            <img src={previewUrl} alt="Food selected for confirmation" />
          </div>
        ) : null}
        <section className="recognition-result" aria-labelledby="recognized-food">
          <FoodIcon name={isTuna ? "leftover tuna" : "salsa"} />
          <div>
            <span className="plain-status">AI-assisted suggestion</span>
            <h2 id="recognized-food">{itemName}</h2>
            <p>
              {isTuna
                ? "Likely leftover or transferred food · Medium confidence"
                : "Sealed packaged food with a visible date · High confidence"}
            </p>
          </div>
        </section>
        <button
          className="primary-button"
          type="button"
          onClick={() => setStep(isTuna ? "opened" : "printed-date")}
        >
          Yes, this is correct
        </button>
        <button className="secondary-button" type="button" onClick={beginCorrection}>
          No, correct the item
        </button>
        <button className="text-button" type="button" onClick={resetPhoto}>
          Try another photo
        </button>
      </ScreenLayout>
    );
  }

  if (step === "correct") {
    return (
      <ScreenLayout
        className="photo-flow-screen"
        title="Correct the food"
        intro="Change the name before continuing. CROCS will carry it into manual details."
        onBack={() => setStep("confirm")}
        backLabel="Suggestion"
      >
        <form className="form-stack" onSubmit={continueWithCorrection} noValidate>
          <div className="field-group">
            <label htmlFor="corrected-food-name">Food name</label>
            <input
              id="corrected-food-name"
              name="correctedFoodName"
              type="text"
              autoComplete="off"
              value={correctedName}
              aria-invalid={Boolean(correctionError)}
              aria-describedby={correctionError ? "corrected-food-error" : "corrected-food-help"}
              onChange={(event) => {
                setCorrectedName(event.target.value);
                if (event.target.value.trim()) setCorrectionError("");
              }}
            />
            <p className="field-help" id="corrected-food-help">
              Corrected foods use manual details until more storage-guidance rules are supported.
            </p>
            {correctionError ? (
              <p className="field-error" id="corrected-food-error">
                {correctionError}
              </p>
            ) : null}
          </div>
          <button className="primary-button" type="submit">
            Continue with this name
          </button>
          <button className="secondary-button" type="button" onClick={() => setStep("confirm")}>
            Keep the suggestion
          </button>
        </form>
      </ScreenLayout>
    );
  }

  if (step === "opened") {
    return (
      <QuestionScreen
        count="Question 1 of 2"
        title="When was it opened or prepared?"
        intro="The storage window starts from this date."
        onBack={() => setStep("confirm")}
      >
        <button
          className="primary-button"
          type="button"
          onClick={() => {
            setOpenedAt(toDateInput(new Date()));
            setStep("refrigerated");
          }}
        >
          Today
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={() => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            setOpenedAt(toDateInput(yesterday));
            setStep("refrigerated");
          }}
        >
          Yesterday
        </button>
        <label className="question-date-field" htmlFor="opened-date">
          Choose a date
          <input
            id="opened-date"
            type="date"
            value={openedAt}
            max={toDateInput(new Date())}
            onChange={(event) => setOpenedAt(event.target.value)}
          />
        </label>
        <button
          className="secondary-button"
          type="button"
          disabled={!openedAt}
          onClick={() => setStep("refrigerated")}
        >
          Continue with selected date
        </button>
        <button className="text-button" type="button" onClick={() => setStep("unable")}>
          I'm not sure
        </button>
      </QuestionScreen>
    );
  }

  if (step === "refrigerated") {
    return (
      <QuestionScreen
        count="Question 2 of 2"
        title="Has it stayed refrigerated?"
        intro={`Since ${formatDate(openedAt)}, has it remained in the refrigerator?`}
        onBack={() => setStep("opened")}
      >
        <button className="primary-button" type="button" onClick={() => setStep("recommendation")}>
          Yes, continuously refrigerated
        </button>
        <button className="secondary-button" type="button" onClick={() => setStep("unable")}>
          No or not sure
        </button>
      </QuestionScreen>
    );
  }

  if (step === "unable") {
    return (
      <ScreenLayout
        className="photo-flow-screen"
        title="More context is needed"
        intro="CROCS will not create a precise date when preparation or refrigeration history is unknown."
        onBack={() => setStep("opened")}
        backLabel="Questions"
      >
        <div className="safety-note">
          <ShieldCheck aria-hidden="true" />
          <div>
            <strong>No recommended date was generated</strong>
            <p>A photo cannot establish whether food has been stored safely.</p>
          </div>
        </div>
        <button className="primary-button" type="button" onClick={() => onManual()}>
          Save details manually
        </button>
        <button className="secondary-button" type="button" onClick={resetPhoto}>
          Try another photo
        </button>
      </ScreenLayout>
    );
  }

  if (step === "printed-date") {
    const printedDate = addDays(43);
    return (
      <ScreenLayout
        className="photo-flow-screen"
        title="Review printed date"
        intro="The label and date are clear, so no follow-up questions are needed."
        onBack={() => setStep("confirm")}
        backLabel="Food"
      >
        <section className="recommendation-summary">
          <div className="recommendation-food">
            <FoodIcon name="salsa" />
            <div>
              <span className="plain-status">Printed package date</span>
              <h2>Salsa Verde</h2>
              <p>Casa Sol · Sealed jar</p>
            </div>
          </div>
          <div className="recommended-date">
            <span>Best if used by</span>
            <strong>{formatDate(printedDate)}</strong>
          </div>
          <p className="recommendation-explanation">
            The date was read from the package and still needs your confirmation. It is not an AI-generated expiration date.
          </p>
        </section>
        <button className="primary-button" type="button" onClick={addSalsa}>
          Confirm date and add to batch
        </button>
        <button className="secondary-button" type="button" onClick={() => onManual()}>
          Edit item or date
        </button>
      </ScreenLayout>
    );
  }

  const recommendedUseBy = addDaysFrom(openedAt, 3);
  return (
    <ScreenLayout
      className="photo-flow-screen"
      title="Review recommendation"
      intro="This is a storage recommendation, not a guaranteed expiration date."
      onBack={() => setStep("refrigerated")}
      backLabel="Questions"
    >
      <section className="recommendation-summary">
        <div className="recommendation-food">
          <FoodIcon name="leftover tuna" />
          <div>
            <span className="plain-status">AI-assisted · High confidence</span>
            <h2>Leftover Tuna</h2>
            <p>Prepared food · Refrigerated</p>
          </div>
        </div>
        <div className="recommended-date">
          <span>Recommended use by</span>
          <strong>{formatDate(recommendedUseBy)}</strong>
        </div>
        <dl className="recommendation-context">
          <div><dt>Prepared</dt><dd>{formatDate(openedAt)}</dd></div>
          <div><dt>Storage</dt><dd>Continuously refrigerated</dd></div>
          <div><dt>Guidance</dt><dd>3–4 days refrigerated</dd></div>
        </dl>
        <p className="recommendation-explanation">
          The earlier end of the guidance range is used because the item is a prepared leftover.
        </p>
        <a className="source-link" href={foodSafetySource.url} target="_blank" rel="noreferrer">
          Source: {foodSafetySource.name}
        </a>
      </section>
      <button className="primary-button" type="button" onClick={addTuna}>
        Add to current batch
      </button>
      <button className="secondary-button" type="button" onClick={() => onManual()}>
        Edit details
      </button>
    </ScreenLayout>
  );
}

interface QuestionScreenProps {
  count: string;
  title: string;
  intro: string;
  onBack: () => void;
  children: ReactNode;
}

function QuestionScreen({ count, title, intro, onBack, children }: QuestionScreenProps) {
  return (
    <ScreenLayout
      className="photo-flow-screen question-screen"
      title={title}
      intro={intro}
      onBack={onBack}
      backLabel="Back"
    >
      <div className="question-count" aria-label={count}>{count}</div>
      <div className="question-options">{children}</div>
    </ScreenLayout>
  );
}

function addDaysFrom(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toDateInput(date);
}
