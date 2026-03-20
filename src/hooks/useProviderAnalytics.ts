import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { API_URL } from '../config';

export interface ServiceStat {
  service_id: string;
  service_name: string;
  earned: number;
  calls: number;
  price_usdc?: number;
  status?: string;
  trust_score?: number;
}

export interface RecentEarning {
  service_name: string;
  amount: number;
  chain: string;
  created_at: string;
}

export interface DailyRevenue {
  date: string;
  amount: number;
  count: number;
}

export interface ServiceInfo {
  id: string;
  name: string;
  url: string;
  description?: string;
  price_usdc: number;
  status: string;
  last_checked_at: string | null;
  trust_score: number | null;
  created_at: string;
  tags?: string[];
  owner_address: string;
  required_parameters?: any;
  quick_registered?: boolean;
}

export interface ProviderAnalytics {
  total_earned: number;
  total_calls: number;
  active_services: number;
  avg_uptime: number | null;
  by_service: ServiceStat[];
  by_chain: Record<string, number>;
  daily_revenue: DailyRevenue[];
  recent_earnings: RecentEarning[];
  payouts_summary: {
    pending_total: number;
    paid_total: number;
    pending_count: number;
    paid_count: number;
  };
  services: ServiceInfo[];
}

export function useProviderAnalytics() {
  const { address, isConnected } = useAccount();

  return useQuery<ProviderAnalytics>({
    queryKey: ['providerAnalytics', address],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/provider/${address}/analytics`);
      if (!res.ok) throw new Error(`Failed to fetch analytics (${res.status})`);
      return res.json();
    },
    enabled: isConnected && !!address,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
