import { useState, useCallback } from 'react';
import { TrailsWidget } from '0xtrails';
import { useAccount, useSwitchChain } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { SOURCE_CHAINS, DEST_CHAINS, getDestinationConfig, chainImageUrl } from '../lib/bridge-config';
import type { DestKey } from '../lib/bridge-config';

const TRAILS_API_KEY = import.meta.env.VITE_TRAILS_API_KEY || '';

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

// Deep CSS customization — widget blends into glass-card design
function useWidgetCss(isDark: boolean): string {
  if (isDark) {
    return `
      --trails-primary: #FF9900;
      --trails-primary-hover: #e68a00;
      --trails-primary-disabled: rgba(255,153,0,0.3);
      --trails-primary-disabled-text: rgba(255,255,255,0.4);
      --trails-text-primary: #E8E4E0;
      --trails-text-secondary: #9ca3af;
      --trails-text-tertiary: #6b7280;
      --trails-text-muted: #4b5563;
      --trails-text-inverse: #ffffff;
      --trails-bg-primary: transparent;
      --trails-bg-secondary: rgba(255,255,255,0.04);
      --trails-bg-secondary-hover: rgba(255,255,255,0.08);
      --trails-bg-tertiary: rgba(255,255,255,0.06);
      --trails-bg-card: rgba(255,255,255,0.04);
      --trails-bg-overlay: rgba(15,18,25,0.95);
      --trails-border-primary: rgba(255,255,255,0.12);
      --trails-border-secondary: rgba(255,255,255,0.15);
      --trails-border-tertiary: rgba(255,255,255,0.06);
      --trails-input-bg: rgba(255,255,255,0.04);
      --trails-input-border: rgba(255,255,255,0.12);
      --trails-input-text: #E8E4E0;
      --trails-input-placeholder: #6b7280;
      --trails-input-focus-border: #FF9900;
      --trails-dropdown-bg: #1a1f2e;
      --trails-dropdown-border: rgba(255,255,255,0.12);
      --trails-dropdown-text: #E8E4E0;
      --trails-dropdown-hover-bg: rgba(255,255,255,0.08);
      --trails-dropdown-selected-bg: rgba(255,153,0,0.12);
      --trails-dropdown-selected-text: #FF9900;
      --trails-dropdown-focus-border: #FF9900;
      --trails-list-bg: #1a1f2e;
      --trails-list-border: rgba(255,255,255,0.12);
      --trails-list-hover-bg: rgba(255,255,255,0.06);
      --trails-list-item-bg: transparent;
      --trails-list-item-selected-bg: rgba(255,153,0,0.1);
      --trails-hover-bg: rgba(255,255,255,0.06);
      --trails-hover-text: #ffffff;
      --trails-modal-button-bg: #FF9900;
      --trails-modal-button-hover-bg: #e68a00;
      --trails-modal-button-text: #ffffff;
      --trails-modal-button-shadow: 0 4px 14px rgba(255,153,0,0.25);
      --trails-success-bg: rgba(34,197,94,0.12);
      --trails-success-text: #4ade80;
      --trails-success-border: rgba(34,197,94,0.25);
      --trails-warning-bg: rgba(234,179,8,0.12);
      --trails-warning-text: #facc15;
      --trails-warning-border: rgba(234,179,8,0.25);
      --trails-error-bg: rgba(239,68,68,0.12);
      --trails-error-text: #f87171;
      --trails-error-border: rgba(239,68,68,0.25);
      --trails-shadow: none;
      --trails-widget-border: none;
      --trails-border-radius-widget: 0px;
      --trails-border-radius-button: 12px;
      --trails-border-radius-input: 12px;
      --trails-border-radius-dropdown: 12px;
      --trails-border-radius-container: 12px;
      --trails-border-radius-list: 12px;
      --trails-border-radius-list-button: 10px;
      --trails-border-radius-large-button: 14px;
      --trails-percentage-button-bg: rgba(255,255,255,0.08);
      --trails-percentage-button-text: #9ca3af;
      --trails-percentage-button-hover-bg: rgba(255,153,0,0.15);
      --trails-focus-ring: rgba(255,153,0,0.4);
    `;
  }
  return `
    --trails-primary: #FF9900;
    --trails-primary-hover: #e68a00;
    --trails-primary-disabled: #e5e7eb;
    --trails-primary-disabled-text: #9ca3af;
    --trails-text-primary: #111827;
    --trails-text-secondary: #4b5563;
    --trails-text-tertiary: #6b7280;
    --trails-text-muted: #9ca3af;
    --trails-text-inverse: #ffffff;
    --trails-bg-primary: transparent;
    --trails-bg-secondary: #f9fafb;
    --trails-bg-secondary-hover: #f3f4f6;
    --trails-bg-tertiary: #f3f4f6;
    --trails-bg-card: #ffffff;
    --trails-bg-overlay: rgba(255,255,255,0.98);
    --trails-border-primary: #e5e7eb;
    --trails-border-secondary: #d1d5db;
    --trails-border-tertiary: #f3f4f6;
    --trails-input-bg: #ffffff;
    --trails-input-border: #d1d5db;
    --trails-input-text: #111827;
    --trails-input-placeholder: #9ca3af;
    --trails-input-focus-border: #FF9900;
    --trails-dropdown-bg: #ffffff;
    --trails-dropdown-border: #e5e7eb;
    --trails-dropdown-text: #111827;
    --trails-dropdown-hover-bg: #f9fafb;
    --trails-dropdown-selected-bg: rgba(255,153,0,0.08);
    --trails-dropdown-selected-text: #FF9900;
    --trails-dropdown-focus-border: #FF9900;
    --trails-list-bg: #ffffff;
    --trails-list-border: #e5e7eb;
    --trails-list-hover-bg: #f9fafb;
    --trails-list-item-bg: transparent;
    --trails-list-item-selected-bg: rgba(255,153,0,0.06);
    --trails-hover-bg: #f3f4f6;
    --trails-hover-text: #111827;
    --trails-modal-button-bg: #FF9900;
    --trails-modal-button-hover-bg: #e68a00;
    --trails-modal-button-text: #ffffff;
    --trails-modal-button-shadow: 0 4px 14px rgba(255,153,0,0.2);
    --trails-success-bg: #f0fdf4;
    --trails-success-text: #16a34a;
    --trails-success-border: #bbf7d0;
    --trails-warning-bg: #fffbeb;
    --trails-warning-text: #d97706;
    --trails-warning-border: #fde68a;
    --trails-error-bg: #fef2f2;
    --trails-error-text: #dc2626;
    --trails-error-border: #fecaca;
    --trails-shadow: none;
    --trails-widget-border: none;
    --trails-border-radius-widget: 0px;
    --trails-border-radius-button: 12px;
    --trails-border-radius-input: 12px;
    --trails-border-radius-dropdown: 12px;
    --trails-border-radius-container: 12px;
    --trails-border-radius-list: 12px;
    --trails-border-radius-list-button: 10px;
    --trails-border-radius-large-button: 14px;
    --trails-percentage-button-bg: #e5e7eb;
    --trails-percentage-button-text: #6b7280;
    --trails-percentage-button-hover-bg: rgba(255,153,0,0.12);
    --trails-focus-ring: rgba(255,153,0,0.4);
  `;
}

