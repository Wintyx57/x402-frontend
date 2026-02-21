import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { API_URL } from '../config';

async function fetchPublicStats() {
  const res = await fetch(`${API_URL}/api/public-stats`);
  if (!res.ok) throw new Error(`Failed to fetch stats (${res.status})`);
  return res.json();
}

export function usePublicStats(options: Omit<UseQueryOptions, 'queryKey' | 'queryFn'> = {}) {
  return useQuery({
    queryKey: ['publicStats'],
    queryFn: fetchPublicStats,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}
