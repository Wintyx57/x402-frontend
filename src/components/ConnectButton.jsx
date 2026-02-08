import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { useTranslation } from '../i18n/LanguageContext';

const TARGET_CHAIN = import.meta.env.VITE_NETWORK === 'mainnet' ? base : baseSepolia;

export default function ConnectButton() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { t } = useTranslation();

  if (!isConnected) {
    return (
      <button
        onClick={() => connect({ connector: connectors[0] })}
        className="gradient-btn text-white text-sm px-4 py-2 rounded-lg font-medium cursor-pointer
                   transition-all duration-200 hover:brightness-110"
      >
        {t.connect.connectWallet}
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
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline text-xs text-[#FF9900] bg-[#FF9900]/10 px-2.5 py-1 rounded border border-[#FF9900]/20">
        {TARGET_CHAIN.name}
      </span>
      <button
        onClick={() => disconnect()}
        className="glass text-gray-300 text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-lg font-mono cursor-pointer
                   transition-all duration-200 hover:border-white/15"
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </button>
    </div>
  );
}