export default function BridgeCard() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { address, isConnected, chain } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const f = t.fund || {} as Record<string, string>;

  const [selectedDest, setSelectedDest] = useState<DestKey>('skale');
  const [recipient, setRecipient] = useState('');
  const [bridgeComplete, setBridgeComplete] = useState(false);
  const [bridgedAmount, setBridgedAmount] = useState<string | null>(null);
  const [bridgeSessionId, setBridgeSessionId] = useState<string | null>(null);

  const actualRecipient = (recipient || address || '') as `0x${string}`;
  const isValidRecipient = actualRecipient && actualRecipient.startsWith('0x') && actualRecipient.length === 42;
  const isDark = theme === 'dark';

  const selectedChain = DEST_CHAINS.find((c) => c.key === selectedDest)!;
  const destConfig = isValidRecipient ? getDestinationConfig(selectedDest, actualRecipient) : null;
  const sourceChain = SOURCE_CHAINS.find((c) => c.id === chain?.id);
  const sourceChainName = sourceChain?.name || chain?.name || 'Unknown';

  const widgetCss = useWidgetCss(isDark);

  const buttonTextMap: Record<DestKey, string> = {
    base: f.bridgeButtonBase || 'Bridge USDC to Base',
    skale: f.bridgeButtonSkale || 'Bridge USDC to SKALE',
    polygon: f.bridgeButtonPolygon || 'Bridge USDC to Polygon',
  };

  const successTimingMap: Record<DestKey, string> = {
    base: f.successTimingBase || 'USDC arrives on Base in ~1-2 minutes.',
    skale: f.successTimingSkale || 'IMA bridge takes 5-15 min to deliver to SKALE.',
    polygon: f.successTimingPolygon || 'USDC arrives on Polygon in ~2-5 minutes.',
  };

  function handleCheckoutQuote({ quote }: { sessionId: string; quote: { destinationTokenAmount?: string } }) {
    if (quote?.destinationTokenAmount) {
      setBridgedAmount((Number(quote.destinationTokenAmount) / 1e6).toFixed(2));
    }
  }

  function handleBridgeComplete({ sessionId }: { sessionId: string }) {
    if (import.meta.env.DEV) console.log('Bridge complete! Session:', sessionId);
    setBridgeComplete(true);
    setBridgeSessionId(sessionId);
  }

  function handleReset() {
    setBridgeComplete(false);
    setBridgeSessionId(null);
    setBridgedAmount(null);
  }

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
            <span className="text-xs text-[#FF9900] animate-pulse">{f.switchingChain || 'Switching...'}</span>
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
              disabled={isSwitching || bridgeComplete}
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
              disabled={bridgeComplete}
              onClick={() => setSelectedDest(dc.key)}
            />
          ))}
        </div>
      </div>

      {/* Route Summary */}
      {!bridgeComplete && (
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

      {/* Recipient + Inline Widget + Success */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        {!bridgeComplete && (
          <>
            {/* Recipient */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{f.recipientLabel || 'Recipient Address'}</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={address || '0x...'}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]/40 focus:border-[#FF9900]/40 transition-all"
              />
              <p className="text-xs text-gray-500">{f.recipientHint || 'Leave empty to use your connected wallet address'}</p>
            </div>

            {/* Inline Trails Widget — token selector, amount, quote, execute */}
            {isValidRecipient && TRAILS_API_KEY && destConfig && (
              <div className="trails-inline-widget">
                <TrailsWidget
                  key={`trails-${selectedDest}-${actualRecipient}`}
                  apiKey={TRAILS_API_KEY}
                  mode="fund"
                  renderInline
                  toChainId={destConfig.toChainId}
                  toToken={destConfig.toToken}
                  toAddress={destConfig.toAddress}
                  toCalldata={destConfig.toCalldata}
                  hideDisconnect
                  theme={isDark ? 'dark' : 'light'}
                  customCss={widgetCss}
                  onCheckoutQuote={handleCheckoutQuote}
                  onCheckoutComplete={handleBridgeComplete}
                  onCheckoutError={({ error }: { sessionId: string; error: unknown }) => {
                    console.error('Bridge error:', error);
                  }}
                  buttonText={buttonTextMap[selectedDest]}
                />
              </div>
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
        {bridgeComplete && (
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
              {bridgedAmount && (
                <p className="text-sm text-green-300"><strong>{f.successAmount || 'Amount'}:</strong> {bridgedAmount} USDC</p>
              )}
              <p className="text-sm text-green-300">
                <strong>{f.successRecipient || 'Recipient'}:</strong> {actualRecipient.slice(0, 6)}...{actualRecipient.slice(-4)}
              </p>
              {bridgeSessionId && (
                <p className="text-xs text-green-300/70">Session: {bridgeSessionId.slice(0, 16)}...</p>
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
