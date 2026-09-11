import type { ReactNode } from "react";

interface ScreenLayoutProps {
  title: ReactNode;
  intro?: string;
  children: ReactNode;
  backLabel?: string;
  onBack?: () => void;
  className?: string;
  headerArtwork?: ReactNode;
}

export function ScreenLayout({
  title,
  intro,
  children,
  backLabel = "Back",
  onBack,
  className,
  headerArtwork,
}: ScreenLayoutProps) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <main
        className={`app-shell${className ? ` ${className}` : ""}`}
        id="main-content"
        tabIndex={-1}
      >
        {onBack ? (
          <button className="back-button" type="button" onClick={onBack}>
            ← {backLabel}
          </button>
        ) : null}
        <header className="screen-header">
          <div className="screen-header-copy">
            <h1>{title}</h1>
            {intro ? <p>{intro}</p> : null}
          </div>
          {headerArtwork}
        </header>
        {children}
      </main>
    </>
  );
}
