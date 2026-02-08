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
        className="gradient-btn text-white text-sm px-4 py-2 rounded-xl font-medium cursor-pointer
                   transition-all duration-300 hover:scale-105 hover:glow-blue"
      >
        {t.connect.connectWallet}
      </button>
    );
  }

  if (chain?.id !== TARGET_CHAIN.id) {
    return (
      <button
        onClick={() => switchChain({ chainId: TARGET_CHAIN.id })}
        className="bg-orange-600 hover:bg-orange-500 text-white text-sm px-4 py-2 rounded-xl font-medium
                   cursor-pointer transition-all duration-300 hover:scale-105"
      >
        {t.connect.switchTo} {TARGET_CHAIN.name}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline text-xs text-green-400 glass px-2.5 py-1 rounded-full glow-green">
        {TARGET_CHAIN.name}
      </span>
      <button
        onClick={() => disconnect()}
        className="glass text-gray-300 text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-xl font-mono cursor-pointer
                   transition-all duration-300 hover:glow-blue"
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </button>
    </div>
  );
}
