import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base, baseSepolia, skaleEuropa } from '@reown/appkit/networks';

// Re-export for ConnectButton chain comparison (uses .id as number)
export { skaleEuropa };

const projectId = '2437e069335d816faf9cfca4e2702ddf';

const networks = [base, baseSepolia, skaleEuropa];

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'x402 Bazaar',
    description: 'The API Marketplace for AI Agents',
    url: 'https://x402bazaar.org',
    icons: ['https://x402bazaar.org/favicon.svg'],
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#FF9900',
  },
  // Featured wallets shown first for faster connection (mobile + desktop)
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e18e4a0ed6f1d63407', // Coinbase Wallet
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
  ],
  // Disable features not needed — reduces bundle + speeds up loading
  features: {
    analytics: false,
    onramp: false,
    swaps: false,
  },
  // Reduce initial wallet list load
  allWallets: 'HIDE',
  // Enable mobile deep linking and WalletConnect
  enableWalletConnect: true,
});

export const config = wagmiAdapter.wagmiConfig;
