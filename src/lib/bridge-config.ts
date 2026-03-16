import { encodeFunctionData } from 'viem';
import { TRAILS_ROUTER_PLACEHOLDER_AMOUNT } from '0xtrails';

// USDC contracts
export const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
export const USDC_POLYGON = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' as const;

// Trails Router — spender for USDC approval on same-chain-same-token flows (Base → SKALE)
export const TRAILS_ROUTER_ADDRESS = '0xF8A739B9F24E297a98b7aba7A9cdFDBD457F6fF8' as const;

// SKALE IMA Bridge DepositBoxERC20 on Base
export const IMA_DEPOSIT_BOX = '0x7f54e52D08C911eAbB4fDF00Ad36ccf07F867F61' as const;
const SKALE_CHAIN_NAME = 'winged-bubbly-grumium';

const depositBoxErc20Abi = [
  {
    type: 'function' as const,
    name: 'depositERC20Direct' as const,
    stateMutability: 'nonpayable' as const,
    inputs: [
      { name: 'schainName', type: 'string' as const },
      { name: 'erc20OnMainnet', type: 'address' as const },
      { name: 'amount', type: 'uint256' as const },
      { name: 'receiver', type: 'address' as const },
    ],
    outputs: [],
  },
] as const;

// Source chains — auto-detected from wallet
export const SOURCE_CHAINS = [
  { id: 1, name: 'Ethereum', color: 'bg-slate-400', gas: '~$2-5' },
  { id: 8453, name: 'Base', color: 'bg-blue-500', gas: '~$0.001' },
  { id: 137, name: 'Polygon', color: 'bg-purple-500', gas: '~$0.001' },
  { id: 10, name: 'Optimism', color: 'bg-red-500', gas: '~$0.001' },
  { id: 42161, name: 'Arbitrum', color: 'bg-cyan-500', gas: '~$0.001' },
];

export type DestKey = 'base' | 'skale' | 'polygon';

// Destination chains — 3 visual cards
export const DEST_CHAINS: { id: number; key: DestKey; name: string; color: string; time: string; gas: string }[] = [
  { id: 8453, key: 'base', name: 'Base', color: 'bg-blue-500', time: '~10-30s', gas: '~$0.001' },
  { id: 1187947933, key: 'skale', name: 'SKALE on Base', color: 'bg-green-500', time: '~15-45s', gas: '~$0.0007' },
  { id: 137, key: 'polygon', name: 'Polygon', color: 'bg-purple-500', time: '~10-30s', gas: '~$0.001' },
];

// Encode SKALE IMA bridge calldata
export function encodeDepositERC20Direct(receiver: `0x${string}`) {
  return encodeFunctionData({
    abi: depositBoxErc20Abi,
    functionName: 'depositERC20Direct',
    args: [SKALE_CHAIN_NAME, USDC_BASE, TRAILS_ROUTER_PLACEHOLDER_AMOUNT, receiver],
  });
}

// Trails widget config per destination
export function getDestinationConfig(dest: DestKey, recipient: `0x${string}`) {
  switch (dest) {
    case 'base':
      return { toChainId: 8453, toToken: USDC_BASE, toAddress: recipient, toCalldata: undefined };
    case 'skale':
      return { toChainId: 8453, toToken: USDC_BASE, toAddress: IMA_DEPOSIT_BOX, toCalldata: encodeDepositERC20Direct(recipient) };
    case 'polygon':
      return { toChainId: 137, toToken: USDC_POLYGON, toAddress: recipient, toCalldata: undefined };
  }
}

// USDC contract addresses per source chain (all 6 decimals)
export const SOURCE_USDC: Record<number, `0x${string}`> = {
  1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',     // Ethereum
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',   // Base
  137: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',    // Polygon
  10: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',     // Optimism
  42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',  // Arbitrum
};

export function getSourceUsdcAddress(chainId: number): `0x${string}` | undefined {
  return SOURCE_USDC[chainId];
}

// Chain image URL from Sequence CDN
export function chainImageUrl(chainId: number): string | null {
  // SKALE on Base is not in the Sequence CDN
  if (chainId === 1187947933) return null;
  return `https://assets.sequence.info/images/networks/large/${chainId}.webp`;
}

// Find source chain info by ID
export function getSourceChainName(chainId: number | undefined): string {
  if (!chainId) return 'Unknown';
  const found = SOURCE_CHAINS.find((c) => c.id === chainId);
  return found?.name || `Chain ${chainId}`;
}
