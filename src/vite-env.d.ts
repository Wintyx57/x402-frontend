/// <reference types="vite/client" />
/// <reference types="react/jsx-runtime" />

interface ImportMetaEnv {
  readonly VITE_GA4_ID?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
