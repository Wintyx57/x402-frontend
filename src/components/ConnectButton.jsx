import { useState, useRef, useEffect } from 'react';
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { base, baseSepolia } from 'wagmi/chains';
import { skaleEuropa } from '../wagmi';
import { useTranslation } from '../i18n/LanguageContext';

const IS_MAINNET = import.meta.env.VITE_NETWORK === 'mainnet';

const SKALE_ID = skaleEuropa.chainId ?? skaleEuropa.id;

// Accepted chains depending on environment
const ACCEPTED_CHAINS = IS_MAINNET
  ? [base, { id: SKALE_ID, name: 'SKALE Europa' }]
  : [baseSepolia];

const ACCEPTED_IDS = new Set(ACCEPTED_CHAINS.map(c => c.id));

export default function ConnectButton() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { open } = useAppKit();
  const { t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API may fail in insecure contexts
    }
  };

  const isOnAcceptedChain = chain && ACCEPTED_IDS.has(chain.id);

  // Not connected: open AppKit modal (handles QR codes, deep links, mobile wallets)
  if (!isConnected) {
    return (
      <button
        onClick={() => open()}
        className="gradient-btn text-white text-sm px-4 py-2.5 min-h-[44px] rounded-lg font-medium cursor-pointer
                   transition-all duration-200 hover:brightness-110"
      >
        {t.connect.connectWallet}
      </button>
    );
  }

  if (!isOnAcceptedChain) {
    return (
      <button
        onClick={() => switchChain({ chainId: ACCEPTED_CHAINS[0].id })}
        className="bg-red-600 hover:bg-red-500 text-white text-sm px-4 py-2.5 min-h-[44px] rounded-lg font-medium
                   cursor-pointer transition-all duration-200"
      >
        {t.connect.switchTo} {ACCEPTED_CHAINS[0].name}
      </button>
    );
  }

  const isSkale = chain?.id === SKALE_ID;
  const chainColor = isSkale ? '#34D399' : '#FF9900';
  const chainLabel = chain?.name || 'Unknown';
  const otherChains = ACCEPTED_CHAINS.filter(c => c.id !== chain?.id);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        aria-expanded={dropdownOpen}
        className="glass text-gray-300 text-xs sm:text-sm px-2 sm:px-3 py-2.5 min-h-[44px] rounded-lg font-mono cursor-pointer
                   transition-all duration-200 hover:border-white/15 flex items-center gap-2"
      >
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: chainColor }} />
        <span className="hidden sm:inline text-xs" style={{ color: chainColor }}>{chainLabel}</span>
        <span className="truncate max-w-[120px]">{address.slice(0, 6)}...{address.slice(-4)}</span>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-[min(calc(100vw-2rem),18rem)]
                        bg-[#1a2332] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Full address */}
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">{t.connect.wallet}</p>
            <p className="text-xs text-gray-300 font-mono break-all leading-relaxed">{address}</p>
          </div>

          {/* Chain info */}
          <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: chainColor }} />
            <span className="text-xs text-gray-300">{chainLabel}</span>
            {isSkale && (
              <span className="text-[11px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded">{t.connect.freeGas}</span>
            )}
          </div>

          {/* Switch chain */}
          {otherChains.length > 0 && (
            <div className="px-2 py-2 border-b border-white/5">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider px-2 mb-1">{t.connect.switchNetwork}</p>
              {otherChains.map(c => (
                <button
                  key={c.id}
                  onClick={() => { switchChain({ chainId: c.id }); setDropdownOpen(false); }}
                  className="w-full text-left text-xs text-gray-300 hover:text-white hover:bg-white/5
                             px-3 py-3 min-h-[44px] rounded-lg transition-colors duration-150 cursor-pointer flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: c.id === SKALE_ID ? '#34D399' : '#FF9900' }} />
                  {c.name}
                  {c.id === SKALE_ID && (
                    <span className="text-[11px] text-green-400 ml-auto">{t.connect.zeroGas}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="p-2 flex flex-col gap-1">
            <button
              onClick={copyAddress}
              className="w-full text-left text-xs text-gray-300 hover:text-white hover:bg-white/5
                         px-3 py-3 min-h-[44px] rounded-lg transition-colors duration-150 cursor-pointer"
            >
              {copied ? t.connect.addressCopied : t.connect.copyAddress}
            </button>
            <button
              onClick={() => { disconnect(); setDropdownOpen(false); }}
              className="w-full text-left text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10
                         px-3 py-3 min-h-[44px] rounded-lg transition-colors duration-150 cursor-pointer"
            >
              {t.connect.disconnect}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
