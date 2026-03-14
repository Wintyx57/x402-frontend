import { useState } from 'react';
import { TrailsWidget } from '0xtrails';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { DEST_CHAINS, getDestinationConfig, chainImageUrl, getSourceChainName } from '../lib/bridge-config';
import type { DestKey } from '../lib/bridge-config';

const TRAILS_API_KEY = import.meta.env.VITE_TRAILS_API_KEY || '';

export default function BridgeCard() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { address, isConnected, chain } = useAccount();
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

  const widgetCss = isDark
    ? `--trails-border-radius-button: 12px;
       --trails-border-radius-card: 16px;
       --trails-primary: #FF9900;
       --trails-primary-hover: #e68a00;
       --trails-text-inverse: #ffffff;
       --trails-focus-ring: rgba(255, 153, 0, 0.4);
       --trails-background: #1a1f2e;
       --trails-border-color: rgba(255, 255, 255, 0.15);
       --trails-text-primary: #E8E4E0;
       --trails-text-secondary: #9ca3af;`
    : `--trails-border-radius-button: 12px;
       --trails-border-radius-card: 16px;
       --trails-primary: #FF9900;
       --trails-primary-hover: #e68a00;
       --trails-text-inverse: #ffffff;
       --trails-focus-ring: rgba(255, 153, 0, 0.4);
       --trails-background: #ffffff;
       --trails-border-color: #e5e7eb;
       --trails-text-primary: #111827;
       --trails-text-secondary: #6b7280;`;

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
      const decimals = selectedDest === 'skale' ? 6 : 6; // USDC is 6 decimals on Base and Polygon
      setBridgedAmount((Number(quote.destinationTokenAmount) / 10 ** decimals).toFixed(2));
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

  const sourceChainName = getSourceChainName(chain?.id);
  const sourceChainImg = chain?.id ? chainImageUrl(chain.id) : null;

  return (
    <div className="max-w-xl mx-auto glass-card rounded-2xl p-6 space-y-5">
      {/* Source Chain */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {f.fromLabel || 'Your Chain'}
        </label>
        <ConnectButton.Custom>
          {({ openChainModal, openConnectModal, mounted }) => {
            if (!mounted || !isConnected) {
              return (
                <button
                  onClick={openConnectModal}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-sm font-medium"
                >
                  {f.connectPrompt || 'Connect your wallet to bridge USDC'}
                </button>
              );
            }
            return (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  {sourceChainImg ? (
                    <img src={sourceChainImg} alt={sourceChainName} className="w-7 h-7 rounded-full" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-white">
                      {sourceChainName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium">{sourceChainName}</span>
                    <span className="ml-2 text-xs text-green-400">(connected)</span>
                  </div>
                </div>
                <button
                  onClick={openChainModal}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#FF9900]/30 text-[#FF9900] hover:bg-[#FF9900]/10 transition-colors cursor-pointer bg-transparent"
                >
                  {f.switchChain || 'Switch Chain'}
                </button>
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>

      {/* Arrow */}
      {isConnected && (
        <div className="flex justify-center">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      )}

      {/* Destination Cards */}
      {isConnected && (
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {f.toLabel || 'Bridge To'}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {DEST_CHAINS.map((chain) => {
              const isSelected = selectedDest === chain.key;
              const img = chainImageUrl(chain.id);
              return (
                <button
                  key={chain.key}
                  type="button"
                  disabled={bridgeComplete}
                  onClick={() => setSelectedDest(chain.key)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-[#FF9900] bg-[#FF9900]/8 shadow-[0_0_20px_rgba(255,153,0,0.15)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                  } disabled:opacity-50`}
                >
                  {/* Checkmark */}
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}

                  {/* Chain logo */}
                  {img ? (
                    <img src={img} alt={chain.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full ${chain.color} flex items-center justify-center text-white font-bold text-lg`}>
                      S
                    </div>
                  )}

                  <span className="text-sm font-semibold">{chain.name}</span>
                  <div className="text-xs text-gray-400 space-y-0.5">
                    <div>{chain.time}</div>
                    <div>Gas {chain.gas}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Route Summary */}
      {isConnected && !bridgeComplete && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              chain?.id === 8453 ? 'bg-blue-500' : chain?.id === 137 ? 'bg-purple-500' : 'bg-slate-400'
            }`} />
            <span className="text-sm font-medium">{sourceChainName}</span>
          </div>
          <svg className="w-4 h-4 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${selectedChain.color}`} />
            <span className="text-sm font-medium">{selectedChain.name}</span>
          </div>
          <span className="ml-auto text-xs text-gray-400">
            {f.estimatedTime || 'Est. time'}: {selectedChain.time}
          </span>
        </div>
      )}

      {/* Recipient */}
      {isConnected && !bridgeComplete && (
        <div className="space-y-2">
          <label className="text-sm font-medium">{f.recipientLabel || 'Recipient Address'}</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={address || '0x...'}
            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]/50"
          />
          <p className="text-xs text-gray-500">{f.recipientHint || 'Leave empty to use your connected wallet address'}</p>
        </div>
      )}

      {/* Trails Widget */}
      {isConnected && isValidRecipient && TRAILS_API_KEY && destConfig && !bridgeComplete && (
        <TrailsWidget
          key={`trails-${selectedDest}-${actualRecipient}`}
          apiKey={TRAILS_API_KEY}
          mode="fund"
          toChainId={destConfig.toChainId}
          toToken={destConfig.toToken}
          toAddress={destConfig.toAddress}
          toCalldata={destConfig.toCalldata}
          theme={isDark ? 'dark' : 'light'}
          customCss={widgetCss}
          onCheckoutQuote={handleCheckoutQuote}
          onCheckoutComplete={handleBridgeComplete}
          onCheckoutError={({ error }: { sessionId: string; error: unknown }) => {
            console.error('Bridge error:', error);
          }}
          buttonText={buttonTextMap[selectedDest]}
        />
      )}

      {/* Invalid recipient */}
      {isConnected && !isValidRecipient && !bridgeComplete && (
        <div className="p-4 bg-white/5 rounded-lg text-center">
          <p className="text-sm text-gray-400">{f.invalidAddress || 'Enter a valid recipient address to continue'}</p>
        </div>
      )}

      {/* No API key */}
      {isConnected && isValidRecipient && !TRAILS_API_KEY && !bridgeComplete && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
          <p className="text-sm text-red-400">Trails API key not configured. Set VITE_TRAILS_API_KEY.</p>
        </div>
      )}

      {/* Success */}
      {bridgeComplete && (
        <div className="space-y-4">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg space-y-2">
            <p className="text-sm font-medium text-green-400">{f.successTitle || 'Bridge initiated!'}</p>
            {bridgedAmount && (
              <p className="text-xs text-green-300"><strong>{f.successAmount || 'Amount'}:</strong> {bridgedAmount} USDC</p>
            )}
            <p className="text-xs text-green-300">
              <strong>{f.successRecipient || 'Recipient'}:</strong> {actualRecipient.slice(0, 6)}...{actualRecipient.slice(-4)}
            </p>
            {bridgeSessionId && (
              <p className="text-xs text-green-300"><strong>Session:</strong> {bridgeSessionId.slice(0, 16)}...</p>
            )}
            <p className="text-xs text-green-300 mt-2">{successTimingMap[selectedDest]}</p>
            <Link to="/services" className="inline-block mt-2 text-sm text-[#FF9900] hover:underline font-medium">
              {f.startUsing || 'Start using APIs'} &rarr;
            </Link>
          </div>

          <button
            onClick={handleReset}
            className="w-full h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 font-medium transition-colors cursor-pointer"
          >
            {f.bridgeMore || 'Bridge More'}
          </button>
        </div>
      )}
    </div>
  );
}
