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

// SKALE Europa custom chain definition
export const skaleEuropa = {
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
  projectId: '2437e069335d816faf9cfca4e2702ddf',
  chains: [base, baseSepolia, skaleEuropa],
  ssr: false,
  wallets: [
    {
      groupName: 'Popular',
      wallets: [
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
        injectedWallet,
      ],
    },
  ],
});
