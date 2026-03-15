import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuote, TradeType } from '0xtrails';
import { useAccount, useSwitchChain, useWalletClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseUnits } from 'viem';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { SOURCE_CHAINS, DEST_CHAINS, getDestinationConfig, chainImageUrl, SOURCE_USDC } from '../lib/bridge-config';
import type { DestKey } from '../lib/bridge-config';
import { useUsdcBalance } from '../hooks/useUsdcBalance';

const TRAILS_API_KEY = import.meta.env.VITE_TRAILS_API_KEY || '';

type BridgeState = 'idle' | 'quoting' | 'quoted' | 'signing' | 'pending' | 'confirming' | 'success' | 'error';

function ChainCard({
  name, chainId, color, subtitle, isSelected, onClick, disabled,
}: {
  name: string; chainId: number; color: string; subtitle?: string;
  isSelected: boolean; onClick: () => void; disabled?: boolean;
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
      className={`relative flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer
        ${isSelected
          ? 'border-[#FF9900] bg-[#FF9900]/10 shadow-[0_0_24px_rgba(255,153,0,0.18)]'
          : 'border-transparent glass-card !border-transparent hover:!border-white/15'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {isSelected && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#FF9900] flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      {showImg ? (
        <img src={img} alt={name} className="w-9 h-9 rounded-full ring-2 ring-white/10" onError={handleImgError} />
      ) : (
        <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/10`}>
          {name.charAt(0)}
        </div>
      )}
      <span className="text-xs font-semibold leading-tight text-center">{name}</span>
      {subtitle && <span className="text-[10px] text-gray-400 leading-tight">{subtitle}</span>}
    </button>
  );
}

const PROGRESS_STEPS = [
  'Signing transaction...',
  'Broadcasting...',
  'Confirming on source chain...',
  'Bridging to destination...',
  'Complete!',
];

function getProgressIndex(state: BridgeState): number {
  switch (state) {
    case 'signing': return 0;
    case 'pending': return 1;
    case 'confirming': return 2;
    case 'success': return 4;
    default: return -1;
  }
}

