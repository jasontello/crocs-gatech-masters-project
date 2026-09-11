import { useEffect } from "react";

interface OpeningAnimationProps {
  onComplete: () => void;
}

const INTRO_DURATION = 2200;

export function OpeningAnimation({ onComplete }: OpeningAnimationProps) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      onComplete();
      return undefined;
    }

    const timer = window.setTimeout(onComplete, INTRO_DURATION);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <main className="intro-screen" aria-label="Opening refrigerator inventory">
      <button
        className="intro-tap-target"
        type="button"
        aria-label="Skip intro animation"
        onClick={onComplete}
      />
      <div className="intro-stage">
        <div className="fridge-mark" aria-hidden="true">
          <span className="fridge-divider" />
          <span className="fridge-handle fridge-handle-top" />
          <span className="fridge-handle fridge-handle-bottom" />
          <span className="fridge-shelf fridge-shelf-one" />
          <span className="fridge-shelf fridge-shelf-two" />
        </div>
        <div className="intro-copy" role="status" aria-live="polite">
          <span className="intro-eyebrow">CROCS prototype</span>
          <h1>Refrigerator inventory</h1>
          <p>See what you have. Use it before it goes to waste.</p>
        </div>
      </div>
    </main>
  );
}
