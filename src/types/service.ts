export interface Service {
  id: string;
  name: string;
  description: string;
  url: string;
  price_usdc: number | string;
  tags?: string[];
  owner_address?: string;
  tx_hash?: string;
  created_at?: string;
  verified_status?: string;
  required_parameters?: { required?: string[]; properties?: Record<string, unknown> } | null;
  status?: 'online' | 'offline' | 'degraded' | 'unknown';
  last_checked_at?: string;
  trust_score?: number | null;
  trust_score_updated_at?: string | null;
  logo_url?: string | null;
}
