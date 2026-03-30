import { useState } from "react";
import { useAccount } from "wagmi";
import { useBuyWithFiatQuote, useBuyWithFiatStatus } from "thirdweb/react";
import { thirdwebClient } from "../lib/thirdweb";
import { CHAIN_CONFIG } from "../config";
import { useTranslation } from "../i18n/LanguageContext";
import { Link } from "react-router-dom";

const FIAT_CHAINS = [
  {
    id: 1187947933,
    buyOn: 8453,
    label: "SKALE",
    icon: "🟢",
    color: "#00D395",
    needsBridge: true,
    desc: "Buy on Base → auto-bridge to SKALE ($0 gas)",
  },
  {
    id: 8453,
    buyOn: 8453,
    label: "Base",
    icon: "🔵",
    color: "#0052FF",
    needsBridge: false,
    desc: "Direct purchase on Base",
  },
  {
    id: 137,
    buyOn: 137,
    label: "Polygon",
    icon: "🟣",
    color: "#8247E5",
    needsBridge: false,
    desc: "Direct purchase on Polygon",
  },
];

export default function BuyWithCard() {
  const { address } = useAccount();
  const { t } = useTranslation();
  const f = t.fund || ({} as Record<string, string>);
  const [amount, setAmount] = useState("10");
  const [intentId, setIntentId] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const selected = FIAT_CHAINS[selectedIdx];
  const buyChainConfig = CHAIN_CONFIG[selected.buyOn];
  const usdcAddress = buyChainConfig?.usdcContract;

  const quote = useBuyWithFiatQuote(
    address && usdcAddress
      ? {
          client: thirdwebClient,
          fromCurrencySymbol: "USD",
          toChainId: selected.buyOn,
          toAmount: amount,
          toTokenAddress: usdcAddress,
          toAddress: address,
          fromAddress: address,
        }
      : undefined,
  );

  const status = useBuyWithFiatStatus(
    intentId
      ? {
          client: thirdwebClient,
          intentId,
        }
      : undefined,
  );

  const handleBuy = () => {
    if (quote.data?.onRampLink) {
      setIntentId(quote.data.intentId);
      window.open(quote.data.onRampLink, "_blank");
    }
  };

  if (!address) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        {f.connectFirst || "Connect your wallet first"}
      </div>
    );
  }

  const isComplete = status.data?.status === "ON_RAMP_TRANSFER_COMPLETED";
  const isPending = intentId && !isComplete;

  return (
    <div className="space-y-4">
      {/* Chain selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {f.destinationChain || "Destination Chain"}
        </label>
        <div className="flex gap-2">
          {FIAT_CHAINS.map((chain, idx) => (
            <button
              key={chain.id}
              onClick={() => {
                setSelectedIdx(idx);
                setIntentId(null);
              }}
              className={`flex-1 py-2 px-2 rounded-xl text-sm font-medium transition-all ${
                selectedIdx === idx
                  ? "bg-white/10 border-2 text-white"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
              }`}
              style={
                selectedIdx === idx
                  ? { borderColor: `${chain.color}60` }
                  : undefined
              }
            >
              <span>{chain.icon}</span> {chain.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-gray-500 mt-1">{selected.desc}</p>
      </div>

      {/* Amount input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {f.enterAmount || "Amount (USD)"}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            $
          </span>
          <input
            type="number"
            min="1"
            max="10000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-7 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                       text-white text-sm focus:border-[#FF9900]/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Quote details */}
      {quote.isLoading && (
        <div className="text-sm text-gray-400 animate-pulse">
          {f.gettingQuote || "Getting quote..."}
        </div>
      )}

      {quote.data && (
        <div className="glass-card rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">
              {f.youllReceive || "You'll receive"}
            </span>
            <span className="text-white font-medium">
              ~{parseFloat(amount).toFixed(2)} USDC
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">{f.chain || "Chain"}</span>
            <span className="text-white">
              {selected.needsBridge
                ? `Base → ${selected.label}`
                : selected.label}
            </span>
          </div>
          {quote.data.estimatedDurationSeconds && (
            <div className="flex justify-between">
              <span className="text-gray-400">
                {f.estimatedTime || "Estimated time"}
              </span>
              <span className="text-white">
                ~{Math.ceil(quote.data.estimatedDurationSeconds / 60)} min
                {selected.needsBridge ? " + bridge" : ""}
              </span>
            </div>
          )}
          {selected.needsBridge && (
            <div className="flex justify-between">
              <span className="text-gray-400">Gas on SKALE</span>
              <span className="text-green-400 font-medium">$0.00</span>
            </div>
          )}
        </div>
      )}

      {/* Status tracking */}
      {isPending && (
        <div className="glass-card rounded-xl p-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FF9900] animate-pulse" />
            <span className="text-[#FF9900]">
              {f.processing || "Processing your purchase..."}
            </span>
          </div>
          {status.data?.status && (
            <p className="text-gray-400 mt-1 text-xs">
              Status: {status.data.status.replace(/_/g, " ").toLowerCase()}
            </p>
          )}
        </div>
      )}

      {isComplete && !selected.needsBridge && (
        <div className="glass-card rounded-xl p-4 text-sm border-green-500/20">
          <div className="flex items-center gap-2 text-green-400">
            <svg
              className="w-4 h-4"
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
            {f.purchaseComplete ||
              "Purchase complete! USDC added to your wallet."}
          </div>
        </div>
      )}

      {isComplete && selected.needsBridge && (
        <div className="glass-card rounded-xl p-4 text-sm space-y-3">
          <div className="flex items-center gap-2 text-green-400">
            <svg
              className="w-4 h-4"
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
            Step 1 done — USDC on Base!
          </div>
          <div className="flex items-center gap-2 text-[#FF9900]">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            Step 2 — Bridge to SKALE below
          </div>
          <Link
            to="/fund"
            onClick={() => {
              /* switch to bridge tab handled by parent */
            }}
            className="block w-full py-2.5 rounded-xl font-medium text-sm text-center transition-all
                       bg-gradient-to-r from-[#00D395] to-[#00B37D] text-white
                       hover:shadow-lg hover:shadow-[#00D395]/20 no-underline"
          >
            Bridge to SKALE →
          </Link>
        </div>
      )}

      {/* Buy button */}
      <button
        onClick={handleBuy}
        disabled={!quote.data || quote.isLoading || !!isPending}
        className="w-full py-3 rounded-xl font-medium text-sm transition-all
                   bg-gradient-to-r from-[#FF9900] to-[#e68a00] text-white
                   hover:shadow-lg hover:shadow-[#FF9900]/20
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending
          ? f.processing || "Processing..."
          : selected.needsBridge
            ? f.buyAndBridge || "Buy USDC on Base"
            : f.buyWithCard || "Buy with Card"}
      </button>
    </div>
  );
}
