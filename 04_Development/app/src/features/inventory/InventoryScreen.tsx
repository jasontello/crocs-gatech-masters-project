import { useMemo, useState } from "react";
import { BottomNavigation } from "../../components/BottomNavigation";
import { FoodIcon } from "../../components/FoodIcon";
import { ScreenLayout } from "../../components/ScreenLayout";
import type { InventoryItem } from "../../types/inventory";
import { getExpirationSummary } from "./expiration";

interface InventoryScreenProps {
  items: InventoryItem[];
  notice?: string;
  onHome: () => void;
  onScan: () => void;
  onSettings: () => void;
  onOpenItem: (id: string) => void;
  onUndo?: () => void;
}

type UrgencyGroup = "Use first" | "Use this week" | "Fresh for now" | "Date needs confirmation";

const urgencyClass: Record<UrgencyGroup, string> = {
  "Use first": "urgency-use-first",
  "Use this week": "urgency-use-week",
  "Fresh for now": "urgency-fresh",
  "Date needs confirmation": "urgency-unknown",
};

const groupOrder: UrgencyGroup[] = [
  "Use first",
  "Use this week",
  "Fresh for now",
  "Date needs confirmation",
];

const getGroup = (item: InventoryItem): UrgencyGroup => {
  if (item.dateType === "needs-confirmation" || !item.expiresAt) {
    return "Date needs confirmation";
  }
  const days = getExpirationSummary(item.expiresAt).daysRemaining;
  if (days === null) return "Date needs confirmation";
  if (days <= 4) return "Use first";
  if (days <= 7) return "Use this week";
  return "Fresh for now";
};

const dateSource = (item: InventoryItem) => {
  if (item.dateType === "confirmed") return "Package date confirmed";
  if (item.dateType === "needs-confirmation" || !item.expiresAt) return "Date needs confirmation";
  if (item.dateType === "recommended") return "Recommended use-by date";
  return "Estimated use-first date";
};

export function InventoryScreen({
  items,
  notice,
  onHome,
  onScan,
  onSettings,
  onOpenItem,
  onUndo,
}: InventoryScreenProps) {
  const [query, setQuery] = useState("");
  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;
    return items.filter((item) =>
      [item.name, item.brand].filter(Boolean).some((value) => value!.toLowerCase().includes(normalizedQuery)),
    );
  }, [items, query]);

  const groupedItems = groupOrder.map((group) => ({
    group,
    items: filteredItems.filter((item) => getGroup(item) === group),
  }));

  return (
    <ScreenLayout
      className="inventory-screen"
      title="My Fridge"
      intro="Food is ordered by what should be used first."
    >
      {notice ? (
        <div className="notice" role="status">
          <span>{notice}</span>
          {onUndo ? (
            <button className="text-button" type="button" onClick={onUndo}>Undo</button>
          ) : null}
        </div>
      ) : null}

      <div className="field-group compact-field">
        <label className="visually-hidden" htmlFor="inventory-search">Search my fridge</label>
        <input
          id="inventory-search"
          type="search"
          placeholder="Search product or brand"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {filteredItems.length ? (
        <div className="urgency-groups">
          {groupedItems.map(({ group, items: groupItems }) =>
            groupItems.length ? (
              <section
                className={`urgency-group ${urgencyClass[group]}`}
                key={group}
                aria-labelledby={`group-${group.replaceAll(" ", "-")}`}
              >
                <div className="section-heading-row">
                  <h2 id={`group-${group.replaceAll(" ", "-")}`}>{group}</h2>
                  <span>{groupItems.length}</span>
                </div>
                <div className="fridge-list">
                  {groupItems.map((item) => {
                    const expiration = getExpirationSummary(item.expiresAt);
                    return (
                      <article className="fridge-item" key={item.id}>
                        <button className="fridge-item-main" type="button" onClick={() => onOpenItem(item.id)}>
                          <FoodIcon name={item.name} />
                          <span className="fridge-item-copy">
                            <strong>{item.name}</strong>
                            <span className={`remaining-time status-${expiration.state}`}>{expiration.label}</span>
                            <small>{item.quantity || "Quantity not set"} | {dateSource(item)}</small>
                          </span>
                        </button>
                      </article>
                    );
                  })}
                </div>
              </section>
            ) : null,
          )}
        </div>
      ) : (
        <div className="empty-state">
          <h2>{items.length ? "No matching groceries" : "Your fridge is empty"}</h2>
          <p>{items.length ? "Try a different search." : "Scan groceries to start your inventory."}</p>
        </div>
      )}

      <BottomNavigation
        activeSection="fridge"
        onHome={onHome}
        onInventory={() => undefined}
        onScan={onScan}
        onSettings={onSettings}
      />
    </ScreenLayout>
  );
}
