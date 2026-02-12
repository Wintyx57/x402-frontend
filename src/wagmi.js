import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base, baseSepolia, skaleEuropa } from '@reown/appkit/networks';

// Re-export for ConnectButton chain comparison (uses .id as number)
export { skaleEuropa };

const projectId = '3a8170b8cda23c42664370d9764bffd2';

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
});

export const config = wagmiAdapter.wagmiConfig;
