import { useAccount, useDisconnect, useSwitchChain, useChainId } from "wagmi";
import { useUsdcBalance } from "../hooks/useUsdcBalance";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "../i18n/LanguageContext";
import ConnectButton from "./ConnectButton";
import { CHAIN_CONFIG } from "../config";

const NETWORKS = [
  { id: 1187947933, label: "SKALE", color: "#00D395" },
  { id: 8453, label: "Base", color: "#0052FF" },
  { id: 137, label: "Polygon", color: "#8247E5" },
];

export default function WalletInfo() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const currentChainId = useChainId();
  const { balance, isLoading: balanceLoading } = useUsdcBalance();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const currentNetwork = NETWORKS.find((n) => n.id === currentChainId);
  const currentChainConfig = CHAIN_CONFIG[currentChainId];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isConnected || !address) {
    return <ConnectButton />;
  }

  const displayBalance = balanceLoading
    ? "..."
    : balance
      ? parseFloat(balance).toFixed(2)
      : "0.00";
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
        aria-haspopup="menu"
        aria-label={`${t.connect.wallet}: ${displayBalance} USDC — ${shortAddress}`}
        className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg
                   bg-white/8 border border-white/10 text-white hover:bg-white/12
                   transition-colors cursor-pointer"
      >
        {currentNetwork && (
          <>
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: currentNetwork.color }}
            />
            <span className="text-gray-400 text-[10px]">
              {currentNetwork.label}
            </span>
            <span className="text-gray-600">|</span>
          </>
        )}
        <span className="text-[#FF9900] font-semibold">
          {displayBalance} USDC
        </span>
        <span className="text-gray-400">|</span>
        <span>{shortAddress}</span>
        <svg
          className={`w-3 h-3 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {dropdownOpen && (
        <div
          className="absolute right-0 top-full mt-1 min-w-[180px] bg-[#1a1f2e] border border-white/10
                        rounded-lg shadow-xl py-1 z-50 animate-fade-in"
        >
          <Link
            to="/my-apis"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white
                       hover:bg-white/5 no-underline transition-colors"
          >
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            {t.myApis?.title || "My APIs"}
          </Link>
          <Link
            to="/fund"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white
                       hover:bg-white/5 no-underline transition-colors"
          >
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {t.nav.fund}
          </Link>
          <div className="px-3 py-1.5">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
              {t.connect?.network || "Network"}
            </span>
            <div className="flex gap-1 mt-1">
              {NETWORKS.map((net) => (
                <button
                  key={net.id}
                  onClick={() => {
                    switchChain({ chainId: net.id });
                  }}
                  className={`flex-1 py-1 px-1.5 rounded-md text-[10px] font-medium transition-all cursor-pointer border ${
                    currentChainId === net.id
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-transparent bg-white/5 text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full mr-0.5"
                    style={{ backgroundColor: net.color }}
                  />
                  {net.label}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 my-1" />
          <button
            onClick={() => {
              disconnect();
              setDropdownOpen(false);
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300
                       hover:bg-white/5 cursor-pointer bg-transparent border-none text-left transition-colors"
          >
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {t.connect.disconnect}
          </button>
        </div>
      )}
    </div>
  );
}
