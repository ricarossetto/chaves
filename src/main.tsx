import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import "./index.css";
import App from "./App";
import { I18nProvider } from "./lib/i18n";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* One policy for the whole tree: honour the OS reduced-motion setting and
        fall back to a short tween rather than a hard cut, so state changes are
        still legible when motion is off. */}
    <MotionConfig reducedMotion="user">
      <I18nProvider>
        <App />
      </I18nProvider>
    </MotionConfig>
  </StrictMode>,
);
