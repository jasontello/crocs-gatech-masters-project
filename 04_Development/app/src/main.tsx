import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
const AccountApp = lazy(() => import("./features/account/AccountApp"));
import { LandingPage } from "./features/landing/LandingPage";
import "./styles/global.css";

const params = new URLSearchParams(window.location.search);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {params.has("prototype") ? (
      <Suspense fallback={<p>Loading prototype…</p>}>
        <AccountApp skipIntro={params.has("skipIntro")} />
      </Suspense>
    ) : (
      <LandingPage />
    )}
  </StrictMode>,
);
