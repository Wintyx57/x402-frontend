import { useState, useRef, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { useTranslation } from '../i18n/LanguageContext';

const TARGET_CHAIN = import.meta.env.VITE_NETWORK === 'mainnet' ? base : baseSepolia;

export default function ConnectButton() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
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
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!isConnected) {
    return (
      <button
        onClick={() => connect({ connector: connectors[0] })}
        disabled={isConnecting}
        className="gradient-btn text-white text-sm px-4 py-2 rounded-lg font-medium cursor-pointer
                   transition-all duration-200 hover:brightness-110 disabled:opacity-60 disabled:cursor-wait"
      >
        {isConnecting ? '...' : t.connect.connectWallet}
      </button>
    );
  }

  if (chain?.id !== TARGET_CHAIN.id) {
    return (
      <button
        onClick={() => switchChain({ chainId: TARGET_CHAIN.id })}
        className="bg-red-600 hover:bg-red-500 text-white text-sm px-4 py-2 rounded-lg font-medium
                   cursor-pointer transition-all duration-200"
      >
        {t.connect.switchTo} {TARGET_CHAIN.name}
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        aria-expanded={dropdownOpen}
        className="glass text-gray-300 text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-lg font-mono cursor-pointer
                   transition-all duration-200 hover:border-white/15 flex items-center gap-2"
      >
        <span className="hidden sm:inline text-xs text-[#FF9900]">{TARGET_CHAIN.name}</span>
        <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a2332] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Full address */}
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Wallet</p>
            <p className="text-xs text-gray-300 font-mono break-all leading-relaxed">{address}</p>
          </div>

          {/* Chain info */}
          <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-gray-300">{chain?.name ?? TARGET_CHAIN.name}</span>
          </div>

          {/* Actions */}
          <div className="p-2 flex flex-col gap-1">
            <button
              onClick={copyAddress}
              className="w-full text-left text-xs text-gray-300 hover:text-white hover:bg-white/5
                         px-3 py-2 rounded-lg transition-colors duration-150 cursor-pointer"
            >
              {copied ? 'Copied!' : 'Copy address'}
            </button>
            <button
              onClick={() => { disconnect(); setDropdownOpen(false); }}
              className="w-full text-left text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10
                         px-3 py-2 rounded-lg transition-colors duration-150 cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
