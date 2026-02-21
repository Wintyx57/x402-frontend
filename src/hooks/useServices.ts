import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { API_URL } from '../config';

async function fetchServices() {
  const res = await fetch(`${API_URL}/api/services`);
  if (!res.ok) throw new Error(`Failed to fetch services (${res.status})`);
  return res.json();
}

export function useServices(options: Omit<UseQueryOptions, 'queryKey' | 'queryFn'> = {}) {
  return useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}
