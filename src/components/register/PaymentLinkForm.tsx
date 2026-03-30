import { useState, useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useConnectModal } from "thirdweb/react";
import { thirdwebClient, wallets } from "../../lib/thirdweb";
import { Link } from "react-router-dom";
import { API_URL } from "../../config";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PaymentLinkFormProps {
  onBack: () => void;
}

interface PaylinkResult {
  payment_link?: {
    paywall_url?: string;
    id?: string;
  };
  id?: string;
  share_url?: string;
}

interface PaylinkFormState {
  title: string;
  description: string;
  targetUrl: string;
  price: string;
  wallet: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Price presets
// ─────────────────────────────────────────────────────────────────────────────

const PRICE_PRESETS = [0.001, 0.01, 0.05, 0.1, 1.0];

// ─────────────────────────────────────────────────────────────────────────────
// Input label helper
// ─────────────────────────────────────────────────────────────────────────────

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
      {children}
      {required && (
        <span className="text-[#A78BFA] ml-1" aria-label="required">
          *
        </span>
      )}
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared input classes
// ─────────────────────────────────────────────────────────────────────────────

const INPUT_CLS =
  "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-gray-600 " +
  "focus:outline-none focus:border-[#A78BFA]/50 focus:ring-1 focus:ring-[#A78BFA]/20 transition-all duration-200";

// ─────────────────────────────────────────────────────────────────────────────
// PaymentLinkForm
// ─────────────────────────────────────────────────────────────────────────────

export default function PaymentLinkForm({ onBack }: PaymentLinkFormProps) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { connect } = useConnectModal();

