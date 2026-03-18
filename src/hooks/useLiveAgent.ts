import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../config';

export interface NasaData {
  title: string;
  explanation: string;
  date: string;
  url: string;
  hdurl: string;
  media_type: string;
  tx_hash: string | null;
  cost: number;
  latency_ms: number;
  error: string | null;
}

export interface IssData {
  position: { lat: number; lon: number } | null;
  crew: { count: number; members: string[] };
  tx_hash: string | null;
  cost: number;
  latency_ms: number;
  error: string | null;
}

export interface SpacexData {
  name: string;
  date_utc: string;
  flight_number: number;
  details: string;
  rocket: string;
  links: { webcast?: string; article?: string; wikipedia?: string; patch?: string } | null;
  tx_hash: string | null;
  cost: number;
  latency_ms: number;
  error: string | null;
}

export interface AgentReport {
  id: string;
  run_at: string;
  status: 'success' | 'partial' | 'failed' | 'no_data';
  nasa: NasaData;
  iss: IssData;
  spacex: SpacexData;
  total_cost: number;
  agent_wallet: string;
  chain: string;
  explorer_base_url: string;
  message?: string;
}

export interface AgentHistoryItem {
  id: string;
  run_at: string;
  status: string;
  nasa_title: string;
  nasa_url: string;
  nasa_date: string;
  iss: { lat: number; lon: number } | null;
  spacex_name: string;
  spacex_date_utc: string;
  total_cost: number;
  tx_count: number;
  agent_wallet: string;
  chain: string;
}

export function useLiveAgent() {
  return useQuery<AgentReport>({
    queryKey: ['live-agent'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/agent-reports/latest`);
      if (!res.ok) throw new Error(`Failed to fetch agent report (${res.status})`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}

export function useLiveAgentHistory(limit = 10) {
  return useQuery<{ reports: AgentHistoryItem[] }>({
    queryKey: ['live-agent-history', limit],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/agent-reports/history?limit=${limit}`);
      if (!res.ok) throw new Error(`Failed to fetch agent history (${res.status})`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
