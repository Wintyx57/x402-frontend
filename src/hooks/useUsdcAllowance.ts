import { useReadContract } from 'wagmi';
import { erc20Abi } from 'viem';
import { USDC_BASE } from '../lib/bridge-config';

/**
 * Read the USDC allowance granted by `owner` to `spender` on Base (chainId 8453).
 * Used to check if the Trails Router already has sufficient approval for bridging.
 */
export function useUsdcAllowance(
  owner: `0x${string}` | undefined,
  spender: `0x${string}`,
) {
  return useReadContract({
    address: USDC_BASE,
    abi: erc20Abi,
    functionName: 'allowance',
    args: owner && spender ? [owner, spender] : undefined,
    chainId: 8453,
    query: {
      enabled: !!owner,
      refetchInterval: 10_000,
    },
  });
}
