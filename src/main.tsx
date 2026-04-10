import * as Sentry from "@sentry/react";
import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LanguageProvider } from "./i18n/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import App from "./App";
import "./index.css";

// Heavy provider tree (wagmi + thirdweb + react-query) — lazy to defer
// the @thirdweb-dev/wagmi-adapter and thirdweb bundles from the initial load.
const Providers = lazy(() => import("./Providers"));

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    tracesSampleRate: 0,
  });
}

const root = document.getElementById("root");

function AppShellLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
}

// renderError uses static HTML strings only — no user content, not an XSS risk.
function renderError(_err: unknown) {
  if (root) {
    const errorHtml = [
      '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0f;color:#E8E4E0;font-family:Inter,system-ui,sans-serif;padding:2rem">',
      '<div style="max-width:600px;text-align:center">',
      '<div style="width:56px;height:56px;border-radius:50%;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.2);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">',
      '<svg width="28" height="28" fill="none" stroke="#F87171" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>',
      "</div>",
      '<h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.5rem">x402 Bazaar — Loading Error</h2>',
      '<p style="color:#9ca3af;font-size:0.875rem;margin-bottom:1rem">The application failed to initialize. This may be caused by browser extensions or security settings.</p>',
      '<p style="background:#1a1f2e;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:1rem;text-align:left;font-size:0.75rem;color:#F87171;margin-bottom:1rem">The application failed to initialize. Check the browser console for details.</p>',
      '<button onclick="location.reload()" style="background:linear-gradient(135deg,#FF9900,#e68a00);color:white;border:none;padding:0.625rem 1.5rem;border-radius:8px;font-size:0.875rem;font-weight:500;cursor:pointer">Refresh Page</button>',
      "</div></div>",
    ].join("");
    // eslint-disable-next-line no-unsanitized/property -- static strings only
    root.innerHTML = errorHtml;
  }
}

try {
  createRoot(root!).render(
    <StrictMode>
      <BrowserRouter>
        <ThemeProvider>
          <LanguageProvider>
            <Suspense fallback={<AppShellLoading />}>
              <Providers>
                <App />
              </Providers>
            </Suspense>
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
    </StrictMode>,
  );
} catch (err) {
  console.error("Fatal initialization error:", err);
  renderError(err);
}

// Catch unhandled errors that crash React tree
window.addEventListener("error", (event) => {
  if (root && !root.hasChildNodes()) {
    renderError(event.error || event.message);
  }
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});
