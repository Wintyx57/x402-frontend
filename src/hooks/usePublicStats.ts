import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { API_URL } from '../config';

export interface PublicStats {
  services?: number;
  nativeEndpoints?: number;
  apiCalls?: number;
  recentCallCount24h?: number;
  totalPayments?: number;
  totalPayments24h?: number;
  uptime?: number;
  [key: string]: any;
}

async function fetchPublicStats(): Promise<PublicStats> {
  const res = await fetch(`${API_URL}/api/public-stats`);
  if (!res.ok) throw new Error(`Failed to fetch stats (${res.status})`);
  return res.json();
}

export function usePublicStats(options: Omit<UseQueryOptions<PublicStats>, 'queryKey' | 'queryFn'> = {}) {
  return useQuery({
    queryKey: ['publicStats'],
    queryFn: fetchPublicStats,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}
