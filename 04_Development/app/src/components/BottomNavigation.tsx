import { useEffect, useRef, useState } from "react";
import { House, Refrigerator, ScanBarcode, Settings } from "lucide-react";

export type PrimarySection = "home" | "scan" | "fridge" | "settings";

interface BottomNavigationProps {
  activeSection: PrimarySection;
  autoHide?: boolean;
  onHome: () => void;
  onInventory: () => void;
  onScan: () => void;
  onSettings: () => void;
}

export function BottomNavigation({
  activeSection,
  autoHide = true,
  onHome,
  onInventory,
  onScan,
  onSettings,
}: BottomNavigationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const shouldShow = !autoHide || isVisible;

  useEffect(() => {
    if (!autoHide) return;

    lastScrollY.current = Math.max(0, window.scrollY);

    const handleScroll = () => {
      const currentScrollY = Math.max(0, window.scrollY);
      const scrollDifference = currentScrollY - lastScrollY.current;

      if (currentScrollY <= 12) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (Math.abs(scrollDifference) < 10) return;

      setIsVisible(scrollDifference < 0);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [autoHide]);

  return (
    <nav
      className={`bottom-navigation bottom-navigation-four${shouldShow ? "" : " bottom-navigation-hidden"}`}
      aria-label="Primary navigation"
      data-visible={shouldShow}
      onFocusCapture={() => setIsVisible(true)}
    >
      <button
        type="button"
        aria-current={activeSection === "home" ? "page" : undefined}
        onClick={onHome}
      >
        <span className="nav-mark" aria-hidden="true"><House /></span>
        <span>Home</span>
      </button>
      <button
        type="button"
        aria-label="My Fridge"
        aria-current={activeSection === "fridge" ? "page" : undefined}
        onClick={onInventory}
      >
        <span className="nav-mark" aria-hidden="true"><Refrigerator /></span>
        <span>Fridge</span>
      </button>
      <button
        type="button"
        aria-current={activeSection === "scan" ? "page" : undefined}
        onClick={onScan}
      >
        <span className="nav-mark" aria-hidden="true"><ScanBarcode /></span>
        <span>Scan</span>
      </button>
      <button
        type="button"
        aria-current={activeSection === "settings" ? "page" : undefined}
        onClick={onSettings}
      >
        <span className="nav-mark" aria-hidden="true"><Settings /></span>
        <span>Settings</span>
      </button>
    </nav>
  );
}
