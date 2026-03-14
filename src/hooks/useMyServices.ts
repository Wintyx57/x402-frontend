import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { API_URL } from '../config';

export interface Service {
  id: string;
  name: string;
  url: string;
  description: string;
  price_usdc: number;
  owner_address: string;
  tags: string[];
  status: string;
  last_checked_at: string | null;
  created_at: string;
  required_parameters: any;
}

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
