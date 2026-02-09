export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Chain configuration map (chainId -> config)
export const CHAIN_CONFIG = {
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
  // SKALE Europa Hub
  2046399126: {
    key: 'skale',
    label: 'SKALE Europa',
    rpcUrl: 'https://mainnet.skalenodes.com/v1/elated-tan-skat',
    usdcContract: '0x5F795bb52dAc3085f578f4877D450e2929D2F13d',
    explorer: 'https://elated-tan-skat.explorer.mainnet.skalenodes.com',
    gas: 'FREE',
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
];
