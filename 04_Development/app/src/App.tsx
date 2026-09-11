import { useEffect, useState } from "react";
import { OpeningAnimation } from "./components/OpeningAnimation";
import { HomeScreen } from "./features/home/HomeScreen";
import { InventoryScreen } from "./features/inventory/InventoryScreen";
import { ItemDetailsScreen } from "./features/inventory/ItemDetailsScreen";
import { ManualEntryForm } from "./features/item-entry/ManualEntryForm";
import { PhotoIntakeFlow } from "./features/recognition/PhotoIntakeFlow";
import { BatchReviewScreen } from "./features/scanning/BatchReviewScreen";
import { BatchSuccessScreen } from "./features/scanning/BatchSuccessScreen";
import {
  ScannerSessionScreen,
  type CameraPermissionState,
} from "./features/scanning/ScannerSessionScreen";
import { SettingsScreen } from "./features/settings/SettingsScreen";
import {
  inventoryStorageKey,
  localInventoryRepository,
} from "./services/inventoryRepository";
import {
  createBarcodeItem,
  createDemoItems,
  createId,
  toDateInput,
} from "./services/prototypeData";
import type { InventoryItem, ItemInput } from "./types/inventory";

type View =
  | "home"
  | "fridge"
  | "scanner"
  | "photo"
  | "batch-review"
  | "batch-success"
  | "manual"
  | "batch-edit"
  | "details"
  | "edit"
  | "settings";

type BatchEditReturn = "scanner" | "review";
type PhotoStart = "capture" | "tuna";
const cameraPermissionStorageKey = "crocs-camera-permission";

interface InitialInventory {
  items: InventoryItem[];
  notice?: string;
}

interface AppProps {
  skipIntro?: boolean;
}

const loadInitialInventory = (): InitialInventory => {
  try {
    if (window.localStorage.getItem(inventoryStorageKey) === null) {
      return { items: createDemoItems() };
    }
    return { items: localInventoryRepository.load() };
  } catch {
    return {
      items: createDemoItems(),
      notice: "Saved prototype data could not be read. Sample items were restored.",
    };
  }
};

const buildManualItem = (input: ItemInput): InventoryItem => {
  const now = new Date().toISOString();
  return {
    id: createId(),
    ...input,
    addedAt: toDateInput(new Date()),
    entryMethod: "manual",
    recognitionOutcome: null,
    identificationStatus: "identified",
    dateType: input.expiresAt ? "confirmed" : "needs-confirmation",
    createdAt: now,
    updatedAt: now,
  };
};

const loadCameraPermission = (): CameraPermissionState => {
  try {
    const savedPermission = window.localStorage.getItem(cameraPermissionStorageKey);
    return savedPermission === "granted" || savedPermission === "denied"
      ? savedPermission
      : "prompt";
  } catch {
    return "prompt";
  }
};

