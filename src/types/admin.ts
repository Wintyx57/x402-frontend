/* ─── Admin Dashboard Types ─── */

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

export type AdminFetch = <T = unknown>(path: string, options?: RequestInit) => Promise<T>;
