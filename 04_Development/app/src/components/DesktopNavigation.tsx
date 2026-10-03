import { House, Refrigerator, ScanBarcode, Settings } from "lucide-react";
import type { PrimarySection } from "./BottomNavigation";

interface DesktopNavigationProps {
  activeSection: PrimarySection;
  onHome: () => void;
  onInventory: () => void;
  onScan: () => void;
  onSettings: () => void;
}

export function DesktopNavigation({
  activeSection,
  onHome,
  onInventory,
  onScan,
  onSettings,
}: DesktopNavigationProps) {
  return (
    <aside className="desktop-sidebar">
      <div className="desktop-brand">
        <span className="desktop-brand-mark" aria-hidden="true">
          <span className="fridge-mark">
            <span className="fridge-divider" />
            <span className="fridge-handle fridge-handle-top" />
            <span className="fridge-handle fridge-handle-bottom" />
            <span className="fridge-shelf fridge-shelf-one" />
            <span className="fridge-shelf fridge-shelf-two" />
          </span>
        </span>
        <div>
          <strong>CROCS</strong>
          <span>Refrigerator inventory</span>
        </div>
      </div>

      <nav
        className="desktop-navigation"
        aria-label="Desktop primary navigation"
      >
        <button
          type="button"
          aria-current={activeSection === "home" ? "page" : undefined}
          onClick={onHome}
        >
          <House aria-hidden="true" />
          Home
        </button>
        <button
          type="button"
          aria-current={activeSection === "fridge" ? "page" : undefined}
          onClick={onInventory}
        >
          <Refrigerator aria-hidden="true" />
          My Fridge
        </button>
        <button
          type="button"
          aria-current={activeSection === "scan" ? "page" : undefined}
          onClick={onScan}
        >
          <ScanBarcode aria-hidden="true" />
          Scan groceries
        </button>
        <button
          type="button"
          aria-current={activeSection === "settings" ? "page" : undefined}
          onClick={onSettings}
        >
          <Settings aria-hidden="true" />
          Settings
        </button>
      </nav>

      <div className="desktop-sidebar-footer">
        <p>Research prototype. Inventory is saved in this browser only.</p>
        <a href={import.meta.env.BASE_URL}>About the project</a>
      </div>
    </aside>
  );
}
