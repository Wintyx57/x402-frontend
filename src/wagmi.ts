import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';
import { http, createConfig } from 'wagmi';
import {
  metaMaskWallet,
  coinbaseWallet,
  trustWallet,
  rainbowWallet,
  walletConnectWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
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

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';
const chains = [base, baseSepolia, skaleEuropa] as const;

function buildConfig() {
  // If projectId is available, use RainbowKit's getDefaultConfig (includes WalletConnect)
  if (projectId) {
    return getDefaultConfig({
      appName: 'x402 Bazaar',
      projectId,
      chains,
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
  }

  // Fallback: no WalletConnect projectId — build config without it
  const connectors = connectorsForWallets(
    [
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
    ],
    { appName: 'x402 Bazaar', projectId: 'placeholder' },
  );

  return createConfig({
    connectors,
    chains,
    transports: {
      [base.id]: http(),
      [baseSepolia.id]: http(),
      [skaleEuropa.id]: http('https://mainnet.skalenodes.com/v1/elated-tan-skat'),
    },
    ssr: false,
  });
}

export const config = buildConfig();
