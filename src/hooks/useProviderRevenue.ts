import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { API_URL } from '../config';

export interface ProviderRevenue {
  total_earned: number;
  total_calls: number;
  by_service: Array<{ service_id: string; service_name: string; earned: number; calls: number }>;
  by_chain: Record<string, number>;
}

export function useProviderRevenue() {
    const { address, isConnected } = useAccount();

    return useQuery<ProviderRevenue>({
        queryKey: ['providerRevenue', address],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/api/provider/${address}/revenue`);
            if (!res.ok) throw new Error(`Failed to fetch revenue (${res.status})`);
            return res.json();
        },
        enabled: isConnected && !!address,
        staleTime: 2 * 60_000,
    });
}