  const [form, setForm] = useState<PaylinkFormState>({
    title: "",
    description: "",
    targetUrl: "",
    price: "0.05",
    wallet: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaylinkResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-fill wallet when connected
  useEffect(() => {
    if (isConnected && address) {
      setForm((prev) => (prev.wallet ? prev : { ...prev, wallet: address }));
    }
  }, [isConnected, address]);

  const set = (field: keyof PaylinkFormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConnected) {
      connect({ client: thirdwebClient, wallets });
      return;
    }

    if (!form.title.trim()) return setError("Title is required");

    try {
      new URL(form.targetUrl);
    } catch {
      return setError("Invalid content URL");
    }

    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0.001 || price > 1000) {
      return setError("Price must be between 0.001 and 1000 USDC");
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(form.wallet)) {
      return setError("Invalid wallet address");
    }

    setLoading(true);
    try {
      const timestamp = Date.now();
      const message = `create-payment-link:${form.wallet}:${timestamp}`;
      const signature = await signMessageAsync({ message });

      const res = await fetch(`${API_URL}/api/payment-links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          targetUrl: form.targetUrl,
          priceUsdc: price,
          ownerAddress: form.wallet,
          signature,
          timestamp,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          err.error || err.message || "Failed to create payment link",
        );
      }

      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to create payment link");
    } finally {
      setLoading(false);
    }
  };

  // ── Copy share URL ────────────────────────────────────────────────────────

  const shareUrl = result?.payment_link?.paywall_url ?? result?.share_url ?? "";

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAnother = () => {
    setResult(null);
    setError(null);
    setForm({
      title: "",
      description: "",
      targetUrl: "",
      price: "0.05",
      wallet: address ?? "",
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Success screen
  // ─────────────────────────────────────────────────────────────────────────

  if (result) {
    return (
      <div className="animate-fade-in-up">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-4 transition-colors"
          aria-label="Back to options"
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
          Back
        </button>

        {/* Success card */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.015] border border-white/[0.07] rounded-3xl backdrop-blur-xl relative overflow-hidden p-8 text-center">
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
          />
          {/* Purple ambient glow */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(167,139,250,0.12) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10">
            {/* Check icon */}
            <div className="w-16 h-16 rounded-full bg-[#A78BFA]/10 border-2 border-[#A78BFA]/30 flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-8 h-8 text-[#A78BFA]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-white mb-1">
              Payment Link Created!
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Share this link — anyone who pays unlocks your content instantly.
            </p>

            {/* Share URL */}
            {shareUrl && (
              <div className="bg-white/[0.03] border border-[#A78BFA]/30 rounded-xl px-4 py-3 flex items-center gap-3 mb-6 text-left">
                <span className="text-gray-300 text-xs font-mono truncate flex-1 min-w-0">
                  {shareUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
                  style={{
                    background: copied
                      ? "rgba(52,211,153,0.15)"
                      : "rgba(167,139,250,0.15)",
                    color: copied ? "#34D399" : "#A78BFA",
                    border: `1px solid ${copied ? "rgba(52,211,153,0.3)" : "rgba(167,139,250,0.3)"}`,
                  }}
                  aria-label={copied ? "Copied" : "Copy link"}
                >
                  {copied ? (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleCreateAnother}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
                }}
              >
                Create Another
              </button>
              <Link
                to="/my-apis"
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white bg-white/[0.05] border border-white/[0.08] hover:border-white/20 transition-all duration-200 no-underline"
              >
                View My Links &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Form
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in-up">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-4 transition-colors"
        aria-label="Back to options"
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
        Back
      </button>

      {/* Glass card */}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.015] border border-white/[0.07] rounded-3xl backdrop-blur-xl relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
        />
        {/* Purple ambient glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 50% 30% at 50% 0%, rgba(167,139,250,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(167,139,250,0.15)",
                border: "1px solid rgba(167,139,250,0.3)",
              }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="#A78BFA"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">
                Create Payment Link
              </h2>
              <p className="text-gray-500 text-xs">
                Paywall any URL — share and earn USDC instantly
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Title */}
            <div>
              <FieldLabel required>Title</FieldLabel>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. My Premium Dataset"
                className={INPUT_CLS}
                required
                maxLength={200}
                aria-label="Payment link title"
              />
            </div>

            {/* Target URL */}
            <div>
              <FieldLabel required>Content URL</FieldLabel>
              <input
                type="url"
                value={form.targetUrl}
                onChange={(e) => set("targetUrl", e.target.value)}
                placeholder="https://your-content.com/secret-page"
                className={INPUT_CLS}
                required
                aria-label="Content URL being paywalled"
              />
              <p className="text-gray-600 text-xs mt-1">
                The URL revealed to buyers after payment.
              </p>
            </div>

            {/* Price */}
            <div>
              <FieldLabel required>Price (USDC)</FieldLabel>
              <div className="relative">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="0.05"
                  step="0.001"
                  min="0.001"
                  max="1000"
                  className={`${INPUT_CLS} pr-16`}
                  required
                  aria-label="Price in USDC"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-500 pointer-events-none">
                  USDC
                </span>
              </div>
              {/* Presets */}
              <div
                className="flex flex-wrap gap-1.5 mt-2"
                role="group"
                aria-label="Price presets"
              >
                {PRICE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => set("price", String(preset))}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-150"
                    style={
                      parseFloat(form.price) === preset
                        ? {
                            background: "rgba(167,139,250,0.2)",
                            color: "#A78BFA",
                            border: "1px solid rgba(167,139,250,0.4)",
                          }
                        : {
                            background: "rgba(255,255,255,0.04)",
                            color: "#6B7280",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }
                    }
                    aria-pressed={parseFloat(form.price) === preset}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <FieldLabel>
                Description{" "}
                <span className="text-gray-600 normal-case tracking-normal font-normal">
                  (optional)
                </span>
              </FieldLabel>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="What does the buyer get access to?"
                rows={3}
                className={`${INPUT_CLS} resize-none`}
                maxLength={500}
                aria-label="Description of the paywalled content"
              />
            </div>

            {/* Wallet */}
            <div>
              <FieldLabel required>Payout Wallet</FieldLabel>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.wallet}
                  onChange={(e) => set("wallet", e.target.value)}
                  placeholder="0x..."
                  className={`${INPUT_CLS} font-mono`}
                  required
                  aria-label="Payout wallet address"
                />
                {isConnected && address && (
                  <button
                    type="button"
                    onClick={() => set("wallet", address)}
                    className="shrink-0 px-3 py-2 rounded-xl text-xs font-medium text-[#A78BFA] bg-[#A78BFA]/10 border border-[#A78BFA]/20 hover:bg-[#A78BFA]/20 transition-all duration-150 whitespace-nowrap"
                    aria-label="Use connected wallet address"
                  >
                    Use Connected
                  </button>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-400 text-sm"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: loading
                  ? "rgba(124,58,237,0.5)"
                  : "linear-gradient(135deg, #7C3AED, #A78BFA)",
              }}
              aria-busy={loading}
            >
              {loading ? (
                <>
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
                  Creating link…
                </>
              ) : (
                <>
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
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  Create Payment Link
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