export default function App({ skipIntro = false }: AppProps) {
  const [initialInventory] = useState(loadInitialInventory);
  const [showIntro, setShowIntro] = useState(!skipIntro);
  const [items, setItems] = useState(initialInventory.items);
  const [view, setView] = useState<View>("home");
  const [notice, setNotice] = useState(initialInventory.notice);
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [removedItem, setRemovedItem] = useState<InventoryItem>();
  const [batch, setBatch] = useState<InventoryItem[]>([]);
  const [pendingScan, setPendingScan] = useState<InventoryItem>();
  const [scanIndex, setScanIndex] = useState(0);
  const [scannerMessage, setScannerMessage] = useState<string>();
  const [successBatch, setSuccessBatch] = useState<InventoryItem[]>([]);
  const [batchEditItemId, setBatchEditItemId] = useState<string>();
  const [batchEditReturn, setBatchEditReturn] = useState<BatchEditReturn>("scanner");
  const [manualDraft, setManualDraft] = useState<ItemInput>();
  const [photoStart, setPhotoStart] = useState<PhotoStart>("capture");
  const [cameraPermission, setCameraPermission] = useState<CameraPermissionState>(
    loadCameraPermission,
  );

  useEffect(() => {
    localInventoryRepository.save(items);
  }, [items]);

  const updateCameraPermission = (permission: CameraPermissionState) => {
    setCameraPermission(permission);
    try {
      window.localStorage.setItem(cameraPermissionStorageKey, permission);
    } catch {
      // The prototype still works for the current session when storage is unavailable.
    }
  };

  const selectedItem = items.find((item) => item.id === selectedItemId);
  const batchEditItem = batchEditItemId
    ? batch.find((item) => item.id === batchEditItemId)
    : pendingScan;

  const finishIntro = () => {
    setShowIntro(false);
    window.setTimeout(() => document.getElementById("main-content")?.focus(), 0);
  };

  const goHome = (message?: string) => {
    setNotice(message);
    setView("home");
  };

  const goToFridge = (message?: string) => {
    setNotice(message);
    setView("fridge");
  };

  const startScanner = () => {
    setBatch([]);
    setPendingScan(undefined);
    setScannerMessage(undefined);
    setScanIndex(0);
    setManualDraft(undefined);
    setPhotoStart("capture");
    setView("scanner");
  };

  const openManualEntry = (initialValues?: ItemInput) => {
    setManualDraft(initialValues);
    setView("manual");
  };

  const openItem = (id: string) => {
    setSelectedItemId(id);
    setView("details");
  };

  const updateInventoryItem = (input: ItemInput) => {
    if (!selectedItem) return;
    setItems((current) =>
      current.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              ...input,
              dateType: input.expiresAt ? item.dateType || "confirmed" : "needs-confirmation",
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
    setView("details");
  };

  const removeInventoryItem = (id: string, action: "used" | "discarded" | "removed") => {
    const target = items.find((item) => item.id === id);
    if (!target) return;
    setItems((current) => current.filter((item) => item.id !== id));
    setRemovedItem(target);
    setSelectedItemId(undefined);
    const message =
      action === "used"
        ? `${target.name} marked as used.`
        : action === "discarded"
          ? `${target.name} marked as discarded.`
          : `${target.name} removed.`;
    goToFridge(message);
  };

  const undoRemoval = () => {
    if (!removedItem) return;
    setItems((current) => [removedItem, ...current]);
    setNotice(`${removedItem.name} was restored.`);
    setRemovedItem(undefined);
  };

  const simulateBarcodeScan = () => {
    if (pendingScan) return;
    const scannedItem = createBarcodeItem(scanIndex);
    setScanIndex((current) => current + 1);
    setPendingScan(scannedItem);
    const resultLabel =
      scannedItem.identificationStatus === "likely-match"
        ? "Likely match found"
        : scannedItem.identificationStatus === "needs-review"
          ? "Product needs review"
          : "Product identified";
    setScannerMessage(`${resultLabel}: ${scannedItem.name}. Confirm the details below.`);
  };

  const confirmPendingScan = () => {
    if (!pendingScan) return;
    setBatch((current) => [...current, pendingScan]);
    setScannerMessage(`${pendingScan.name} added. Scan the next grocery.`);
    setPendingScan(undefined);
  };

  const addManualItemToBatch = (input: ItemInput) => {
    const item = buildManualItem(input);
    setBatch((current) => [...current, item]);
    setScannerMessage(`${item.name} added manually. Continue scanning when ready.`);
    setManualDraft(undefined);
    setView("scanner");
  };

  const addPhotoItemToBatch = (item: InventoryItem) => {
    setBatch((current) => [...current, item]);
    setScannerMessage(`${item.name} added from photo. Continue adding groceries when ready.`);
    setView("scanner");
  };

  const openPendingEdit = () => {
    setBatchEditItemId(undefined);
    setBatchEditReturn("scanner");
    setView("batch-edit");
  };

  const openBatchEdit = (id: string) => {
    setBatchEditItemId(id);
    setBatchEditReturn("review");
    setView("batch-edit");
  };

  const saveBatchEdit = (input: ItemInput) => {
    const updates = {
      ...input,
      identificationStatus: "identified" as const,
      dateType: input.expiresAt ? "confirmed" as const : "needs-confirmation" as const,
      recognitionOutcome: "corrected" as const,
      updatedAt: new Date().toISOString(),
    };

    if (batchEditItemId) {
      setBatch((current) =>
        current.map((item) => (item.id === batchEditItemId ? { ...item, ...updates } : item)),
      );
      setBatchEditItemId(undefined);
      setView("batch-review");
      return;
    }

    if (pendingScan) {
      setPendingScan({ ...pendingScan, ...updates });
      setScannerMessage("Product details updated. Confirm to continue.");
    }
    setView(batchEditReturn === "review" ? "batch-review" : "scanner");
  };

  const markBatchItemReady = (id: string) => {
    setBatch((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              identificationStatus: "identified",
              dateType: item.dateType === "needs-confirmation" ? "estimated" : item.dateType,
              recognitionOutcome: "confirmed",
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
  };

  const addBatchToFridge = () => {
    setItems((current) => [...batch, ...current]);
    setSuccessBatch(batch);
    setBatch([]);
    setPendingScan(undefined);
    setView("batch-success");
  };

  if (showIntro) return <OpeningAnimation onComplete={finishIntro} />;

  if (view === "home") {
    return (
      <HomeScreen
        items={items}
        notice={notice}
        onScan={startScanner}
        onOpenFridge={() => goToFridge()}
        onOpenItem={openItem}
        onSettings={() => setView("settings")}
      />
    );
  }

  if (view === "fridge") {
    return (
      <InventoryScreen
        items={items}
        notice={notice}
        onHome={() => goHome()}
        onScan={startScanner}
        onSettings={() => setView("settings")}
        onOpenItem={openItem}
        onUndo={removedItem ? undoRemoval : undefined}
      />
    );
  }

  if (view === "scanner") {
    return (
      <ScannerSessionScreen
        batch={batch}
        pending={pendingScan}
        statusMessage={scannerMessage}
        cameraPermission={cameraPermission}
        onScan={simulateBarcodeScan}
        onConfirm={confirmPendingScan}
        onEdit={openPendingEdit}
        onFinish={() => setView("batch-review")}
        onManual={openManualEntry}
        onFoodDetected={() => {
          setPhotoStart("tuna");
          setView("photo");
        }}
        onPhotoLab={() => {
          setPhotoStart("capture");
          setView("photo");
        }}
        onCameraPermissionChange={updateCameraPermission}
        onHome={() => goHome()}
        onInventory={() => goToFridge()}
        onSettings={() => setView("settings")}
      />
    );
  }

  if (view === "photo") {
    return (
      <PhotoIntakeFlow
        initialDetection={photoStart === "tuna" ? "tuna" : undefined}
        onBack={() => setView("scanner")}
        onManual={openManualEntry}
        onAddItem={addPhotoItemToBatch}
      />
    );
  }

  if (view === "manual") {
    return (
      <ManualEntryForm
        title={manualDraft ? "Review corrected item" : "Enter grocery manually"}
        intro={
          manualDraft
            ? "The corrected food name is already filled in. Add any other details you know."
            : "Use manual entry when a barcode is unavailable or unsuccessful."
        }
        submitLabel="Add to batch"
        initialValues={manualDraft}
        onSubmit={addManualItemToBatch}
        onCancel={() => {
          setManualDraft(undefined);
          setView("scanner");
        }}
      />
    );
  }

  if (view === "batch-edit" && batchEditItem) {
    return (
      <ManualEntryForm
        title={`Edit ${batchEditItem.name}`}
        intro="Confirm the product and date before continuing."
        submitLabel="Save product"
        initialValues={batchEditItem}
        onSubmit={saveBatchEdit}
        onCancel={() => setView(batchEditReturn === "review" ? "batch-review" : "scanner")}
      />
    );
  }

  if (view === "batch-review") {
    return (
      <BatchReviewScreen
        items={batch}
        onMarkReady={markBatchItemReady}
        onEdit={openBatchEdit}
        onAddBatch={addBatchToFridge}
        onBack={() => setView("scanner")}
      />
    );
  }

  if (view === "batch-success") {
    return (
      <BatchSuccessScreen
        items={successBatch}
        onViewFridge={() =>
          goToFridge(
            `${successBatch.length} ${successBatch.length === 1 ? "grocery" : "groceries"} added.`,
          )
        }
      />
    );
  }

  if (view === "settings") {
    return (
      <SettingsScreen
        cameraPermission={cameraPermission}
        onHome={() => goHome()}
        onInventory={() => goToFridge()}
        onScan={startScanner}
        onResetCameraPermission={() => updateCameraPermission("prompt")}
      />
    );
  }

  if (view === "edit" && selectedItem) {
    return (
      <ManualEntryForm
        title={`Edit ${selectedItem.name}`}
        intro="Update the product details stored in your fridge."
        submitLabel="Save changes"
        initialValues={selectedItem}
        onSubmit={updateInventoryItem}
        onCancel={() => setView("details")}
      />
    );
  }

  if (view === "details" && selectedItem) {
    return (
      <ItemDetailsScreen
        item={selectedItem}
        onBack={() => goToFridge()}
        onEdit={() => setView("edit")}
        onRemove={() => removeInventoryItem(selectedItem.id, "removed")}
        onUsed={() => removeInventoryItem(selectedItem.id, "used")}
        onDiscarded={() => removeInventoryItem(selectedItem.id, "discarded")}
      />
    );
  }

  return null;
}
