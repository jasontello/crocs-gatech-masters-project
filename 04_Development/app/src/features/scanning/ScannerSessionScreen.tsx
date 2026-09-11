import { useEffect, useRef, useState } from "react";
import { BottomNavigation } from "../../components/BottomNavigation";
import { ScreenLayout } from "../../components/ScreenLayout";
import { FoodIcon } from "../../components/FoodIcon";
import type { InventoryItem, ItemInput } from "../../types/inventory";
import { Camera, Check, Maximize2, PenLine, ScanLine, X } from "lucide-react";

interface ScannerSessionScreenProps {
  batch: InventoryItem[];
  pending?: InventoryItem;
  statusMessage?: string;
  cameraPermission: CameraPermissionState;
  onScan: () => void;
  onConfirm: () => void;
  onEdit: () => void;
  onFinish: () => void;
  onManual: (initialValues?: ItemInput) => void;
  onFoodDetected: () => void;
  onPhotoLab: () => void;
  onCameraPermissionChange: (permission: CameraPermissionState) => void;
  onHome: () => void;
  onInventory: () => void;
  onSettings: () => void;
}

export type CameraPermissionState = "prompt" | "granted" | "denied";
type CameraPermissionView = "explanation" | "denied";
type CameraRequest = "barcode" | "food" | "uncertainty";
type CameraOutcome =
  | "scanning"
  | "scenario-menu"
  | "nothing"
  | "multiple"
  | "low-confidence"
  | "conflict"
  | "date-unreadable";

const formatShortDate = (date?: string) => {
  if (!date) return "Needs confirmation";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(
    new Date(`${date}T00:00:00`),
  );
};

const statusLabel = (item: InventoryItem) => {
  if (item.identificationStatus === "likely-match") return "Likely match";
  if (item.identificationStatus === "needs-review") return "Needs review";
  return "Identified";
};

