import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App skipIntro={!new URLSearchParams(window.location.search).has("intro")} />
  </StrictMode>,
);
