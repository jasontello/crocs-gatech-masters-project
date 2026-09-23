import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { LandingPage } from "./features/landing/LandingPage";
import "./styles/global.css";

const params = new URLSearchParams(window.location.search);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {params.has("prototype") ? (
      <App skipIntro={params.has("skipIntro")} />
    ) : (
      <LandingPage />
    )}
  </StrictMode>,
);
