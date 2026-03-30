import { http, createConfig } from "wagmi";
import {
  base,
  baseSepolia,
  mainnet,
  polygon,
  optimism,
  arbitrum,
} from "wagmi/chains";
import { inAppWalletConnector } from "@thirdweb-dev/wagmi-adapter";
import { thirdwebClient } from "./lib/thirdweb";
import type { Chain } from "wagmi/chains";

// SKALE on Base custom chain definition
export const skaleOnBase: Chain = {
  id: 1187947933,
  name: "SKALE on Base",
  nativeCurrency: { name: "CREDITS", symbol: "CREDITS", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://skale-base.skalenodes.com/v1/base"] },
  },
  blockExplorers: {
    default: {
      name: "SKALE Explorer",
      url: "https://skale-base-explorer.skalenodes.com",
    },
  },
};

const chains = [
  skaleOnBase,
  base,
  baseSepolia,
  mainnet,
  polygon,
  optimism,
  arbitrum,
] as const;

export const config = createConfig({
  chains,
  connectors: [
    inAppWalletConnector({
      client: thirdwebClient,
    }),
  ],
  transports: {
    [skaleOnBase.id]: http("https://skale-base.skalenodes.com/v1/base"),
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
  ssr: false,
});
