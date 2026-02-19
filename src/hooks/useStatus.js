import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../config';

async function fetchStatus() {
  const res = await fetch(`${API_URL}/api/status`);
  if (!res.ok) throw new Error(`Failed to fetch status (${res.status})`);
  return res.json();
}

export function useStatus(options = {}) {
  return useQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // auto-refresh every 30s
    ...options,
  });
}
