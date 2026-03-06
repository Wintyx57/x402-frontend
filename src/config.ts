export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

if (import.meta.env.DEV && API_URL.includes('localhost')) {
  console.warn('[x402] API_URL contains localhost. Set VITE_API_URL to the production API URL.');
}

interface ChainConfig {
  key: string;
  label: string;
  rpcUrl: string;
  usdcContract: string;
  explorer: string;
  gas: string;
}

// Chain configuration map (chainId -> config)
export const CHAIN_CONFIG: Record<number, ChainConfig> = {
  // Base Mainnet
  8453: {
    key: 'base',
    label: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    usdcContract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    explorer: 'https://basescan.org',
    gas: '~$0.001',
  },
  // Base Sepolia (testnet)
  84532: {
    key: 'base-sepolia',
    label: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    usdcContract: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    explorer: 'https://sepolia.basescan.org',
    gas: '~$0.001',
  },
  // SKALE on Base
  1187947933: {
    key: 'skale',
    label: 'SKALE on Base',
    rpcUrl: 'https://skale-base.skalenodes.com/v1/base',
    usdcContract: '0x85889c8c714505E0c94b30fcfcF64fE3Ac8FCb20',
    explorer: 'https://skale-base-explorer.skalenodes.com',
    gas: '~$0.0007',
  },
};

// USDC ABI (transfer + balanceOf)
export const USDC_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;
