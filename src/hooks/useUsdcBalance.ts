import { useReadContract, useAccount, useChainId } from 'wagmi';
import { USDC_ABI, CHAIN_CONFIG } from '../config';
import { formatUnits } from 'viem';

export function useUsdcBalance() {
    const { address } = useAccount();
    const chainId = useChainId();
    const chainConfig = CHAIN_CONFIG[chainId];
    const decimals = 6; // All chains use 6-decimal USDC (Base, SKALE, Polygon)

    const { data, isLoading, refetch } = useReadContract({
        address: chainConfig?.usdcContract as `0x${string}` | undefined,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && !!chainConfig,
            refetchInterval: 30_000,
        },
    });

    const balance = data !== undefined ? formatUnits(data as bigint, decimals) : null;

    return { balance, isLoading, refetch };
}
