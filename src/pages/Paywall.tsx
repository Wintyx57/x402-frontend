import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "viem";
import { useConnectModal } from "thirdweb/react";
import { thirdwebClient, wallets } from "../lib/thirdweb";
import { API_URL, USDC_ABI, CHAIN_CONFIG } from "../config";
import { useTranslation } from "../i18n/LanguageContext";
import useSEO from "../hooks/useSEO";
import ChainSelector from "../components/ChainSelector";

interface PaymentLinkData {
  id: string;
  title: string;
  description?: string;
  price_usdc: number;
  owner_address: string;
  is_active: boolean;
  created_at: string;
  _recipient?: string;
  payment_details?: { recipient: string };
}

type PayState =
  | "idle"
  | "paying"
  | "confirming"
  | "accessing"
  | "done"
  | "error";

export default function Paywall() {
  const { id } = useParams<{ id: string }>();
  const { address, isConnected, chain } = useAccount();
  const { connect } = useConnectModal();
  const { t } = useTranslation();
  const { writeContractAsync } = useWriteContract();

  const [linkData, setLinkData] = useState<PaymentLinkData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [payState, setPayState] = useState<PayState>("idle");
  const [payError, setPayError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [targetUrl, setTargetUrl] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash ?? undefined,
    });

  useSEO({
    title: linkData
      ? `${linkData.title} — Pay to Access`
      : "Paywall — x402 Bazaar",
    description:
      linkData?.description ||
      "Pay with USDC to access this content. Powered by x402 Bazaar.",
  });

  // Fetch link info
  useEffect(() => {
    if (!id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: sets loading flag before async fetch
    setLoading(true);
    fetch(`${API_URL}/api/payment-links/${id}`)
      .then(async (res) => {
        if (res.status === 402) {
          // 402 = Payment Required — this IS the link data (title, price, payment_details)
          return res.json();
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Payment link not found");
        }
        return res.json();
      })
      .then((data) => {
        // Extract recipient from payment_details for the USDC transfer
        if (data.payment_details?.recipient) {
          data._recipient = data.payment_details.recipient;
        }
        // 402 response means the link is active (backend returns 410 for inactive)
        if (data.error === "Payment Required") {
          data.is_active = true;
        }
        setLinkData(data);
        setLoading(false);
      })
      .catch((err) => {
        setLoadError(err.message || "Failed to load payment link");
        setLoading(false);
      });
  }, [id]);

  // After tx confirmed, call access endpoint
  useEffect(() => {
    if (!isConfirmed || !txHash || payState !== "confirming") return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: updates state machine after tx confirmation
    setPayState("accessing");
    // Map wagmi chainId to backend chain key
    const chainId = chain?.id ?? 8453;
    const chainKeyMap: Record<number, string> = {
      8453: "base",
      1187947933: "skale",
      137: "polygon",
    };
    const payChain = chainKeyMap[chainId] || "base";

    fetch(`${API_URL}/api/payment-links/${id}/access`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Payment-TxHash": txHash,
        "X-Payment-Chain": payChain,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Access verification failed");
        }
        return res.json();
      })
      .then((data) => {
        setTargetUrl(data.target_url);
        setPayState("done");
      })
      .catch((err) => {
        setPayError(err.message || "Access verification failed");
        setPayState("error");
      });
  }, [isConfirmed, txHash, payState, id]);

  // Keep confirming state in sync while tx is confirming
  useEffect(() => {
    if (isConfirming && payState === "paying") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: syncs state machine with tx confirmation status
      setPayState("confirming");
    }
  }, [isConfirming, payState]);

  const handlePay = async () => {
    if (!isConnected) {
      connect({ client: thirdwebClient, wallets });
      return;
    }
    if (!linkData) return;

    setPayError(null);
    setPayState("paying");

    try {
      const chainId = chain?.id ?? 8453;
      const chainConfig = CHAIN_CONFIG[chainId] || CHAIN_CONFIG[8453];
      const decimals = 6; // All chains use 6-decimal USDC (Base, SKALE, Polygon)

      const hash = await writeContractAsync({
        address: chainConfig.usdcContract as `0x${string}`,
        abi: USDC_ABI,
        functionName: "transfer",
        args: [
          (linkData._recipient ||
            linkData.owner_address ||
            "") as `0x${string}`,
          parseUnits(String(linkData.price_usdc), decimals),
        ],
      });

      setTxHash(hash);
      setPayState("confirming");
    } catch (err: unknown) {
      const e = err as Record<string, any>;
      const msg = e?.message || "";
      if (msg.includes("User rejected") || msg.includes("user rejected")) {
        setPayError("Transaction rejected. Please try again.");
      } else {
        setPayError("Payment failed. Please try again.");
      }
      setPayState("error");
    }
  };

  const chainConfig = CHAIN_CONFIG[chain?.id ?? 8453] || CHAIN_CONFIG[8453];

  // ---- Loading State ----
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // ---- Error: link not found ----
  if (loadError || !linkData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-card rounded-2xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Link Not Found</h1>
          <p className="text-gray-400 text-sm mb-6">
            {loadError || "This payment link does not exist."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 gradient-btn text-white font-medium text-sm px-5 py-2.5 rounded-xl no-underline"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // ---- Inactive link ----
  if (!linkData.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-card rounded-2xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v.01M12 9v4m0 8a9 9 0 100-18 9 9 0 000 18z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            {t.paymentLinks?.paywall?.inactive || "Link No Longer Active"}
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            This payment link has been deactivated by its owner.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 gradient-btn text-white font-medium text-sm px-5 py-2.5 rounded-xl no-underline"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // ---- Success State ----
  if (payState === "done" && targetUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-card rounded-2xl p-10 text-center relative overflow-hidden animate-fade-in-up">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(167,139,250,0.15) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10">
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
            <h1 className="text-[#A78BFA] text-2xl font-bold mb-2">
              {t.paymentLinks?.paywall?.success || "Payment Confirmed!"}
            </h1>
            <p className="text-white font-semibold mb-1">{linkData.title}</p>
            <p className="text-gray-400 text-sm mb-8">
              Access granted. You paid ${linkData.price_usdc} USDC.
            </p>

            <div className="glass rounded-xl p-4 mb-6 text-left">
              <p className="text-xs text-gray-400 mb-2">Content URL</p>
              <div className="flex items-center gap-2">
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#A78BFA] font-mono flex-1 truncate no-underline hover:text-purple-300 transition-colors"
                >
                  {targetUrl}
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(targetUrl)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/20 hover:bg-[#A78BFA]/20 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Copy
                </button>
              </div>
            </div>

            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full gradient-btn text-white font-medium text-sm px-5 py-3 rounded-xl no-underline hover:brightness-110 transition-all mb-3"
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              {t.paymentLinks?.paywall?.redirecting || "Open Content"}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ---- Main Paywall UI ----
  const isProcessing =
    payState === "paying" ||
    payState === "confirming" ||
    payState === "accessing";

  const statusLabel = () => {
    if (payState === "paying")
      return (
        t.paymentLinks?.paywall?.paying || "Waiting for wallet approval..."
      );
    if (payState === "confirming") return "Confirming on-chain...";
    if (payState === "accessing") return "Verifying access...";
    return null;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(167,139,250,0.12) 0%, transparent 70%)",
      }}
    >
      <div className="max-w-md w-full animate-fade-in-up">
        {/* Card */}
        <div
          className="glass-card rounded-2xl p-8 text-center relative overflow-hidden"
          style={{
            boxShadow:
              "0 0 60px rgba(167,139,250,0.08), 0 1px 0 rgba(167,139,250,0.15) inset",
          }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 70% 40% at 50% -10%, rgba(167,139,250,0.10) 0%, transparent 60%)",
            }}
          />
          <div className="relative z-10">
            {/* Lock Icon */}
            <div
              className="w-20 h-20 rounded-full bg-[#A78BFA]/10 border-2 border-[#A78BFA]/25 flex items-center justify-center mx-auto mb-6"
              style={{ boxShadow: "0 0 30px rgba(167,139,250,0.15)" }}
            >
              <svg
                className="w-10 h-10 text-[#A78BFA]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A78BFA]/10 border border-[#A78BFA]/20 text-[#A78BFA] text-xs font-medium mb-4">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] animate-pulse"
                aria-hidden="true"
              />
              {t.paymentLinks?.paywall?.locked || "Content Locked"}
            </span>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
              {linkData.title}
            </h1>

            {linkData.description && (
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                {linkData.description}
              </p>
            )}

            {/* Price Box */}
            <div
              className="glass rounded-xl p-5 mb-6 border border-[#A78BFA]/20"
              style={{ background: "rgba(167,139,250,0.05)" }}
            >
              <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold mb-1">
                Price
              </p>
              <p className="text-4xl font-bold text-white mb-1">
                ${linkData.price_usdc}
                <span className="text-lg font-normal text-gray-400 ml-2">
                  USDC
                </span>
              </p>
              <p className="text-gray-500 text-xs">
                One-time payment · Instant access
              </p>
            </div>

            {/* Chain selector */}
            <div className="mb-6">
              <ChainSelector />
            </div>

            {/* Error */}
            {payState === "error" && payError && (
              <div
                role="alert"
                className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm"
              >
                {payError}
              </div>
            )}

            {/* Processing status */}
            {isProcessing && (
              <div
                role="status"
                aria-live="polite"
                className="mb-4 flex flex-col items-center gap-3"
              >
                <div
                  className="w-8 h-8 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
                <p className="text-[#A78BFA] text-sm font-medium">
                  {statusLabel()}
                </p>
              </div>
            )}

            {/* CTA Button */}
            {!isConnected ? (
              <button
                onClick={() => connect({ client: thirdwebClient, wallets })}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-base cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background:
                    "linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)",
                  boxShadow: "0 0 20px rgba(167,139,250,0.25)",
                }}
              >
                Connect Wallet to Pay
              </button>
            ) : (
              <button
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-base cursor-pointer transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                style={{
                  background: isProcessing
                    ? undefined
                    : "linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)",
                  boxShadow: isProcessing
                    ? undefined
                    : "0 0 20px rgba(167,139,250,0.25)",
                }}
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
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
                    Processing...
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
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {t.paymentLinks?.paywall?.payAccess || "Pay & Access"} · $
                    {linkData.price_usdc} USDC
                  </>
                )}
              </button>
            )}

            {/* Connected wallet info */}
            {isConnected && address && !isProcessing && (
              <p className="text-gray-600 text-xs mt-3">
                Paying from {address.slice(0, 6)}...{address.slice(-4)} on{" "}
                {chainConfig.label}
              </p>
            )}
          </div>
        </div>

        {/* Footer badge */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <Link to="/" className="no-underline">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 hover:border-[#A78BFA]/30 transition-colors">
              <span className="text-xs text-gray-500">Powered by</span>
              <span className="text-xs font-semibold text-[#FF9900]">
                x402 Bazaar
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span>Base</span>
            <span aria-hidden="true">·</span>
            <span>SKALE</span>
            <span aria-hidden="true">·</span>
            <span>Polygon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
