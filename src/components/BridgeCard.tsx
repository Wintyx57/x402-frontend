import { useState, useCallback, useEffect, useRef } from "react";
import { useQuote, TradeType } from "0xtrails";
import {
  useAccount,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { useConnectModal } from "thirdweb/react";
import { thirdwebClient, wallets } from "../lib/thirdweb";
import { parseUnits } from "viem";
import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/LanguageContext";
import {
  SOURCE_CHAINS,
  DEST_CHAINS,
  getDestinationConfig,
  chainImageUrl,
  SOURCE_USDC,
} from "../lib/bridge-config";
import type { DestKey } from "../lib/bridge-config";
import { useUsdcBalance } from "../hooks/useUsdcBalance";

const TRAILS_API_KEY = import.meta.env.VITE_TRAILS_API_KEY || "";

type BridgeState =
  | "idle"
  | "quoting"
  | "quoted"
  | "signing"
  | "pending"
  | "confirming"
  | "success"
  | "error";

/* ── ChainPill — compact horizontal pill for source chains ── */
function ChainPill({
  name,
  chainId,
  color,
  isSelected,
  onClick,
  disabled,
}: {
  name: string;
  chainId: number;
  color: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const img = chainImageUrl(chainId);
  const [imgError, setImgError] = useState(false);
  const handleImgError = useCallback(() => setImgError(true), []);
  const showImg = img && !imgError;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer
        ${
          isSelected
            ? "border-[#FF9900] bg-[#FF9900]/10 text-[#FF9900]"
            : "border-white/10 bg-white/[0.04] text-gray-300 hover:border-white/20 hover:bg-white/[0.06]"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {showImg ? (
        <img
          src={img}
          alt={name}
          className="w-4 h-4 rounded-full"
          onError={handleImgError}
        />
      ) : (
        <div
          className={`w-4 h-4 rounded-full ${color} flex items-center justify-center text-white text-[8px] font-bold`}
        >
          {name.charAt(0)}
        </div>
      )}
      <span className="text-xs font-medium whitespace-nowrap">{name}</span>
    </button>
  );
}

/* ── DestChainCard — horizontal destination card ── */
function DestChainCard({
  name,
  chainId,
  color,
  subtitle,
  isSelected,
  onClick,
  disabled,
}: {
  name: string;
  chainId: number;
  color: string;
  subtitle?: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const img = chainImageUrl(chainId);
  const [imgError, setImgError] = useState(false);
  const handleImgError = useCallback(() => setImgError(true), []);
  const showImg = img && !imgError;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer flex-1 min-w-0
        ${
          isSelected
            ? "border-[#FF9900] bg-[#FF9900]/10 shadow-[0_0_16px_rgba(255,153,0,0.15)]"
            : "border-transparent bg-white/[0.04] hover:bg-white/[0.06] hover:border-white/10"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {showImg ? (
        <img
          src={img}
          alt={name}
          className="w-7 h-7 rounded-full ring-2 ring-white/10 shrink-0"
          onError={handleImgError}
        />
      ) : (
        <div
          className={`w-7 h-7 rounded-full ${color} flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/10 shrink-0`}
        >
          {name.charAt(0)}
        </div>
      )}
      <div className="text-left min-w-0">
        <div className="text-xs font-semibold truncate">{name}</div>
        {subtitle && (
          <div className="text-[10px] text-gray-400 truncate">{subtitle}</div>
        )}
      </div>
    </button>
  );
}

function getProgressSteps(t: {
  fund: {
    progressStep0?: string;
    progressStep1?: string;
    progressStep2?: string;
    progressStep3?: string;
    progressStep4?: string;
  };
}) {
  return [
    t.fund.progressStep0 || "Signing transaction...",
    t.fund.progressStep1 || "Broadcasting...",
    t.fund.progressStep2 || "Confirming on source chain...",
    t.fund.progressStep3 || "Bridging to destination...",
    t.fund.progressStep4 || "Complete!",
  ];
}

function getProgressIndex(state: BridgeState): number {
  switch (state) {
    case "signing":
      return 0;
    case "pending":
      return 1;
    case "confirming":
      return 2;
    case "success":
      return 4;
    default:
      return -1;
  }
}

export default function BridgeCard() {
  const { t } = useTranslation();
  const { address, isConnected, chain } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const { balance: usdcBalance } = useUsdcBalance();
  const { connect } = useConnectModal();
  const f = t.fund || ({} as Record<string, string>);
  const PROGRESS_STEPS = getProgressSteps(t);

  const [selectedDest, setSelectedDest] = useState<DestKey>("skale");
  const [recipient, setRecipient] = useState("");
  const [showRecipient, setShowRecipient] = useState(false);
  const [amount, setAmount] = useState("");
  const [bridgeState, setBridgeState] = useState<BridgeState>("idle");
  const [bridgedAmount, setBridgedAmount] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [swapResult, setSwapResult] = useState<{
    originTxHash?: string | null;
    destTxHash?: string | null;
  } | null>(null);

  const actualRecipient = (recipient || address || "") as `0x${string}`;
  const isValidRecipient =
    actualRecipient &&
    actualRecipient.startsWith("0x") &&
    actualRecipient.length === 42;

  const selectedChain = DEST_CHAINS.find((c) => c.key === selectedDest)!;
  const destConfig = isValidRecipient
    ? getDestinationConfig(selectedDest, actualRecipient)
    : null;
  const sourceChain = SOURCE_CHAINS.find((c) => c.id === chain?.id);
  const sourceChainName = sourceChain?.name || chain?.name || "Unknown";

  const fromChainId = chain?.id || 8453;
  const fromToken = SOURCE_USDC[fromChainId];

  // Parse amount — USDC is 6 decimals on all source chains
  const parsedAmount = (() => {
    try {
      const num = parseFloat(amount);
      if (isNaN(num) || num <= 0) return undefined;
      return parseUnits(amount, 6).toString();
    } catch {
      return undefined;
    }
  })();

  const {
    quote,
    send,
    isLoadingQuote,
    quoteError,
    quoteErrorPrettified,
    refetchQuote,
  } = useQuote({
    walletClient: walletClient ?? undefined,
    fromTokenAddress: fromToken,
    fromChainId,
    toTokenAddress: destConfig?.toToken,
    toChainId: destConfig?.toChainId,
    toAddress: destConfig?.toAddress,
    toCalldata: destConfig?.toCalldata,
    swapAmount: parsedAmount,
    tradeType: TradeType.EXACT_INPUT,
    apiKey: TRAILS_API_KEY || undefined,
    checkoutOnHandlers: {
      triggerCheckoutSignatureRequest: () => {
        setBridgeState("signing");
      },
      triggerCheckoutComplete: (txStatus) => {
        if (txStatus === "success") {
          setBridgeState("success");
        } else {
          setBridgeState("error");
          setErrorMessage("Bridge transaction failed. Please try again.");
        }
      },
      triggerCheckoutError: (error) => {
        setBridgeState("error");
        setErrorMessage(error || "Bridge transaction failed. Please try again.");
      },
    },
  });

  // Derive quoting/quoted states from hook
  useEffect(() => {
    if (
      bridgeState === "signing" ||
      bridgeState === "pending" ||
      bridgeState === "confirming" ||
      bridgeState === "success" ||
      bridgeState === "error"
    )
      return;
    if (!parsedAmount || !isValidRecipient || !fromToken) {
      setBridgeState("idle");
    } else if (isLoadingQuote) {
      setBridgeState("quoting");
    } else if (quote && !quoteError) {
      setBridgeState("quoted");
    } else {
      setBridgeState("idle");
    }
  }, [
    isLoadingQuote,
    quote,
    quoteError,
    parsedAmount,
    isValidRecipient,
    fromToken,
    bridgeState,
  ]);

  // Auto-refetch quote every 30s
  const refetchRef = useRef(refetchQuote);
  refetchRef.current = refetchQuote;
  useEffect(() => {
    if (bridgeState !== "quoted") return;
    const id = setInterval(() => refetchRef.current?.(), 30000);
    return () => clearInterval(id);
  }, [bridgeState]);

  async function handleBridge() {
    if (!send || !quote) return;
    setBridgeState("signing");
    setErrorMessage(null);
    try {
      const result = await send();
      if (result) {
        setBridgedAmount(
          quote.destinationAmountDisplay ||
            quote.destinationAmountFormatted ||
            null,
        );
        setSwapResult({
          originTxHash: result.originTransaction?.transactionHash,
          destTxHash: result.destinationTransaction?.transactionHash,
        });
        setBridgeState("success");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (
        msg.includes("rejected") ||
        msg.includes("denied") ||
        msg.includes("User rejected")
      ) {
        setBridgeState("quoted");
        return;
      }
      setBridgeState("error");
      setErrorMessage(msg);
    }
  }

  function handleReset() {
    setBridgeState("idle");
    setBridgedAmount(null);
    setErrorMessage(null);
    setSwapResult(null);
    setAmount("");
  }

  function setAmountPercent(pct: number) {
    if (!usdcBalance) return;
    const val = (parseFloat(usdcBalance) * pct) / 100;
    if (val <= 0) return;
    setAmount(val.toFixed(6).replace(/\.?0+$/, ""));
  }

  const buttonTextMap: Record<DestKey, string> = {
    base: f.bridgeButtonBase || "Bridge to Base",
    skale: f.bridgeButtonSkale || "Bridge to SKALE",
    polygon: f.bridgeButtonPolygon || "Bridge to Polygon",
  };

  const successTimingMap: Record<DestKey, string> = {
    base: f.successTimingBase || "USDC arrives on Base in ~10-30 seconds.",
    skale:
      f.successTimingSkale || "IMA bridge delivers to SKALE in ~15-45 seconds.",
    polygon:
      f.successTimingPolygon || "USDC arrives on Polygon in ~10-30 seconds.",
  };

  const isBridging =
    bridgeState === "signing" ||
    bridgeState === "pending" ||
    bridgeState === "confirming";
  const isComplete = bridgeState === "success";
  const progressIdx = getProgressIndex(bridgeState);

  // Not connected
  if (!isConnected) {
    return (
      <div className="max-w-lg mx-auto glass-card rounded-2xl p-6 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FF9900]/15 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-[#FF9900]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-400">
          {f.connectPrompt || "Connect your wallet to bridge USDC"}
        </p>
        <button
          onClick={() => connect({ client: thirdwebClient, wallets })}
          className="px-6 py-2.5 rounded-xl bg-[#FF9900] hover:bg-[#e68a00] text-white font-semibold transition-colors cursor-pointer"
        >
          {f.connectPrompt || "Connect Wallet"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto glass-card rounded-2xl p-4 sm:p-5 space-y-3">
      {/* ── FROM — Source Chain Pills ── */}
      <div
        role="group"
        aria-labelledby="bridge-from-label"
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <label
            id="bridge-from-label"
            className="text-xs font-semibold uppercase tracking-wider text-gray-400"
          >
            {f.fromLabel || "From"}
          </label>
          {isSwitching && (
            <span className="text-[11px] text-[#FF9900] animate-pulse">
              {f.switchChain || "Switching..."}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SOURCE_CHAINS.map((sc) => (
            <ChainPill
              key={sc.id}
              name={sc.name}
              chainId={sc.id}
              color={sc.color}
              isSelected={chain?.id === sc.id}
              disabled={isSwitching || isBridging || isComplete}
              onClick={() => {
                if (chain?.id !== sc.id && switchChain) {
                  switchChain({ chainId: sc.id });
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Arrow Divider ── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <div className="w-8 h-8 rounded-full bg-[#FF9900]/15 border border-[#FF9900]/30 flex items-center justify-center shrink-0">
          <svg
            className="w-4 h-4 text-[#FF9900]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* ── TO — Destination Chain Cards (horizontal) ── */}
      <div role="group" aria-labelledby="bridge-to-label" className="space-y-2">
        <label
          id="bridge-to-label"
          className="text-xs font-semibold uppercase tracking-wider text-gray-400"
        >
          {f.toLabel || "To"}
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          {DEST_CHAINS.map((dc) => (
            <DestChainCard
              key={dc.key}
              name={dc.name}
              chainId={dc.id}
              color={dc.color}
              subtitle={`${dc.time} · ${dc.gas}`}
              isSelected={selectedDest === dc.key}
              disabled={isBridging || isComplete}
              onClick={() => setSelectedDest(dc.key)}
            />
          ))}
        </div>
      </div>

      {/* ── Route Summary Bar ── */}
      {!isComplete && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${sourceChain?.color || "bg-gray-500"}`}
            />
            <span className="text-xs font-medium">{sourceChainName}</span>
            <svg
              className="w-3 h-3 text-[#FF9900]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
            <span className={`w-2 h-2 rounded-full ${selectedChain.color}`} />
            <span className="text-xs font-medium">{selectedChain.name}</span>
          </div>
          <span className="text-[11px] text-gray-500 whitespace-nowrap">
            {selectedChain.time}
          </span>
        </div>
      )}

      {!isComplete && (
        <>
          {/* ── Recipient — collapsible ── */}
          {!showRecipient ? (
            <button
              type="button"
              onClick={() => setShowRecipient(true)}
              disabled={isBridging}
              className="text-xs text-gray-500 hover:text-[#FF9900] transition-colors cursor-pointer flex items-center gap-1"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {f.customRecipient || "Custom recipient address"}
            </button>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-400">
                  {f.recipientLabel || "Recipient"}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRecipient("");
                    setShowRecipient(false);
                  }}
                  className="text-[11px] text-[#FF9900] hover:underline cursor-pointer"
                >
                  {f.useMyWallet || "Use my wallet"}
                </button>
              </div>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={address || "0x..."}
                disabled={isBridging}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/[0.04] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#FF9900]/40 focus:border-[#FF9900]/40 transition-all disabled:opacity-50"
              />
            </div>
          )}

          {isValidRecipient && TRAILS_API_KEY && destConfig && (
            <>
              {/* ── Amount Input ── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="bridge-amount"
                    className="text-xs font-medium"
                  >
                    Amount
                  </label>
                  {usdcBalance && (
                    <span className="text-[11px] text-gray-400">
                      Balance:{" "}
                      <span className="text-white font-medium">
                        {parseFloat(usdcBalance).toFixed(2)} USDC
                      </span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="bridge-amount"
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9.]/g, "");
                      if (v.split(".").length <= 2) setAmount(v);
                    }}
                    placeholder="0.00"
                    disabled={isBridging}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#FF9900]/40 focus:border-[#FF9900]/40 transition-all disabled:opacity-50 placeholder:text-gray-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                    USDC
                  </span>
                </div>
                {/* Quick % buttons */}
                <div className="flex gap-1.5">
                  {[25, 50, 75].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      disabled={isBridging || !usdcBalance}
                      onClick={() => setAmountPercent(pct)}
                      className="flex-1 py-1 rounded-md text-[11px] font-medium border border-white/10 bg-white/[0.04] hover:bg-[#FF9900]/10 hover:border-[#FF9900]/30 text-gray-400 hover:text-[#FF9900] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {pct}%
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={isBridging || !usdcBalance}
                    onClick={() => setAmountPercent(100)}
                    className="flex-1 py-1 rounded-md text-[11px] font-medium border border-white/10 bg-white/[0.04] hover:bg-[#FF9900]/10 hover:border-[#FF9900]/30 text-gray-400 hover:text-[#FF9900] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* ── Quote Display — compact grid ── */}
              {bridgeState === "quoting" && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-gray-400">
                    Fetching quote...
                  </span>
                </div>
              )}

              {quote && bridgeState === "quoted" && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs">
                  <span className="text-gray-400">You receive</span>
                  <span className="text-right font-bold text-white">
                    ~
                    {quote.destinationAmountDisplay ||
                      quote.destinationAmountFormatted}{" "}
                    {quote.destinationToken?.symbol || "USDC"}
                  </span>
                  {quote.totalFeesUsdDisplay &&
                    quote.totalFeesUsdDisplay !== "$0.00" && (
                      <>
                        <span className="text-gray-500">Fees</span>
                        <span className="text-right text-gray-400">
                          {quote.totalFeesUsdDisplay}
                        </span>
                      </>
                    )}
                  {quote.gasCostUsdDisplay &&
                    quote.gasCostUsdDisplay !== "$0.00" && (
                      <>
                        <span className="text-gray-500">Gas</span>
                        <span className="text-right text-gray-400">
                          {quote.gasCostUsdDisplay}
                        </span>
                      </>
                    )}
                  {quote.completionEstimateDisplay && (
                    <>
                      <span className="text-gray-500">Est. time</span>
                      <span className="text-right text-gray-400">
                        {quote.completionEstimateDisplay}
                      </span>
                    </>
                  )}
                </div>
              )}

              {quoteError && !isLoadingQuote && parsedAmount && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400">
                    {quoteErrorPrettified ||
                      "Failed to fetch quote. Try a different amount."}
                  </p>
                </div>
              )}

              {/* ── Progress Overlay ── */}
              {isBridging && (
                <div className="space-y-2.5 p-3 rounded-xl bg-[#FF9900]/5 border border-[#FF9900]/15">
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#FF9900] to-[#e68a00] transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.max(10, ((progressIdx + 1) / PROGRESS_STEPS.length) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    {PROGRESS_STEPS.slice(0, progressIdx + 2).map((step, i) => (
                      <div key={step} className="flex items-center gap-2">
                        {i <= progressIdx ? (
                          <svg
                            className="w-3 h-3 text-[#FF9900]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <div className="w-3 h-3 border-2 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
                        )}
                        <span
                          className={`text-[11px] ${i <= progressIdx ? "text-gray-400" : "text-[#FF9900] font-medium"}`}
                        >
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Error state ── */}
              {bridgeState === "error" && errorMessage && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 space-y-1.5">
                  <p className="text-xs text-red-400">{errorMessage}</p>
                  <button
                    onClick={() => {
                      setBridgeState("idle");
                      setErrorMessage(null);
                    }}
                    className="text-[11px] text-[#FF9900] hover:underline font-medium cursor-pointer"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* ── Bridge Button ── */}
              {!isBridging &&
                bridgeState !== "error" && (
                  <button
                    type="button"
                    disabled={!send || !quote || bridgeState !== "quoted"}
                    onClick={handleBridge}
                    className="w-full py-3 rounded-xl bg-[#FF9900] hover:bg-[#e68a00] text-white font-bold text-sm
                    shadow-[0_0_20px_rgba(255,153,0,0.3)] hover:shadow-[0_0_28px_rgba(255,153,0,0.45)]
                    transition-all duration-200 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
                  >
                    {bridgeState === "quoting" ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Getting quote...
                      </span>
                    ) : (
                      buttonTextMap[selectedDest]
                    )}
                  </button>
                )}

              {!fromToken && (
                <div className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-xs text-yellow-400">
                    USDC is not available on this source chain. Try switching to
                    Base, Ethereum, Polygon, Optimism, or Arbitrum.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Invalid recipient */}
          {!isValidRecipient && (
            <div className="p-3 rounded-lg border border-white/10 bg-white/[0.03] text-center">
              <p className="text-xs text-gray-400">
                {f.invalidAddress ||
                  "Enter a valid recipient address to continue"}
              </p>
            </div>
          )}

          {/* No API key */}
          {isValidRecipient && !TRAILS_API_KEY && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
              <p className="text-xs text-red-400">
                Trails API key not configured. Set VITE_TRAILS_API_KEY.
              </p>
            </div>
          )}
        </>
      )}

      {/* ── Success ── */}
      {isComplete && (
        <div className="space-y-3">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <p className="text-sm font-semibold text-green-400">
                {f.successTitle || "Bridge initiated!"}
              </p>
            </div>
            {(bridgedAmount || amount) && (
              <p className="text-xs text-green-300">
                <strong>{f.successAmount || "Amount"}:</strong>{" "}
                {bridgedAmount || amount} USDC
              </p>
            )}
            <p className="text-xs text-green-300">
              <strong>{f.successRecipient || "Recipient"}:</strong>{" "}
              {actualRecipient.slice(0, 6)}...{actualRecipient.slice(-4)}
            </p>
            {swapResult?.originTxHash && (
              <p className="text-[11px] text-green-300/70">
                TX: {swapResult.originTxHash.slice(0, 16)}...
              </p>
            )}
            <p className="text-xs text-green-300/80">
              {successTimingMap[selectedDest]}
            </p>
            <Link
              to="/services"
              className="inline-flex items-center gap-1 text-xs text-[#FF9900] hover:underline font-semibold"
            >
              {f.startUsing || "Start using APIs"} &rarr;
            </Link>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-sm font-medium transition-colors cursor-pointer"
          >
            {f.bridgeMore || "Bridge More"}
          </button>
        </div>
      )}
    </div>
  );
}
