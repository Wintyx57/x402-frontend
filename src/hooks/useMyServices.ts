import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { API_URL } from '../config';
import type { Service } from '../types/service';
export type { Service } from '../types/service';

export function useMyServices() {
    const { address, isConnected } = useAccount();

    return useQuery<Service[]>({
        queryKey: ['myServices', address],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/api/provider/${address}/services`);
            if (!res.ok) throw new Error(`Failed to fetch services (${res.status})`);
            const data = await res.json();
            return data.services || [];
        },
        enabled: isConnected && !!address,
        staleTime: 60_000,
    });
}