export default function BridgeCard() {
  const { t } = useTranslation();
  const { address, isConnected, chain } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const { balance: usdcBalance } = useUsdcBalance();
  const f = t.fund || {} as Record<string, string>;

  const [selectedDest, setSelectedDest] = useState<DestKey>('skale');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [bridgeState, setBridgeState] = useState<BridgeState>('idle');
  const [bridgedAmount, setBridgedAmount] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [swapResult, setSwapResult] = useState<{ originTxHash?: string | null; destTxHash?: string | null } | null>(null);

  const actualRecipient = (recipient || address || '') as `0x${string}`;
  const isValidRecipient = actualRecipient && actualRecipient.startsWith('0x') && actualRecipient.length === 42;

  const selectedChain = DEST_CHAINS.find((c) => c.key === selectedDest)!;
  const destConfig = isValidRecipient ? getDestinationConfig(selectedDest, actualRecipient) : null;
  const sourceChain = SOURCE_CHAINS.find((c) => c.id === chain?.id);
  const sourceChainName = sourceChain?.name || chain?.name || 'Unknown';

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

  const { quote, send, isLoadingQuote, quoteError, quoteErrorPrettified, refetchQuote } = useQuote({
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
      triggerCheckoutComplete: () => {
        setBridgeState('success');
      },
      triggerCheckoutError: () => {
        setBridgeState('error');
        setErrorMessage('Bridge transaction failed. Please try again.');
      },
    },
  });

  // Derive quoting/quoted states from hook
  useEffect(() => {
    if (bridgeState === 'signing' || bridgeState === 'pending' || bridgeState === 'confirming' || bridgeState === 'success' || bridgeState === 'error') return;
    if (!parsedAmount || !isValidRecipient || !fromToken) {
      setBridgeState('idle');
    } else if (isLoadingQuote) {
      setBridgeState('quoting');
    } else if (quote && !quoteError) {
      setBridgeState('quoted');
    } else {
      setBridgeState('idle');
    }
  }, [isLoadingQuote, quote, quoteError, parsedAmount, isValidRecipient, fromToken, bridgeState]);

  // Auto-refetch quote every 30s
  const refetchRef = useRef(refetchQuote);
  refetchRef.current = refetchQuote;
  useEffect(() => {
    if (bridgeState !== 'quoted') return;
    const id = setInterval(() => refetchRef.current?.(), 30000);
    return () => clearInterval(id);
  }, [bridgeState]);

  async function handleBridge() {
    if (!send || !quote) return;
    setBridgeState('signing');
    setErrorMessage(null);
    try {
      const result = await send();
      if (result) {
        setBridgedAmount(quote.destinationAmountDisplay || quote.destinationAmountFormatted || null);
        setSwapResult({
          originTxHash: result.originTransaction?.transactionHash,
          destTxHash: result.destinationTransaction?.transactionHash,
        });
        setBridgeState('success');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.includes('rejected') || msg.includes('denied') || msg.includes('User rejected')) {
        setBridgeState('quoted');
        return;
      }
      setBridgeState('error');
      setErrorMessage(msg);
    }
  }

  function handleReset() {
    setBridgeState('idle');
    setBridgedAmount(null);
    setErrorMessage(null);
    setSwapResult(null);
    setAmount('');
  }

  function setAmountPercent(pct: number) {
    if (!usdcBalance) return;
    const val = (parseFloat(usdcBalance) * pct / 100);
    if (val <= 0) return;
    setAmount(val.toFixed(6).replace(/\.?0+$/, ''));
  }

  const buttonTextMap: Record<DestKey, string> = {
    base: f.bridgeButtonBase || 'Bridge to Base',
    skale: f.bridgeButtonSkale || 'Bridge to SKALE',
    polygon: f.bridgeButtonPolygon || 'Bridge to Polygon',
  };

  const successTimingMap: Record<DestKey, string> = {
    base: f.successTimingBase || 'USDC arrives on Base in ~1-2 minutes.',
    skale: f.successTimingSkale || 'IMA bridge takes 5-15 min to deliver to SKALE.',
    polygon: f.successTimingPolygon || 'USDC arrives on Polygon in ~2-5 minutes.',
  };

  const isBridging = bridgeState === 'signing' || bridgeState === 'pending' || bridgeState === 'confirming';
  const isComplete = bridgeState === 'success';
  const progressIdx = getProgressIndex(bridgeState);

  // Not connected
  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto glass-card rounded-2xl p-8 text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FF9900]/15 flex items-center justify-center">
          <svg className="w-7 h-7 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-400">{f.connectPrompt || 'Connect your wallet to bridge USDC'}</p>
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <button
              onClick={openConnectModal}
              className="px-6 py-3 rounded-xl bg-[#FF9900] hover:bg-[#e68a00] text-white font-semibold transition-colors cursor-pointer"
            >
              {f.connectPrompt || 'Connect Wallet'}
            </button>
          )}
        </ConnectButton.Custom>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* FROM — Source Chain Cards */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {f.fromLabel || 'From'}
          </label>
          {isSwitching && (
            <span className="text-xs text-[#FF9900] animate-pulse">{f.switchChain || 'Switching...'}</span>
          )}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {SOURCE_CHAINS.map((sc) => (
            <ChainCard
              key={sc.id}
              name={sc.name}
              chainId={sc.id}
              color={sc.color}
              subtitle={sc.gas}
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

      {/* Arrow separator */}
      <div className="flex justify-center -my-2">
        <div className="w-10 h-10 rounded-full bg-[#FF9900]/15 border border-[#FF9900]/30 flex items-center justify-center">
          <svg className="w-5 h-5 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* TO — Destination Chain Cards */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {f.toLabel || 'To'}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {DEST_CHAINS.map((dc) => (
            <ChainCard
              key={dc.key}
              name={dc.name}
              chainId={dc.id}
              color={dc.color}
              subtitle={`${dc.time} · Gas ${dc.gas}`}
              isSelected={selectedDest === dc.key}
              disabled={isBridging || isComplete}
              onClick={() => setSelectedDest(dc.key)}
            />
          ))}
        </div>
      </div>

      {/* Route Summary */}
      {!isComplete && (
        <div className="flex items-center gap-3 px-5 py-3 glass-card rounded-xl">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${sourceChain?.color || 'bg-gray-500'}`} />
            <span className="text-sm font-medium">{sourceChainName}</span>
          </div>
          <div className="flex-1 border-t border-dashed border-gray-300 dark:border-white/15 mx-2 relative">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white dark:bg-[#0f1219] px-2">
              <svg className="w-4 h-4 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${selectedChain.color}`} />
            <span className="text-sm font-medium">{selectedChain.name}</span>
          </div>
          <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
            {selectedChain.time}
          </span>
        </div>
      )}

      {/* Bridge Card — Amount + Quote + Button */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        {!isComplete && (
          <>
            {/* Recipient */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{f.recipientLabel || 'Recipient Address'}</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={address || '0x...'}
                disabled={isBridging}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]/40 focus:border-[#FF9900]/40 transition-all disabled:opacity-50"
              />
              <p className="text-xs text-gray-500">{f.recipientHint || 'Leave empty to use your connected wallet address'}</p>
            </div>

            {isValidRecipient && TRAILS_API_KEY && destConfig && (
              <>
                {/* Amount Input */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Amount</label>
                    {usdcBalance && (
                      <span className="text-xs text-gray-400">
                        Balance: <span className="text-white font-medium">{parseFloat(usdcBalance).toFixed(2)} USDC</span>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9.]/g, '');
                        if (v.split('.').length <= 2) setAmount(v);
                      }}
                      placeholder="0.00"
                      disabled={isBridging}
                      className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#FF9900]/40 focus:border-[#FF9900]/40 transition-all disabled:opacity-50 placeholder:text-gray-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">USDC</span>
                  </div>
                  {/* Quick % buttons */}
                  <div className="flex gap-2">
                    {[25, 50, 75].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        disabled={isBridging || !usdcBalance}
                        onClick={() => setAmountPercent(pct)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-white/10 bg-white/[0.04] hover:bg-[#FF9900]/10 hover:border-[#FF9900]/30 text-gray-400 hover:text-[#FF9900] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {pct}%
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={isBridging || !usdcBalance}
                      onClick={() => setAmountPercent(100)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-white/10 bg-white/[0.04] hover:bg-[#FF9900]/10 hover:border-[#FF9900]/30 text-gray-400 hover:text-[#FF9900] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Quote Display */}
                {bridgeState === 'quoting' && (
                  <div className="flex items-center justify-center gap-2 py-3">
                    <div className="w-4 h-4 border-2 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-400">Fetching quote...</span>
                  </div>
                )}

                {quote && bridgeState === 'quoted' && (
                  <div className="space-y-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">You receive</span>
                      <span className="text-sm font-bold text-white">
                        ~{quote.destinationAmountDisplay || quote.destinationAmountFormatted} {quote.destinationToken?.symbol || 'USDC'}
                      </span>
                    </div>
                    {quote.totalFeesUsdDisplay && quote.totalFeesUsdDisplay !== '$0.00' && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Fees</span>
                        <span className="text-xs text-gray-400">{quote.totalFeesUsdDisplay}</span>
                      </div>
                    )}
                    {quote.gasCostUsdDisplay && quote.gasCostUsdDisplay !== '$0.00' && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Gas</span>
                        <span className="text-xs text-gray-400">{quote.gasCostUsdDisplay}</span>
                      </div>
                    )}
                    {quote.completionEstimateDisplay && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Est. time</span>
                        <span className="text-xs text-gray-400">{quote.completionEstimateDisplay}</span>
                      </div>
                    )}
                  </div>
                )}

                {quoteError && !isLoadingQuote && parsedAmount && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-400">{quoteErrorPrettified || 'Failed to fetch quote. Try a different amount.'}</p>
                  </div>
                )}

                {/* Progress Overlay */}
                {isBridging && (
                  <div className="space-y-3 p-4 rounded-xl bg-[#FF9900]/5 border border-[#FF9900]/15">
                    {/* Progress bar */}
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#FF9900] to-[#e68a00] transition-all duration-700 ease-out"
                        style={{ width: `${Math.max(10, ((progressIdx + 1) / PROGRESS_STEPS.length) * 100)}%` }}
                      />
                    </div>
                    {/* Steps */}
                    <div className="space-y-1.5">
                      {PROGRESS_STEPS.slice(0, progressIdx + 2).map((step, i) => (
                        <div key={step} className="flex items-center gap-2">
                          {i <= progressIdx ? (
                            <svg className="w-3.5 h-3.5 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <div className="w-3.5 h-3.5 border-2 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
                          )}
                          <span className={`text-xs ${i <= progressIdx ? 'text-gray-400' : 'text-[#FF9900] font-medium'}`}>
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error state */}
                {bridgeState === 'error' && errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2">
                    <p className="text-sm text-red-400">{errorMessage}</p>
                    <button
                      onClick={() => { setBridgeState('idle'); setErrorMessage(null); }}
                      className="text-xs text-[#FF9900] hover:underline font-medium cursor-pointer"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {/* Bridge Button */}
                {!isBridging && bridgeState !== 'error' && (
                  <button
                    type="button"
                    disabled={!send || !quote || bridgeState !== 'quoted'}
                    onClick={handleBridge}
                    className="w-full py-4 rounded-xl bg-[#FF9900] hover:bg-[#e68a00] text-white font-bold text-base
                      shadow-[0_0_24px_rgba(255,153,0,0.3)] hover:shadow-[0_0_32px_rgba(255,153,0,0.45)]
                      transition-all duration-200 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
                  >
                    {bridgeState === 'quoting' ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Getting quote...
                      </span>
                    ) : (
                      buttonTextMap[selectedDest]
                    )}
                  </button>
                )}

                {!fromToken && (
                  <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-sm text-yellow-400">USDC is not available on this source chain. Try switching to Base, Ethereum, Polygon, Optimism, or Arbitrum.</p>
                  </div>
                )}
              </>
            )}

            {/* Invalid recipient */}
            {!isValidRecipient && (
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] text-center">
                <p className="text-sm text-gray-400">{f.invalidAddress || 'Enter a valid recipient address to continue'}</p>
              </div>
            )}

            {/* No API key */}
            {isValidRecipient && !TRAILS_API_KEY && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <p className="text-sm text-red-400">Trails API key not configured. Set VITE_TRAILS_API_KEY.</p>
              </div>
            )}
          </>
        )}

        {/* Success */}
        {isComplete && (
          <div className="space-y-4">
            <div className="p-5 bg-green-500/10 border border-green-500/20 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <p className="text-sm font-semibold text-green-400">{f.successTitle || 'Bridge initiated!'}</p>
              </div>
              {(bridgedAmount || amount) && (
                <p className="text-sm text-green-300"><strong>{f.successAmount || 'Amount'}:</strong> {bridgedAmount || amount} USDC</p>
              )}
              <p className="text-sm text-green-300">
                <strong>{f.successRecipient || 'Recipient'}:</strong> {actualRecipient.slice(0, 6)}...{actualRecipient.slice(-4)}
              </p>
              {swapResult?.originTxHash && (
                <p className="text-xs text-green-300/70">TX: {swapResult.originTxHash.slice(0, 16)}...</p>
              )}
              <p className="text-sm text-green-300/80 pt-1">{successTimingMap[selectedDest]}</p>
              <Link to="/services" className="inline-flex items-center gap-1 mt-1 text-sm text-[#FF9900] hover:underline font-semibold">
                {f.startUsing || 'Start using APIs'} &rarr;
              </Link>
            </div>

            <button
              onClick={handleReset}
              className="w-full h-12 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] font-medium transition-colors cursor-pointer"
            >
              {f.bridgeMore || 'Bridge More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
