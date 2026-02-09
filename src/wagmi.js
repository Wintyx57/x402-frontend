import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { injected, coinbaseWallet } from 'wagmi/connectors';

// SKALE Europa Hub - custom chain definition
export const skaleEuropa = {
  id: 2046399126,
  name: 'SKALE Europa',
  nativeCurrency: {
    name: 'sFUEL',
    symbol: 'sFUEL',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://mainnet.skalenodes.com/v1/elated-tan-skat'] },
  },
  blockExplorers: {
    default: { name: 'SKALE Explorer', url: 'https://elated-tan-skat.explorer.mainnet.skalenodes.com' },
  },
};

export const config = createConfig({
  chains: [base, baseSepolia, skaleEuropa],
  connectors: [
    injected(),
    coinbaseWallet({ appName: 'x402 Bazaar' }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [skaleEuropa.id]: http('https://mainnet.skalenodes.com/v1/elated-tan-skat'),
  },
});
