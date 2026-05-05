// Thin wrapper around posthog-js to capture funnel events with type safety
// and graceful no-op when PostHog is disabled (dev or missing key).
import posthog from "posthog-js";

type EventName =
  | "landing_view"
  | "quickstart_view"
  | "cli_install_copied"
  | "free_call_clicked"
  | "service_clicked"
  | "register_view"
  | "register_submitted"
  | "wallet_connected"
  | "paid_call_button_clicked"
  | "fund_wallet_view"
  | "docs_cookbook_view"
  | "providers_view"
  | "security_view";

function isReady(): boolean {
  return Boolean(
    import.meta.env.PROD && import.meta.env.VITE_POSTHOG_PROJECT_API_KEY,
  );
}

export function track(
  event: EventName,
  properties: Record<string, unknown> = {},
): void {
  if (!isReady()) return;
  try {
    posthog.capture(event, properties);
  } catch {
    // best-effort, never break UX over analytics
  }
}

export function identifyWallet(address: string): void {
  if (!isReady() || !address) return;
  try {
    posthog.identify(`wallet:${address.toLowerCase()}`, {
      wallet_address: address.toLowerCase(),
    });
  } catch {
    // best-effort
  }
}

export function reset(): void {
  if (!isReady()) return;
  try {
    posthog.reset();
  } catch {
    // best-effort
  }
}
