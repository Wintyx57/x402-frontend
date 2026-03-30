import { useState } from "react";
import { useAccount } from "wagmi";
import { useBuyWithFiatQuote, useBuyWithFiatStatus } from "thirdweb/react";
import { thirdwebClient } from "../lib/thirdweb";
import { CHAIN_CONFIG } from "../config";
import { useTranslation } from "../i18n/LanguageContext";

const FIAT_CHAINS = [
  { id: 8453, label: "Base", icon: "🔵" },
  { id: 137, label: "Polygon", icon: "🟣" },
];

export default function BuyWithCard() {
  const { address } = useAccount();
  const { t } = useTranslation();
  const f = t.fund || ({} as Record<string, string>);
  const [amount, setAmount] = useState("10");
  const [intentId, setIntentId] = useState<string | null>(null);
  const [selectedChain, setSelectedChain] = useState(FIAT_CHAINS[0].id);

  const chainConfig = CHAIN_CONFIG[selectedChain];
  const usdcAddress = chainConfig?.usdcContract;

  const quote = useBuyWithFiatQuote(
    address && usdcAddress
      ? {
          client: thirdwebClient,
          fromCurrencySymbol: "USD",
          toChainId: selectedChain,
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

  if (!usdcAddress) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        {f.chainNotSupported || "Fiat onramp not available for this chain"}
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
          {FIAT_CHAINS.map((chain) => (
            <button
              key={chain.id}
              onClick={() => {
                setSelectedChain(chain.id);
                setIntentId(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                selectedChain === chain.id
                  ? "bg-[#FF9900]/20 border border-[#FF9900]/40 text-white"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              {chain.icon} {chain.label}
            </button>
          ))}
        </div>
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
            <span className="text-white">{chainConfig.label}</span>
          </div>
          {quote.data.estimatedDurationSeconds && (
            <div className="flex justify-between">
              <span className="text-gray-400">
                {f.estimatedTime || "Estimated time"}
              </span>
              <span className="text-white">
                ~{Math.ceil(quote.data.estimatedDurationSeconds / 60)} min
              </span>
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

      {isComplete && (
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
          : f.buyWithCard || "Buy with Card"}
      </button>
    </div>
  );
}
