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
}
