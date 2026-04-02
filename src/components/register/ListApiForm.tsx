import { useState, useEffect, useRef } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useConnectModal } from "thirdweb/react";
import { thirdwebClient, wallets } from "../../lib/thirdweb";
import { Link } from "react-router-dom";
import { useTranslation } from "../../i18n/LanguageContext";
import { API_URL } from "../../config";
import CredentialsSection, {
  buildCredentialsPayload,
  type CredentialType,
  type CredentialItem,
} from "../CredentialsSection";
import EmbedSnippet from "../EmbedSnippet";
import { trackEvent } from "../../lib/analytics";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ListApiFormProps {
  onBack: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PRICE_PRESETS = [0.001, 0.005, 0.01, 0.05, 0.1];

const CATEGORIES = [
  { value: "ai", label: "AI & ML" },
  { value: "data", label: "Data" },
  { value: "finance", label: "Finance" },
  { value: "media", label: "Media" },
  { value: "security", label: "Security" },
  { value: "devtools", label: "Developer Tools" },
  { value: "other", label: "Other" },
];

const METHODS = ["GET", "POST"] as const;

// Estimate used in revenue projection
const DAILY_CALLS_ESTIMATE = 100;

// Allowlist of error message substrings safe to surface directly to users
const SAFE_ERROR_MESSAGES = [
  "User rejected",
  "Unexpected response",
  "Invalid",
  "required",
  "Price",
  "URL",
  "wallet",
];

// Split a comma-separated string into a trimmed, non-empty array
function splitCommaList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-semibold text-gray-400 mb-1.5 tracking-wide"
    >
      {children}
    </label>
  );
}

function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full px-4 py-3 rounded-xl",
        "bg-[#12141a]/80 border border-white/[0.07] text-white",
        "outline-none placeholder-gray-600",
        "focus:border-[#FF9900] focus:shadow-[0_0_0_3px_rgba(255,153,0,0.1)]",
        "transition duration-200",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

function FieldTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={[
        "w-full px-4 py-3 rounded-xl",
        "bg-[#12141a]/80 border border-white/[0.07] text-white",
        "outline-none placeholder-gray-600 resize-none",
        "focus:border-[#FF9900] focus:shadow-[0_0_0_3px_rgba(255,153,0,0.1)]",
        "transition duration-200",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

function FieldSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        "w-full px-4 py-3 rounded-xl appearance-none",
        "bg-[#12141a]/80 border border-white/[0.07] text-white",
        "outline-none",
        "focus:border-[#FF9900] focus:shadow-[0_0_0_3px_rgba(255,153,0,0.1)]",
        "transition duration-200",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

// Revenue hint at the bottom of the form
function RevenueHint({ price }: { price: string }) {
  const priceNum = parseFloat(price);
  if (!price || isNaN(priceNum) || priceNum <= 0) return null;

  const monthly = priceNum * DAILY_CALLS_ESTIMATE * 30 * 0.95;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#34D399]/[0.05] border border-[#34D399]/20">
      {/* SVG dollar icon — no emoji */}
      <svg
        className="w-5 h-5 text-[#34D399] shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
        />
      </svg>
      <p className="text-sm text-[#34D399]">
        At {DAILY_CALLS_ESTIMATE} calls/day you earn{" "}
        <span className="font-bold font-mono">
          ${monthly.toFixed(2)} USDC/month
        </span>{" "}
        (95% share)
      </p>
    </div>
  );
}

// Credential validation badge
function CredentialBadge({
  status,
  message,
}: {
  status?: string;
  message?: string;
}) {
  if (!status || status === "skipped") return null;

  const isWarning = status === "warning";
  const isValid = status === "valid";

  if (!isWarning && !isValid) return null;

  return (
    <div
      className={[
        "px-4 py-3 rounded-xl border text-xs text-left",
        isWarning
          ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
          : "bg-green-500/10 border-green-500/30 text-green-300",
      ].join(" ")}
    >
      <span className="font-semibold">
        {isWarning ? "Credential warning: " : "Credentials verified. "}
      </span>
      {isWarning
        ? message
        : "Your upstream credentials were validated successfully."}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ListApiForm({ onBack }: ListApiFormProps) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { connect } = useConnectModal();
  const { t } = useTranslation();

  // ── Core required fields ──────────────────────────────────────────────────
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [wallet, setWallet] = useState("");

  // ── Advanced (expandable) fields ──────────────────────────────────────────
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("utility");
  const [method, setMethod] = useState<"GET" | "POST">("GET");
  const [tags, setTags] = useState("");
  const [requiredParams, setRequiredParams] = useState("");

  // ── Credentials ───────────────────────────────────────────────────────────
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentialType, setCredentialType] =
    useState<CredentialType>("bearer");
  const [credentialItems, setCredentialItems] = useState<CredentialItem[]>([
    { key: "", value: "" },
  ]);

  // ── Async state ───────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // Auto-fill wallet when wallet connects
  useEffect(() => {
    if (isConnected && address && !wallet) {
      setWallet(address);
    }
  }, [isConnected, address]); // intentionally omit `wallet` to avoid overwriting manual edits

  // Scroll to error when it appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error]);

  // ─────────────────────────────────────────────────────────────────────────
  // Submit handler
  // ─────────────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Require wallet connection for signing
    if (!isConnected) {
      connect({ client: thirdwebClient, wallets });
      return setError(
        "Please connect your wallet first to sign the registration",
      );
    }

    // Validate required fields
    if (!url.trim() || !price.trim() || !wallet.trim()) {
      return setError("URL, price and wallet address are all required");
    }
    if (!url.startsWith("http")) {
      return setError("URL must start with http:// or https://");
    }
    try {
      new URL(url);
    } catch {
      return setError("Invalid URL format");
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0.001 || priceNum > 1000) {
      return setError("Price must be between 0.001 and 1000 USDC");
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return setError(
        "Invalid wallet address (must be a 0x… Ethereum address)",
      );
    }

    setLoading(true);

    try {
      const timestamp = Date.now();
      const hasAdvanced = !!(name.trim() || description.trim() || tags.trim());
      const credentials = buildCredentialsPayload(
        credentialType,
        credentialItems,
      );

      if (hasAdvanced) {
        // ── Full batch-register path ─────────────────────────────────────
        const message = `batch-register:${address}:1:${timestamp}`;
        const signature = await signMessageAsync({ message });

        const userTags = splitCommaList(tags);
        if (category && !userTags.includes(category))
          userTags.unshift(category);

        const service: Record<string, unknown> = {
          name: name.trim() || url.split("/").pop() || "API",
          description: description.trim() || undefined,
          url,
          price: priceNum,
          tags: userTags.length ? userTags : ["utility"],
          method,
        };
        const params = splitCommaList(requiredParams);
        if (params.length) service.required_parameters = { required: params };
        if (credentials) service.credentials = credentials;

        const res = await fetch(`${API_URL}/batch-register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            services: [service],
            ownerAddress: wallet,
            signature,
            timestamp,
          }),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || data.message || "Registration failed");
        setResult(data);
        trackEvent("register_api", { method: "full" });
      } else {
        // ── Quick-register path ───────────────────────────────────────────
        const message = `quick-register:${url}:${wallet}:${timestamp}`;
        const signature = await signMessageAsync({ message });

        const payload: Record<string, unknown> = {
          url,
          price: priceNum,
          ownerAddress: wallet,
          signature,
          timestamp,
        };
        if (credentials) payload.credentials = credentials;

        const res = await fetch(`${API_URL}/quick-register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || data.message || "Registration failed");
        setResult(data);
        trackEvent("register_api", { method: "quick" });
      }
    } catch (err: unknown) {
      const e = err as Error;
      const isSafe = SAFE_ERROR_MESSAGES.some((m) => e.message?.includes(m));
      setError(isSafe ? e.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setUrl("");
    setPrice("");
    setWallet(isConnected && address ? address : "");
    setName("");
    setDescription("");
    setCategory("utility");
    setMethod("GET");
    setTags("");
    setRequiredParams("");
    setShowCredentials(false);
    setCredentialItems([{ key: "", value: "" }]);
    setResult(null);
    setError(null);
    setExpanded(false);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Success screen
  // ─────────────────────────────────────────────────────────────────────────

  if (result) {
    const proxyEndpoint: string | undefined =
      result?.data?.proxy_url ?? result?.services?.[0]?.proxy_url;
    const serviceId: string =
      result?.data?.id ?? result?.services?.[0]?.id ?? "";
    const serviceName: string =
      (result?.data?.name ?? result?.services?.[0]?.name ?? name) || "Your API";
    const credValidation =
      result?.credential_validation ??
      result?.services?.[0]?.credential_validation;

    return (
      <div className="max-w-lg mx-auto animate-fade-in-up">
        {/* Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-white/5 to-white/[0.015] backdrop-blur-xl p-10">
          {/* Top glow highlight */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#34D399]/60 to-transparent"
          />
          {/* Radial background glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(52,211,153,0.12) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 text-center">
            {/* Checkmark */}
            <div className="w-20 h-20 rounded-full bg-[#34D399]/10 border-2 border-[#34D399]/30 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-[#34D399]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">
              Your API is live!
            </h2>
            <p className="text-gray-400 text-sm mb-6">{serviceName}</p>

            {/* Credential validation badge */}
            {credValidation && (
              <div className="mb-4 text-left">
                <CredentialBadge
                  status={credValidation.status}
                  message={credValidation.message}
                />
              </div>
            )}

            {/* 3 info items */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-left">
              {[
                { num: "01", text: "Live on marketplace" },
                { num: "02", text: "Discoverable by AI agents" },
                { num: "03", text: "You earn 95% in USDC" },
              ].map((item) => (
                <div
                  key={item.num}
                  className="rounded-xl bg-[#12141a]/60 border border-white/[0.06] px-4 py-3"
                >
                  <span className="block text-[10px] font-mono font-bold text-[#34D399]/60 mb-1">
                    {item.num}
                  </span>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Proxy endpoint */}
            {proxyEndpoint && (
              <div className="mb-6 text-left">
                <p className="text-xs text-gray-500 mb-1.5 font-semibold tracking-wide uppercase">
                  Proxy endpoint
                </p>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#12141a]/80 border border-white/[0.07] font-mono text-xs text-[#34D399] break-all">
                  {proxyEndpoint}
                </div>
              </div>
            )}

            {/* Embed snippet */}
            {serviceId && (
              <div className="mb-6 text-left">
                <EmbedSnippet serviceId={serviceId} serviceName={serviceName} />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                           bg-[#12141a]/80 border border-white/[0.07] text-gray-300 hover:text-white
                           no-underline transition-colors"
              >
                View all services
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>

              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                           bg-gradient-to-br from-[#34D399] to-[#10b981] text-[#0a0a0f]
                           hover:shadow-[0_0_30px_rgba(52,211,153,0.3)] hover:-translate-y-0.5
                           transition cursor-pointer border-none"
              >
                Register Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Main form
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-lg mx-auto animate-fade-in-up">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-8 bg-transparent border-none cursor-pointer"
        aria-label="Back to monetization options"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to options
      </button>

      {/* Glass card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-white/5 to-white/[0.015] backdrop-blur-xl p-10">
        {/* Top highlight line */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#34D399]/50 to-transparent"
        />

        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="flex items-center gap-2.5 mb-2">
            <span
              className="w-2 h-2 rounded-full bg-[#34D399] shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              aria-hidden="true"
            />
            <h2 className="text-2xl font-bold text-white tracking-tight">
              List Your API
            </h2>
          </div>
          <p className="text-sm text-gray-400 mb-5 leading-relaxed">
            Paste your endpoint URL, set a price, and you're live.
          </p>

          {/* Wallet connection banner — shown prominently before form fields */}
          {!isConnected && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-[#FF9900]/10 border border-[#FF9900]/30 flex items-center gap-3">
              <svg
                className="w-5 h-5 text-[#FF9900] shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-[#FF9900] font-medium">
                  Wallet required
                </p>
                <p className="text-xs text-gray-400">
                  Connect your wallet to sign the registration and receive
                  payments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => connect({ client: thirdwebClient, wallets })}
                className="px-4 py-1.5 text-xs font-semibold text-black bg-[#FF9900] rounded-lg cursor-pointer border-none hover:brightness-110 transition shrink-0"
              >
                Connect
              </button>
            </div>
          )}

          <div className="mb-5">
            <FieldLabel htmlFor="list-url">
              API URL <span className="text-red-400">*</span>
            </FieldLabel>
            <FieldInput
              id="list-url"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/v1/endpoint"
              aria-describedby="url-hint"
            />
            <p className="text-[11px] text-amber-400/60 mt-1.5" id="url-hint">
              {t.register?.urlHint ||
                "Enter your API's direct endpoint URL, not a proxy or wrapper."}
            </p>
          </div>

          <div className="mb-5">
            <FieldLabel htmlFor="list-price">
              Price per call <span className="text-red-400">*</span>
            </FieldLabel>

            {/* Presets */}
            <div
              className="flex flex-wrap gap-2 mb-2.5"
              role="group"
              aria-label="Price presets"
            >
              {PRICE_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrice(String(p))}
                  className={[
                    "px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border",
                    price === String(p)
                      ? "bg-[#34D399]/10 text-[#34D399] border-[#34D399]/30"
                      : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20",
                  ].join(" ")}
                >
                  ${p}
                </button>
              ))}
            </div>

            {/* Input with USDC suffix */}
            <div className="relative">
              <FieldInput
                id="list-price"
                type="number"
                step="0.001"
                min="0.001"
                max="1000"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.01"
                className="pr-16"
                aria-label="Price in USDC"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-500 pointer-events-none select-none">
                USDC
              </span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel htmlFor="list-wallet">
                Payment wallet <span className="text-red-400">*</span>
              </FieldLabel>
              {isConnected && address && (
                <button
                  type="button"
                  onClick={() => setWallet(address)}
                  className="text-xs text-[#34D399] hover:text-[#6ee7b7] transition-colors cursor-pointer bg-transparent border-none"
                >
                  Use Connected
                </button>
              )}
            </div>
            <FieldInput
              id="list-wallet"
              type="text"
              required
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="0x..."
              spellCheck={false}
            />
            {!isConnected && (
              <p className="text-[11px] text-gray-500 mt-1.5">
                <button
                  type="button"
                  onClick={() => connect({ client: thirdwebClient, wallets })}
                  className="text-[#34D399] hover:underline bg-transparent border-none cursor-pointer p-0 text-[11px]"
                >
                  Connect wallet
                </button>{" "}
                to auto-fill and sign.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2 w-full text-sm text-gray-400 hover:text-white transition-colors mb-4 cursor-pointer bg-transparent border-none"
            aria-expanded={expanded}
            aria-controls="advanced-fields"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            <span>Customize (name, tags, credentials…)</span>
            {(name || tags || description || showCredentials) && (
              <span className="ml-auto px-2 py-0.5 rounded-full bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399] text-[10px] font-mono">
                filled
              </span>
            )}
          </button>

          <div
            id="advanced-fields"
            style={{
              display: expanded ? "block" : "none",
            }}
          >
            <div className="border-t border-white/[0.06] mb-5" />

            <div className="space-y-5">
              <div>
                <FieldLabel htmlFor="list-name">Service name</FieldLabel>
                <FieldInput
                  id="list-name"
                  type="text"
                  maxLength={200}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome API"
                />
              </div>

              <div>
                <FieldLabel htmlFor="list-description">Description</FieldLabel>
                <FieldTextarea
                  id="list-description"
                  rows={3}
                  maxLength={1000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does your API do? How should AI agents use it?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="list-category">Category</FieldLabel>
                  <div className="relative">
                    <FieldSelect
                      id="list-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </FieldSelect>
                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <FieldLabel htmlFor="list-method">HTTP method</FieldLabel>
                  <div
                    className="flex rounded-xl overflow-hidden border border-white/[0.07]"
                    role="group"
                    aria-label="HTTP Method"
                  >
                    {METHODS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethod(m)}
                        className={[
                          "flex-1 py-3 text-sm font-mono font-semibold transition-all cursor-pointer border-none",
                          method === m
                            ? "bg-[#34D399]/10 text-[#34D399]"
                            : "bg-[#12141a]/80 text-gray-500 hover:text-gray-300",
                        ].join(" ")}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="list-tags">Tags</FieldLabel>
                <FieldInput
                  id="list-tags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="weather, forecast, realtime (comma separated)"
                />
              </div>

              <div>
                <FieldLabel htmlFor="list-params">
                  Required parameters
                </FieldLabel>
                <FieldInput
                  id="list-params"
                  type="text"
                  value={requiredParams}
                  onChange={(e) => setRequiredParams(e.target.value)}
                  placeholder="city, units (comma separated)"
                />
              </div>

              <CredentialsSection
                showCredentials={showCredentials}
                onToggle={() => setShowCredentials((v) => !v)}
                credentialType={credentialType}
                onTypeChange={setCredentialType}
                credentialItems={credentialItems}
                onItemsChange={setCredentialItems}
              />
            </div>

            <div className="border-t border-white/[0.06] mt-6 mb-6" />
          </div>

          <div className="mb-6">
            <RevenueHint price={price} />
          </div>

          {error && (
            <div
              ref={errorRef}
              role="alert"
              className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={[
              "w-full py-3.5 rounded-2xl font-semibold text-[#0a0a0f]",
              "bg-gradient-to-br from-[#34D399] to-[#10b981]",
              "hover:shadow-[0_0_40px_rgba(52,211,153,0.25)] hover:-translate-y-0.5",
              "transition duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none",
              "cursor-pointer border-none",
            ].join(" ")}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Signing &amp; listing…
              </span>
            ) : (
              "List My API"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
