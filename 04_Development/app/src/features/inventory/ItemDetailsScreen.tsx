import { useState } from "react";
import { ScreenLayout } from "../../components/ScreenLayout";
import type { InventoryItem } from "../../types/inventory";
import { getExpirationSummary } from "./expiration";

interface ItemDetailsScreenProps {
  item: InventoryItem;
  onBack: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onUsed: () => void;
  onDiscarded: () => void;
}

const formatDate = (date?: string) => {
  if (!date) return "Not provided";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
};

const formatMethod = (method: InventoryItem["entryMethod"]) => {
  if (method === "manual") return "Manual entry";
  if (method === "barcode") return "Barcode and estimate";
  if (method === "camera") return "Camera-assisted";
  return "Photo upload";
};

const formatDateType = (item: InventoryItem) => {
  if (item.dateType === "confirmed") return "Package date confirmed";
  if (item.dateType === "needs-confirmation" || !item.expiresAt) return "Date needs confirmation";
  if (item.dateType === "recommended") return "Recommended use by";
  return "Estimated use-first date";
};

export function ItemDetailsScreen({
  item,
  onBack,
  onEdit,
  onRemove,
  onUsed,
  onDiscarded,
}: ItemDetailsScreenProps) {
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);
  const expiration = getExpirationSummary(item.expiresAt);

  return (
    <ScreenLayout
      title={item.name}
      intro="Review, edit, or remove this inventory item."
      onBack={onBack}
      backLabel="Inventory"
    >
      <div className={`detail-row status-row status-${expiration.state}`}>
        <span>Status</span>
        <strong>{expiration.label}</strong>
      </div>
      <div className="detail-row">
        <span>Quantity</span>
        <strong>{item.quantity || "Not provided"}</strong>
      </div>
      <div className="detail-row">
        <span>Added</span>
        <strong>{formatDate(item.addedAt)}</strong>
      </div>
      <div className="detail-row">
        <span>{formatDateType(item)}</span>
        <strong>{formatDate(item.expiresAt)}</strong>
      </div>
      {item.estimateBasis ? (
        <div className="detail-row">
          <span>Estimate basis</span>
          <strong>{item.estimateBasis}</strong>
        </div>
      ) : null}
      {item.openedAt ? (
        <div className="detail-row">
          <span>Opened or prepared</span>
          <strong>{formatDate(item.openedAt)}</strong>
        </div>
      ) : null}
      {item.continuouslyRefrigerated !== undefined ? (
        <div className="detail-row">
          <span>Storage context</span>
          <strong>{item.continuouslyRefrigerated ? "Continuously refrigerated" : "Not confirmed"}</strong>
        </div>
      ) : null}
      {item.recommendationConfidence ? (
        <div className="detail-row">
          <span>Recommendation confidence</span>
          <strong>
            {item.recommendationConfidence.charAt(0).toUpperCase() +
              item.recommendationConfidence.slice(1)}
          </strong>
        </div>
      ) : null}
      {item.reasoningSummary ? (
        <div className="detail-row">
          <span>Why this date</span>
          <strong>{item.reasoningSummary}</strong>
        </div>
      ) : null}
      {item.recommendationSourceUrl ? (
        <div className="detail-row">
          <span>Source</span>
          <a
            className="source-link"
            href={item.recommendationSourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            {item.recommendationSourceName || "View storage guidance"}
          </a>
        </div>
      ) : null}
      <div className="detail-row">
        <span>Logging method</span>
        <strong>{formatMethod(item.entryMethod)}</strong>
      </div>
      {item.notes ? (
        <div className="detail-row">
          <span>Storage note</span>
          <strong>{item.notes}</strong>
        </div>
      ) : null}

      {confirmingRemoval ? (
        <section className="confirmation-panel" role="alertdialog" aria-labelledby="remove-heading">
          <h2 id="remove-heading">Remove {item.name}?</h2>
          <p>You can undo this action from the inventory screen.</p>
          <div className="button-row">
            <button className="danger-button" type="button" onClick={onRemove}>
              Remove item
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => setConfirmingRemoval(false)}
            >
              Keep item
            </button>
          </div>
        </section>
      ) : (
        <>
          <button className="primary-button" type="button" onClick={onEdit}>
            Edit item
          </button>
          <div className="button-row detail-outcome-actions">
            <button className="secondary-button" type="button" onClick={onUsed}>
              Mark as used
            </button>
            <button className="secondary-button" type="button" onClick={onDiscarded}>
              Mark as discarded
            </button>
          </div>
          <button
            className="secondary-button"
            type="button"
            onClick={() => setConfirmingRemoval(true)}
          >
            Remove from inventory
          </button>
        </>
      )}

      <p className="research-note">
        Research note: the logging method is retained locally for future study analysis.
      </p>
    </ScreenLayout>
  );
}
