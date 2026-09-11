import type { ReactNode } from "react";

interface PortraitOnlyProps {
  children: ReactNode;
}

export function PortraitOnly({ children }: PortraitOnlyProps) {
  return (
    <>
      <div className="portrait-app">{children}</div>
      <aside className="landscape-lock" role="alert" aria-label="Portrait mode required">
        <div>
          <strong>Portrait mode only</strong>
          <p>Rotate your phone upright to continue using CROCS.</p>
        </div>
      </aside>
    </>
  );
}
