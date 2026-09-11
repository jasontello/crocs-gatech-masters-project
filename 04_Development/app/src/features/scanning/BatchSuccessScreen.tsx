import { ScreenLayout } from "../../components/ScreenLayout";
import type { InventoryItem } from "../../types/inventory";
import { isExpiringSoon } from "../inventory/expiration";

interface BatchSuccessScreenProps {
  items: InventoryItem[];
  onViewFridge: () => void;
}

export function BatchSuccessScreen({ items, onViewFridge }: BatchSuccessScreenProps) {
  const useSoonCount = items.filter(isExpiringSoon).length;

  return (
    <ScreenLayout title="Groceries added" intro="Your refrigerator inventory is up to date.">
      <div className="success-graphic" aria-hidden="true">
        <span>{items.length}</span>
      </div>
      <section className="success-copy" aria-label="Batch results">
        <h2>{items.length} {items.length === 1 ? "grocery" : "groceries"} added</h2>
        <p>
          {useSoonCount
            ? `${useSoonCount} should be used this week.`
            : "Nothing in this batch needs immediate attention."}
        </p>
      </section>
      <button className="primary-button" type="button" onClick={onViewFridge}>
        View my fridge
      </button>
    </ScreenLayout>
  );
}
