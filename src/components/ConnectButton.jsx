import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

const TARGET_CHAIN = import.meta.env.VITE_NETWORK === 'mainnet' ? base : baseSepolia;

export default function ConnectButton() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  if (!isConnected) {
    return (
      <button
        onClick={() => connect({ connector: connectors[0] })}
        className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors"
      >
        Connect Wallet
      </button>
    );
  }

  // Wrong network? Prompt switch
  if (chain?.id !== TARGET_CHAIN.id) {
    return (
      <button
        onClick={() => switchChain({ chainId: TARGET_CHAIN.id })}
        className="bg-orange-600 hover:bg-orange-500 text-white text-sm px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors"
      >
        Switch to {TARGET_CHAIN.name}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
        {TARGET_CHAIN.name}
      </span>
      <button
        onClick={() => disconnect()}
        className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-3 py-2 rounded-lg font-mono cursor-pointer transition-colors"
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </button>
    </div>
  );
}
