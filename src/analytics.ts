// GA4 Analytics helper
// Measurement ID should come from env: VITE_GA4_ID

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function initGA4() {
  const id = import.meta.env.VITE_GA4_ID;
  if (!id || import.meta.env.DEV) return;

  // Initialize dataLayer
  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  // Load gtag script dynamically
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.gtag = function() {
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', id, {
    page_path: window.location.pathname,
    page_title: document.title,
    anonymize_ip: true,
  });
}

export function trackEvent(name: string, params?: Record<string, string | number>) {
  if (import.meta.env.DEV || !window.gtag) return;
  window.gtag('event', name, params || {});
}

// Custom events for x402
export function trackAPICall(endpoint: string) {
  trackEvent('api_call', { endpoint });
}

export function trackWalletConnect() {
  trackEvent('wallet_connect');
}

export function trackPlaygroundUse(api: string) {
  trackEvent('playground_use', { api });
}

export function trackQuickstartPath(path: string) {
  trackEvent('quickstart_path', { path });
}
