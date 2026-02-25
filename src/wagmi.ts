import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';
import {
  metaMaskWallet,
  coinbaseWallet,
  trustWallet,
  rainbowWallet,
  walletConnectWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import type { Chain } from 'wagmi/chains';

// SKALE Europa custom chain definition
export const skaleEuropa: Chain = {
  id: 2046399126,
  name: 'SKALE Europa',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.skalenodes.com/v1/elated-tan-skat'] },
  },
  blockExplorers: {
    default: { name: 'SKALE Explorer', url: 'https://elated-tan-skat.explorer.mainnet.skalenodes.com' },
  },
};

export const config = getDefaultConfig({
  appName: 'x402 Bazaar',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
  chains: [base, baseSepolia, skaleEuropa],
  ssr: false,
  wallets: [
    {
      groupName: 'Popular',
      wallets: [
        injectedWallet,
        metaMaskWallet,
        coinbaseWallet,
        trustWallet,
        rainbowWallet,
      ],
    },
    {
      groupName: 'Other',
      wallets: [
        walletConnectWallet,
      ],
    },
  ],
});
