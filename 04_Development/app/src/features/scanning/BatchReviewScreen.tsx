import { ScreenLayout } from "../../components/ScreenLayout";
import { FoodIcon } from "../../components/FoodIcon";
import type { InventoryItem } from "../../types/inventory";

interface BatchReviewScreenProps {
  items: InventoryItem[];
  onMarkReady: (id: string) => void;
  onEdit: (id: string) => void;
  onAddBatch: () => void;
  onBack: () => void;
}

const needsAttention = (item: InventoryItem) =>
  item.identificationStatus !== "identified" || item.dateType === "needs-confirmation";

export function BatchReviewScreen({
  items,
  onMarkReady,
  onEdit,
  onAddBatch,
  onBack,
}: BatchReviewScreenProps) {
  const attentionItems = items.filter(needsAttention);

  return (
    <ScreenLayout
      title="Review this batch"
      intro="Only groceries that need attention are shown here."
      onBack={onBack}
      backLabel="Scanner"
    >
      <div className="review-summary" role="status">
        <strong>{attentionItems.length}</strong>
        <span>{attentionItems.length === 1 ? "item needs review" : "items need review"}</span>
      </div>

      {attentionItems.length ? (
        <div className="review-list">
          {attentionItems.map((item) => (
            <article className="review-item" key={item.id}>
              <div className="confirmation-product">
                <FoodIcon name={item.name} />
                <div>
                  <span className="plain-status">
                    {item.identificationStatus === "likely-match" ? "Likely match" : "Needs review"}
                  </span>
                  <h2>{item.name}</h2>
                  <p>{item.brand || item.packageSize}</p>
                </div>
              </div>
              <p className="review-reason">
                {item.dateType === "needs-confirmation"
                  ? "The estimated date and product need confirmation."
                  : "Verify the product before adding it to your fridge."}
              </p>
              <div className="sheet-actions">
                <button className="primary-button" type="button" onClick={() => onMarkReady(item.id)}>
                  Confirm item
                </button>
                <button className="secondary-button" type="button" onClick={() => onEdit(item.id)}>
                  Edit
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="ready-message">
          <strong>Everything is ready</strong>
          <p>All products and estimated dates have been reviewed.</p>
        </div>
      )}

      <button
        className="primary-button sticky-action"
        type="button"
        disabled={attentionItems.length > 0}
        onClick={onAddBatch}
      >
        Add {items.length} {items.length === 1 ? "grocery" : "groceries"} to my fridge
      </button>
    </ScreenLayout>
  );
}
