import { BottomNavigation } from "../../components/BottomNavigation";
import { FoodIcon } from "../../components/FoodIcon";
import { ScreenLayout } from "../../components/ScreenLayout";
import { ChevronRight } from "lucide-react";
import type { InventoryItem } from "../../types/inventory";
import { getExpirationSummary, isExpiringSoon } from "../inventory/expiration";

interface HomeScreenProps {
  items: InventoryItem[];
  notice?: string;
  onScan: () => void;
  onOpenFridge: () => void;
  onOpenItem: (id: string) => void;
  onSettings: () => void;
}

const expirationRank = (item: InventoryItem) => {
  const days = getExpirationSummary(item.expiresAt).daysRemaining;
  return days === null ? Number.POSITIVE_INFINITY : days;
};

const priorityLabel = (item: InventoryItem) => {
  const { daysRemaining, label } = getExpirationSummary(item.expiresAt);
  if (daysRemaining === null || daysRemaining < 0) return label;
  if (daysRemaining === 0) return "Use today";
  return `Use within ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`;
};

export function HomeScreen({
  items,
  notice,
  onScan,
  onOpenFridge,
  onOpenItem,
  onSettings,
}: HomeScreenProps) {
  const expiringCount = items.filter(isExpiringSoon).length;
  const useFirst = [...items]
    .filter((item) => getExpirationSummary(item.expiresAt).state !== "fresh")
    .sort((a, b) => expirationRank(a) - expirationRank(b))
    .slice(0, 2);
  const recentlyAdded = [...items]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  return (
    <ScreenLayout
      className="home-screen"
      title={<>Your <span className="title-line">fridge</span></>}
      intro="Use what needs attention first."
      headerArtwork={(
        <img
          className="home-hero-fruit"
          src={`${import.meta.env.BASE_URL}assets/editorial/imperfect-orange.webp`}
          alt=""
          aria-hidden="true"
        />
      )}
    >
      <p className="project-context">CROCS · Georgia Tech CS 8903<br />Research demo with sample groceries and simulated recognition.</p>
      {notice ? <div className="notice" role="status">{notice}</div> : null}

      <section className="home-summary" aria-label="Refrigerator summary">
        <p><strong>{items.length}</strong> <span>Items tracked</span></p>
        <p><strong>{expiringCount}</strong> <span>Use soon</span></p>
      </section>

      <section className="priority-section" aria-labelledby="use-first-heading">
        <div className="section-heading-row">
          <h2 id="use-first-heading">Use first</h2>
        </div>
        {useFirst.length ? (
          <div className="priority-list">
            {useFirst.map((item, index) => {
              return (
                <button
                  className={`priority-item priority-${index + 1}`}
                  key={item.id}
                  type="button"
                  onClick={() => onOpenItem(item.id)}
                >
                  <FoodIcon name={item.name} />
                  <span className="priority-copy">
                    <strong>{item.name}</strong>
                    <span>{priorityLabel(item)}</span>
                    <small>{item.quantity || "Quantity not set"}</small>
                  </span>
                  <ChevronRight className="priority-arrow" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        ) : (
          <p className="plain-empty">Nothing needs immediate attention.</p>
        )}
      </section>

      <button className="primary-button scan-groceries-button" type="button" onClick={onScan}>
        Scan groceries
      </button>

      <section className="recent-section" aria-labelledby="recent-heading">
        <h2 id="recent-heading">Recently added</h2>
        {recentlyAdded.length ? (
          <div className="recent-list">
            {recentlyAdded.slice(0, 2).map((item, index) => (
              <button key={item.id} type="button" onClick={() => onOpenItem(item.id)}>
                {index ? <span className="recent-dot" aria-hidden="true">•</span> : null}
                <strong>{item.name}</strong>
              </button>
            ))}
          </div>
        ) : null}
        <img
          className="recent-fruit"
          src={`${import.meta.env.BASE_URL}assets/editorial/imperfect-lemon.webp`}
          alt=""
          aria-hidden="true"
        />
      </section>

      <BottomNavigation
        activeSection="home"
        onHome={() => undefined}
        onInventory={onOpenFridge}
        onScan={onScan}
        onSettings={onSettings}
      />
    </ScreenLayout>
  );
}
