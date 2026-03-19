/* ─── Admin Dashboard Types ─── */

export interface AgentWalletBalances {
  address: string;
  address_full: string;
  skale: { credits: number; usdc: number };
  base: { usdc: number; eth: number };
  polygon: { usdc: number; pol: number };
  total_usdc: number;
  timestamp: string;
}

export interface StatsData {
  totalServices: number;
  totalPayments: number;
  totalRevenue: number;
  walletBalance: number;
  walletFull: string;
  wallet: string;
  network: string;
  explorer: string;
  usdcContract: string;
  agentWallet?: AgentWalletBalances;
}

export interface AnalyticsData {
  dailyVolume: { date: string; total: number; count: number }[];
  topServices: { endpoint: string; count: number }[];
  cumulativeRevenue: { date: string; total: number }[];
  totals: { revenue: number; transactions: number; services: number };
  walletBalance: number;
  walletAddress: string;
  recentActivity: ActivityItem[];
  avgPrice: number;
}

export interface ActivityItem {
  type: string;
  detail: string;
  amount: number;
  time: string;
  txHash?: string;
  chain?: string;
}

export const CHAIN_EXPLORERS: Record<string, string> = {
  base: 'https://basescan.org',
  skale: 'https://skale-base-explorer.skalenodes.com',
  polygon: 'https://polygonscan.com',
};

export function txExplorerUrl(txHash: string, chain?: string): string {
  return `${CHAIN_EXPLORERS[chain || 'base'] || CHAIN_EXPLORERS.base}/tx/${txHash}`;
}

export function addressExplorerUrl(address: string, chain?: string): string {
  return `${CHAIN_EXPLORERS[chain || 'base'] || CHAIN_EXPLORERS.base}/address/${address}`;
}

export interface RevenueOverview {
  total_revenue_usdc: number;
  platform_fees_usdc: number;
  provider_payouts_usdc: number;
  pending_usdc: number;
  by_status?: Record<string, number>;
  by_chain?: Record<string, number>;
  error?: string;
}

export interface PendingPayout {
  id: string;
  wallet: string;
  service_name: string;
  amount_usdc: number;
  platform_fee_usdc: number;
  chain: string;
  tx_hash_in: string;
  status: string;
  created_at: string;
}

export interface PayoutsResponse {
  count: number;
  providers: {
    wallet: string;
    total_due: number;
    total_fees: number;
    count: number;
    payouts: PendingPayout[];
  }[];
  error?: string;
}

export interface FeeSplitterData {
  configured: boolean;
  message?: string;
  contract?: string;
  pending_usdc?: string;
  preview_1usdc?: { provider: string; platform: string };
}

export interface TrustScoreService {
  id: string;
  name: string;
  url: string;
  trust_score: number;
  trust_score_updated_at: string;
  status: string;
  price_usdc: number;
}

export interface TrustBreakdown {
  service_id: string;
  service_name: string;
  trust_score: number;
  breakdown: {
    success_rate: number;
    latency_score: number;
    review_score: number;
    volume_score: number;
  };
}

export interface DailyTesterStatus {
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  balance?: number;
  results?: DailyTesterResult[];
}

export interface DailyTesterResult {
  service_name: string;
  result: 'pass' | 'partial' | 'fail';
  error?: string;
  duration_ms?: number;
  chain?: string;
  txHash?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  url: string;
  description?: string;
  price_usdc: number;
  status: string;
  trust_score?: number;
  verified_status?: string;
  owner_wallet?: string;
  quick_registered?: boolean;
  tags?: string[];
  last_checked_at?: string;
  created_at?: string;
}

export interface BudgetItem {
  wallet: string;
  max_budget_usdc: number;
  spent_usdc: number;
  remaining_usdc: number;
  used_percent: number;
  period: string;
  period_start?: string;
  alerts_triggered?: string[];
}

/* ─── ERC-8004 Types ─── */

export interface ERC8004Status {
  feedback_wallet: { address: string; credits_balance: string | null; configured: boolean } | null;
  last_push: {
    pushed?: number; failed?: number; total?: number;
    timestamp?: string; duration_ms?: number; error?: string;
  } | null;
  auto_refill: { enabled: boolean; threshold_credits: string; refill_amount_credits: string };
  services: { with_agent_id: number; with_trust_score: number };
  env: { AGENT_PRIVATE_KEY: boolean; ERC8004_FEEDBACK_KEY: boolean };
}

export interface ERC8004PushResult {
  success: boolean; pushed: number; failed: number; total: number;
  duration_ms: number;
  failures?: { agentId: number; name: string; error: string }[];
  error?: string;
}

/* ─── Trust Diagnostic ─── */

export interface TrustDiagnostic {
  monitoring_checks: { total_rows: number; unique_endpoints: number };
  daily_checks: { total_rows: number };
  sample_monitoring: { endpoint: string; status: string; latency: number; checked_at: string }[];
  sample_daily: { endpoint: string; overall_status: string; call_latency_ms: number; checked_at: string }[];
  sample_services: { id: string; path: string; trust_score: number | null; erc8004_agent_id: number | null }[];
  cutoff_date: string;
}

/* ─── System Health ─── */

export interface HealthCheck {
  status: string; latency_ms?: number; block_number?: number; url?: string; error?: string;
  configured?: boolean; initialized?: boolean; contract?: string;
  pending_usdc?: string; feedback_wallet_configured?: boolean;
  push_in_progress?: boolean; services_with_agent_id?: number;
}

export interface SystemHealth {
  status: 'ok' | 'degraded'; timestamp: string; version: string;
  uptime_seconds: number; checks: Record<string, HealthCheck>;
}

/* ─── Usage Metrics ─── */

export interface UsageMetrics {
  calls_today: number;
  calls_this_week: number;
  calls_this_month: number;
  calls_all_time: number;
  unique_wallets: number;
  growth_rate_percent: number;
  success_rate_percent: number;
  errors_this_week: number;
  new_services_this_week: number;
  hourly_distribution: number[];
}

export type AdminFetch = <T = unknown>(path: string, options?: RequestInit) => Promise<T>;