export function ScannerSessionScreen({
  batch,
  pending,
  statusMessage,
  cameraPermission,
  onScan,
  onConfirm,
  onEdit,
  onFinish,
  onManual,
  onFoodDetected,
  onPhotoLab,
  onCameraPermissionChange,
  onHome,
  onInventory,
  onSettings,
}: ScannerSessionScreenProps) {
  const [cameraExpanded, setCameraExpanded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [permissionView, setPermissionView] = useState<CameraPermissionView>();
  const [requestedDetection, setRequestedDetection] = useState<CameraRequest>("barcode");
  const [cameraOutcome, setCameraOutcome] = useState<CameraOutcome>("scanning");
  const detectionTimerRef = useRef<number | undefined>(undefined);
  const permissionDialogRef = useRef<HTMLElement | null>(null);
  const cameraDialogRef = useRef<HTMLElement | null>(null);

  const clearDetectionTimer = () => {
    if (detectionTimerRef.current) window.clearTimeout(detectionTimerRef.current);
    detectionTimerRef.current = undefined;
  };

  useEffect(
    () => () => {
      if (detectionTimerRef.current) window.clearTimeout(detectionTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!permissionView) return;
    window.setTimeout(() => permissionDialogRef.current?.focus(), 0);
  }, [permissionView]);

  useEffect(() => {
    if (!cameraExpanded || cameraOutcome === "scanning") return;
    window.setTimeout(() => cameraDialogRef.current?.focus(), 0);
  }, [cameraExpanded, cameraOutcome]);

  const openCamera = (request: CameraRequest = "barcode") => {
    if (pending) return;
    clearDetectionTimer();
    setCameraExpanded(true);
    if (request === "uncertainty") {
      setCameraOutcome("scenario-menu");
      setIsDetecting(false);
      return;
    }
    setCameraOutcome("scanning");
    setIsDetecting(true);
    detectionTimerRef.current = window.setTimeout(() => {
      if (request === "food") onFoodDetected();
      else onScan();
    }, 1200);
  };

  const requestCamera = (request: CameraRequest = "barcode") => {
    setRequestedDetection(request);
    if (cameraPermission === "granted") {
      openCamera(request);
      return;
    }
    setPermissionView(cameraPermission === "denied" ? "denied" : "explanation");
  };

  const enableCamera = () => {
    onCameraPermissionChange("granted");
    setPermissionView(undefined);
    openCamera(requestedDetection);
  };

  const declineCamera = () => {
    onCameraPermissionChange("denied");
    setPermissionView("denied");
  };

  const openManualFromPermission = () => {
    setPermissionView(undefined);
    onManual();
  };

  const closeCamera = () => {
    clearDetectionTimer();
    setIsDetecting(false);
    setCameraExpanded(false);
    setCameraOutcome("scanning");
  };

  const showCameraOutcome = (outcome: Exclude<CameraOutcome, "scanning" | "scenario-menu">) => {
    clearDetectionTimer();
    setIsDetecting(false);
    setCameraOutcome(outcome);
  };

  const openManualCorrection = (name = "", notes = "") => {
    closeCamera();
    onManual({ name, quantity: "", expiresAt: "", notes });
  };

  const confirmDetection = () => {
    onConfirm();
    setIsDetecting(false);
    setCameraExpanded(false);
  };

  const editDetection = () => {
    setIsDetecting(false);
    setCameraExpanded(false);
    onEdit();
  };

  const liveCameraStatus = pending
    ? { title: "Match found", detail: "Check the result before adding it." }
    : cameraOutcome === "scanning"
      ? { title: "Scanning automatically", detail: "Looking for a product, barcode, or printed date." }
      : cameraOutcome === "scenario-menu"
        ? { title: "Uncertainty test", detail: "Choose the camera response you want to review." }
        : cameraOutcome === "nothing"
          ? { title: "No match yet", detail: "The camera needs a clearer view of one product." }
          : cameraOutcome === "multiple"
            ? { title: "More than one item", detail: "CROCS cannot tell which product to add." }
            : cameraOutcome === "low-confidence"
              ? { title: "Possible matches", detail: "The food category is not clear enough to assume." }
              : cameraOutcome === "conflict"
                ? { title: "Results disagree", detail: "The barcode and camera found different products." }
                : { title: "Date not readable", detail: "The product is clear, but the printed date is not." };

  return (
    <ScreenLayout
      className="scanner-screen"
      title="Scan groceries"
      intro="One camera finds food, barcodes, and printed dates. Confirm each match before it is added."
    >
      <div className="scanner-session-bar">
        <strong>{batch.length} added</strong>
        <button
          className="text-button small-text-button"
          type="button"
          disabled={!batch.length || Boolean(pending)}
          onClick={onFinish}
        >
          Finish
        </button>
      </div>

      {statusMessage ? <div className="notice" role="status">{statusMessage}</div> : null}

      <div className="intake-methods" aria-label="Add grocery with">
        <button className="intake-method intake-method-active" type="button" aria-current="true">
          <Camera aria-hidden="true" />
          Camera
        </button>
        <button
          className="intake-method"
          type="button"
          aria-label="Enter an item manually"
          onClick={() => onManual()}
        >
          <PenLine aria-hidden="true" />
          Manual
        </button>
      </div>

      <button
        className="unified-camera-preview"
        type="button"
        aria-label="Open camera scanner"
        onClick={() => requestCamera("barcode")}
        disabled={Boolean(pending)}
      >
        <img src={`${import.meta.env.BASE_URL}assets/editorial/whole-milk.webp`} alt="" aria-hidden="true" />
        <div className="camera-preview-status">
          <ScanLine aria-hidden="true" />
          <div>
            <strong>{pending ? "Product found" : "Camera ready"}</strong>
            <span>Searching for food, barcodes, and printed dates</span>
          </div>
        </div>
        <span className="camera-expand-label">
          <Maximize2 aria-hidden="true" />
          Tap to open camera
        </span>
      </button>

      <details className="prototype-controls unified-camera-controls">
        <summary>Try a prototype detection</summary>
        <p>These controls simulate what the unified camera would recognize automatically.</p>
        <div className="prototype-scenario-list">
          <button className="secondary-button" type="button" onClick={() => requestCamera("food")}>
            Detect food without a barcode
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => requestCamera("uncertainty")}
          >
            Open camera uncertainty states
          </button>
          <button className="secondary-button" type="button" onClick={onPhotoLab}>
            Open photo edge-case scenarios
          </button>
        </div>
      </details>

      <section className="batch-queue" aria-labelledby="batch-heading">
        <div className="section-heading-row">
          <h2 id="batch-heading">Current batch</h2>
          <span>{batch.length} {batch.length === 1 ? "grocery" : "groceries"}</span>
        </div>
        {batch.length ? (
          <div className="batch-strip">
            {batch.map((item) => (
              <div className="batch-strip-item" key={item.id}>
                <FoodIcon name={item.name} small />
                <strong>{item.name}</strong>
                <small>{item.identificationStatus === "identified" ? "Ready" : "Review"}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="plain-empty">Scanned groceries will appear here.</p>
        )}
      </section>

      {cameraExpanded ? (
        <section
          ref={cameraDialogRef}
          className="camera-fullscreen"
          role="dialog"
          aria-modal="true"
          aria-label="Camera scanner"
          tabIndex={-1}
        >
          <header className="camera-fullscreen-header">
            <button type="button" onClick={closeCamera}>Close</button>
            <strong>Camera</strong>
            <span>{batch.length} added</span>
          </header>
          <div className="camera-fullscreen-feed">
            <div
              className={`camera-feed-images ${cameraOutcome === "multiple" ? "camera-feed-images-multiple" : ""}`}
            >
              <img
                src={`${import.meta.env.BASE_URL}assets/editorial/whole-milk.webp`}
                alt="Simulated outward-facing camera view of a grocery product"
              />
              {cameraOutcome === "multiple" ? (
                <img
                  src={`${import.meta.env.BASE_URL}assets/editorial/chicken-thighs.webp`}
                  alt="A second grocery product visible in the simulated camera"
                />
              ) : null}
            </div>
            <div className="camera-detection-frame" aria-hidden="true" />
            <div className="camera-live-status" role="status" aria-live="polite">
              <ScanLine aria-hidden="true" />
              <div>
                <strong>{liveCameraStatus.title}</strong>
                <span>{liveCameraStatus.detail}</span>
              </div>
            </div>
          </div>

          {!pending && cameraOutcome === "scanning" ? (
            <div className="camera-fullscreen-footer">
              <span>{isDetecting && !pending ? "Keep one item in view" : "Ready"}</span>
              <button className="camera-demo-button" type="button" onClick={() => openCamera("food")}>
                Try unpackaged food demo
              </button>
            </div>
          ) : null}

          {!pending && cameraOutcome === "scenario-menu" ? (
            <section className="camera-outcome-panel camera-scenario-panel" aria-labelledby="uncertainty-heading">
              <h2 id="uncertainty-heading">Try an uncertainty state</h2>
              <div className="camera-scenario-options">
                <button type="button" onClick={() => showCameraOutcome("nothing")}>Nothing detected</button>
                <button type="button" onClick={() => showCameraOutcome("multiple")}>Multiple products</button>
                <button type="button" onClick={() => showCameraOutcome("low-confidence")}>Low-confidence match</button>
                <button type="button" onClick={() => showCameraOutcome("conflict")}>Conflicting results</button>
                <button type="button" onClick={() => showCameraOutcome("date-unreadable")}>Unreadable printed date</button>
              </div>
            </section>
          ) : null}

          {!pending && cameraOutcome === "nothing" ? (
            <section className="camera-outcome-panel" aria-labelledby="nothing-detected-heading">
              <h2 id="nothing-detected-heading">We couldn’t find a product</h2>
              <p>Place one item inside the frame. Make sure the front label or barcode is visible.</p>
              <div className="camera-outcome-actions">
                <button className="primary-button" type="button" onClick={() => openCamera("barcode")}>
                  Try scanning again
                </button>
                <button className="secondary-button" type="button" onClick={() => openManualCorrection()}>
                  Enter manually
                </button>
              </div>
              <button className="camera-outcome-back" type="button" onClick={() => setCameraOutcome("scenario-menu")}>
                Back to uncertainty states
              </button>
            </section>
          ) : null}

          {!pending && cameraOutcome === "multiple" ? (
            <section className="camera-outcome-panel" aria-labelledby="multiple-products-heading">
              <h2 id="multiple-products-heading">Show one item at a time</h2>
              <p>Move the other groceries out of view so CROCS knows which product to add.</p>
              <div className="camera-outcome-actions">
                <button className="primary-button" type="button" onClick={() => openCamera("barcode")}>
                  Scan one item
                </button>
                <button className="secondary-button" type="button" onClick={() => openManualCorrection()}>
                  Enter manually
                </button>
              </div>
              <button className="camera-outcome-back" type="button" onClick={() => setCameraOutcome("scenario-menu")}>
                Back to uncertainty states
              </button>
            </section>
          ) : null}

          {!pending && cameraOutcome === "low-confidence" ? (
            <section className="camera-outcome-panel" aria-labelledby="low-confidence-heading">
              <h2 id="low-confidence-heading">Which item is this?</h2>
              <p>The camera found a few possible matches. Choose one to review before adding it.</p>
              <div className="camera-result-choices">
                {[
                  ["Greek Yogurt", "Possible dairy match"],
                  ["Sour Cream", "Possible dairy match"],
                  ["Cottage Cheese", "Possible dairy match"],
                ].map(([name, detail]) => (
                  <button type="button" key={name} onClick={() => openManualCorrection(name)}>
                    <FoodIcon name={name} small />
                    <span><strong>{name}</strong><small>{detail}</small></span>
                  </button>
                ))}
                <button type="button" onClick={() => openManualCorrection()}>
                  <span><strong>None of these</strong><small>Enter the correct item</small></span>
                </button>
              </div>
              <button className="camera-outcome-back" type="button" onClick={() => setCameraOutcome("scenario-menu")}>
                Back to uncertainty states
              </button>
            </section>
          ) : null}

          {!pending && cameraOutcome === "conflict" ? (
            <section className="camera-outcome-panel" aria-labelledby="conflicting-results-heading">
              <h2 id="conflicting-results-heading">Two results disagree</h2>
              <p>Choose the product you can confirm from the package.</p>
              <div className="camera-result-choices">
                <button type="button" onClick={() => openManualCorrection("Vanilla Yogurt", "Selected from barcode result.")}>
                  <span><small>Barcode result</small><strong>Vanilla Yogurt</strong></span>
                </button>
                <button type="button" onClick={() => openManualCorrection("Sour Cream", "Selected from camera result.")}>
                  <span><small>Camera result</small><strong>Sour Cream</strong></span>
                </button>
                <button type="button" onClick={() => openManualCorrection()}>
                  <span><strong>Neither result</strong><small>Enter the correct item</small></span>
                </button>
              </div>
              <button className="camera-outcome-back" type="button" onClick={() => setCameraOutcome("scenario-menu")}>
                Back to uncertainty states
              </button>
            </section>
          ) : null}

          {!pending && cameraOutcome === "date-unreadable" ? (
            <section className="camera-outcome-panel" aria-labelledby="date-unreadable-heading">
              <h2 id="date-unreadable-heading">The date isn’t readable</h2>
              <p>We found Whole Milk, but glare or faded ink is hiding the printed date.</p>
              <div className="camera-outcome-actions">
                <button className="primary-button" type="button" onClick={() => openCamera("barcode")}>
                  Scan the date again
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => openManualCorrection("Whole Milk", "Printed date needs confirmation.")}
                >
                  Enter the date manually
                </button>
              </div>
              <button className="camera-outcome-back" type="button" onClick={() => setCameraOutcome("scenario-menu")}>
                Back to uncertainty states
              </button>
            </section>
          ) : null}

          {pending ? (
            <section className="camera-confirmation-sheet" aria-labelledby="camera-confirmation-heading">
              <span className="plain-status">{statusLabel(pending)} from camera</span>
              <h2 id="camera-confirmation-heading">Is this it?</h2>
              <div className="confirmation-product">
                <FoodIcon name={pending.name} />
                <div>
                  <strong>{pending.name}</strong>
                  <p>{[pending.brand, pending.packageSize].filter(Boolean).join(" | ")}</p>
                </div>
              </div>
              <dl className="confirmation-details">
                <div><dt>Quantity</dt><dd>{pending.quantity}</dd></div>
                <div>
                  <dt>{pending.dateType === "confirmed" ? "Package date" : "Estimated use-first date"}</dt>
                  <dd>{formatShortDate(pending.expiresAt)}</dd>
                </div>
              </dl>
              <div className="camera-confirmation-actions">
                <button className="primary-button" type="button" onClick={confirmDetection}>
                  <Check aria-hidden="true" />
                  Yes, add it
                </button>
                <button className="secondary-button" type="button" onClick={editDetection}>
                  <X aria-hidden="true" />
                  No, edit
                </button>
              </div>
            </section>
          ) : null}
        </section>
      ) : null}

      {permissionView ? (
        <section
          ref={permissionDialogRef}
          className="camera-permission-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="camera-permission-heading"
          tabIndex={-1}
        >
          <div className="camera-permission-content">
            {permissionView === "explanation" ? (
              <>
                <button
                  className="camera-permission-close"
                  type="button"
                  onClick={() => setPermissionView(undefined)}
                >
                  Close
                </button>
                <h2 id="camera-permission-heading">Enable camera access</h2>
                <p>
                  CROCS uses the camera to recognize one grocery at a time, including its barcode
                  and printed date.
                </p>
                <div className="camera-permission-privacy">
                  This prototype does not upload or save camera images.
                </div>
                <div className="camera-permission-actions">
                  <button className="primary-button" type="button" onClick={enableCamera}>
                    Enable camera
                  </button>
                  <button className="secondary-button" type="button" onClick={declineCamera}>
                    Not now
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  className="camera-permission-close"
                  type="button"
                  onClick={() => setPermissionView(undefined)}
                >
                  Back to Scan
                </button>
                <h2 id="camera-permission-heading">Camera access is off</h2>
                <p>To turn it back on from your iPhone:</p>
                <ol className="camera-settings-steps">
                  <li>Open iPhone Settings.</li>
                  <li>Find the browser you used to open CROCS.</li>
                  <li>Allow camera access, then return here.</li>
                </ol>
                <div className="camera-permission-actions">
                  <button className="primary-button" type="button" onClick={enableCamera}>
                    I’ve enabled the camera
                  </button>
                  <button className="secondary-button" type="button" onClick={openManualFromPermission}>
                    Enter manually
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      ) : null}

      <BottomNavigation
        activeSection="scan"
        autoHide={false}
        onHome={onHome}
        onInventory={onInventory}
        onScan={() => undefined}
        onSettings={onSettings}
      />
    </ScreenLayout>
  );
}
