import { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import type { AdminFetch, StatsData, AnalyticsData, RevenueOverview, ERC8004Status, ERC8004PushResult, UsageMetrics } from '../../types/admin';
import { txExplorerUrl } from '../../types/admin';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const CHART_COLORS = {
  orange: '#FF9900',
  orangeAlpha: 'rgba(255, 153, 0, 0.15)',
  blue: '#3B82F6',
  blueAlpha: 'rgba(59, 130, 246, 0.1)',
  green: '#34D399',
  purple: '#A78BFA',
  yellow: '#FBBF24',
  red: '#EF4444',
  grid: 'rgba(255,255,255,0.04)',
  text: '#6B7280',
};

const CHART_TOOLTIP = {
  backgroundColor: '#1a1f2e',
  borderColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1,
  titleColor: '#fff',
  bodyColor: '#9CA3AF',
  cornerRadius: 8,
  padding: 10,
  titleFont: { size: 12, weight: 'bold' as const },
  bodyFont: { size: 11 },
};

function StatCard({ label, value, sub, color, trend }: { label: string; value: string; sub?: string; color: string; trend?: number }) {
  return (
    <div className="bg-[#111827] border border-white/[0.06] rounded-xl p-5 hover:border-white/10 transition-colors">
      <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        {trend !== undefined && trend !== 0 && (
          <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${
            trend > 0
              ? 'text-green-400 bg-green-500/10'
              : 'text-red-400 bg-red-500/10'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      {sub && <p className="text-[11px] text-gray-600 mt-1.5">{sub}</p>}
      <div className="w-8 h-0.5 rounded-full mt-3" style={{ backgroundColor: color, opacity: 0.5 }} />
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

export default function OverviewTab({ adminFetch }: { adminFetch: AdminFetch }) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [revenue, setRevenue] = useState<RevenueOverview | null>(null);
  const [erc8004, setErc8004] = useState<ERC8004Status | null>(null);
  const [usage, setUsage] = useState<UsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletRefreshing, setWalletRefreshing] = useState(false);
  const [walletTimestamp, setWalletTimestamp] = useState<string | null>(null);
  const [pushingErc, setPushingErc] = useState(false);
  const [pushResult, setPushResult] = useState<string | null>(null);
  const [pushDetails, setPushDetails] = useState<ERC8004PushResult | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, a, r, e, u] = await Promise.all([
        adminFetch<StatsData>('/api/stats'),
        adminFetch<AnalyticsData>('/api/analytics'),
        adminFetch<RevenueOverview>('/api/admin/revenue').catch(() => null),
        adminFetch<ERC8004Status>('/api/admin/erc8004/status').catch(() => null),
        adminFetch<UsageMetrics>('/api/admin/usage').catch(() => null),
      ]);
      setStats(s);
      setAnalytics(a);
      setRevenue(r);
      setErc8004(e);
      setUsage(u);
      if (s?.agentWallet?.timestamp) setWalletTimestamp(s.agentWallet.timestamp);
    } catch (e) {
      if ((e as Error).message !== 'Unauthorized') setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading && !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-[#111827] rounded-xl border border-white/[0.06]" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-72 bg-[#111827] rounded-xl border border-white/[0.06]" />
          <div className="h-72 bg-[#111827] rounded-xl border border-white/[0.06]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#111827] rounded-xl p-5 border border-red-500/20">
        <p className="text-sm text-red-400">{error}</p>
        <button onClick={fetchData} className="mt-3 text-xs text-[#FF9900] hover:underline">Reessayer</button>
      </div>
    );
  }

  const totalRevenue = analytics?.totals?.revenue ?? stats?.totalRevenue ?? 0;
  const totalTx = analytics?.totals?.transactions ?? stats?.totalPayments ?? 0;
  const walletBalance = stats?.walletBalance ?? analytics?.walletBalance ?? 0;
  const avgPrice = analytics?.avgPrice ?? 0;
  const platformFees = revenue?.platform_fees_usdc ?? totalRevenue * 0.05;
  const pendingPayouts = revenue?.pending_usdc ?? 0;

  return (
    <div className="space-y-6">
      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Revenue total"
          value={`$${Number(totalRevenue).toFixed(2)}`}
          sub="USDC encaisse"
          color={CHART_COLORS.green}
          trend={usage?.growth_rate_percent}
        />
        <StatCard
          label="Transactions"
          value={totalTx.toLocaleString()}
          sub="paiements on-chain"
          color={CHART_COLORS.blue}
        />
        <StatCard
          label="Services actifs"
          value={(analytics?.totals?.services ?? stats?.totalServices ?? 0).toLocaleString()}
          sub={usage ? `+${usage.new_services_this_week} cette semaine` : undefined}
          color={CHART_COLORS.orange}
        />
        <StatCard
          label="Wallets uniques"
          value={usage ? usage.unique_wallets.toLocaleString() : '—'}
          sub="utilisateurs distincts"
          color={CHART_COLORS.purple}
        />
      </div>

      {/* Usage Row */}
      {usage && (
        <div className="bg-[#111827] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Utilisation</h3>
            <span className={`text-xs px-2 py-0.5 rounded-md ${
              usage.success_rate_percent >= 95
                ? 'bg-green-500/10 text-green-400'
                : usage.success_rate_percent >= 80
                ? 'bg-yellow-500/10 text-yellow-400'
                : 'bg-red-500/10 text-red-400'
            }`}>
              {usage.success_rate_percent}% succes
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
            <MiniStat label="Aujourd'hui" value={usage.calls_today.toLocaleString()} color="#fff" />
            <MiniStat label="Cette semaine" value={usage.calls_this_week.toLocaleString()} color="#fff" />
            <MiniStat label="Ce mois" value={usage.calls_this_month.toLocaleString()} color="#fff" />
            <MiniStat label="Total" value={usage.calls_all_time.toLocaleString()} color="#fff" />
            <MiniStat label="Erreurs (7j)" value={usage.errors_this_week} color={usage.errors_this_week > 0 ? CHART_COLORS.red : CHART_COLORS.green} />
          </div>

          {/* Hourly distribution sparkline */}
          {usage.hourly_distribution && (
            <div className="mt-5 pt-4 border-t border-white/5">
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Distribution horaire (7j, UTC)</p>
              <div className="flex items-end gap-[2px] h-10">
                {usage.hourly_distribution.map((count, hour) => {
                  const max = Math.max(...usage.hourly_distribution, 1);
                  const h = Math.max((count / max) * 100, 2);
                  return (
                    <div
                      key={hour}
                      className="flex-1 rounded-t-sm bg-[#FF9900]/30 hover:bg-[#FF9900]/60 transition-colors"
                      style={{ height: `${h}%` }}
                      title={`${hour}h: ${count} appels`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] text-gray-600 mt-1">
                <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Wallets */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Platform Wallet */}
        {stats && (
          <div className="bg-[#111827] border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF9900]/20 to-[#FF6600]/20 flex items-center justify-center border border-[#FF9900]/10">
                <svg className="w-4 h-4 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 6v3" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Wallet Plateforme</p>
                <p className="text-xs font-mono text-gray-400 truncate">{stats.walletFull || stats.wallet}</p>
              </div>
              <a
                href={`${stats.explorer}/address/${stats.walletFull || stats.wallet}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-gray-600 hover:text-[#FF9900] transition-colors shrink-0"
              >
                Explorer
              </a>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{Number(walletBalance).toFixed(4)}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">USDC</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 border border-green-500/10">
                {stats.network}
              </span>
            </div>
          </div>
        )}

        {/* Agent Wallet */}
        {stats?.agentWallet && (
          <div className="bg-[#111827] border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/10">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Wallet Agent</p>
                  <p className="text-[10px] font-mono text-gray-600">{stats.agentWallet.address_full}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {walletTimestamp && (
                  <span className="text-[10px] text-gray-700">
                    {(() => {
                      const ago = Math.round((Date.now() - new Date(walletTimestamp).getTime()) / 60000);
                      return ago < 1 ? 'maintenant' : `${ago}min`;
                    })()}
                  </span>
                )}
                <button
                  onClick={async () => {
                    setWalletRefreshing(true);
                    try {
                      const w = await adminFetch<StatsData['agentWallet']>('/api/admin/agent-wallet');
                      if (w && stats) {
                        setStats({ ...stats, agentWallet: w });
                        setWalletTimestamp(w.timestamp);
                      }
                    } catch { /* ignore */ } finally { setWalletRefreshing(false); }
                  }}
                  disabled={walletRefreshing}
                  className="text-xs text-gray-600 hover:text-[#FF9900] transition-colors disabled:opacity-50"
                >
                  {walletRefreshing ? (
                    <div className="w-3.5 h-3.5 border border-[#FF9900]/30 border-t-[#FF9900] rounded-full animate-spin" />
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3">
                <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">SKALE</p>
                <p className="text-sm font-bold text-white">{stats.agentWallet.skale.usdc.toFixed(2)}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{stats.agentWallet.skale.credits.toFixed(1)} CR</p>
              </div>
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3">
                <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Base</p>
                <p className="text-sm font-bold text-white">{stats.agentWallet.base.usdc.toFixed(2)}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{stats.agentWallet.base.eth.toFixed(5)} ETH</p>
              </div>
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3">
                <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Polygon</p>
                <p className="text-sm font-bold text-white">{stats.agentWallet.polygon.usdc.toFixed(2)}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{stats.agentWallet.polygon.pol.toFixed(3)} POL</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <span className="text-[10px] text-gray-600">Total 3 chains</span>
              <span className="text-sm font-bold text-[#FF9900]">${stats.agentWallet.total_usdc.toFixed(4)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Frais plateforme" value={`$${Number(platformFees).toFixed(4)}`} sub="5% commission" color={CHART_COLORS.purple} />
        <StatCard label="Payouts en attente" value={`$${Number(pendingPayouts).toFixed(4)}`} sub="a distribuer" color={CHART_COLORS.yellow} />
        <StatCard label="Prix moyen/appel" value={avgPrice > 0 ? `$${Number(avgPrice).toFixed(4)}` : '--'} sub="USDC par call" color={CHART_COLORS.blue} />
        <StatCard
          label="Taux de succes"
          value={usage ? `${usage.success_rate_percent}%` : '--'}
          sub={usage ? `${usage.errors_this_week} erreurs cette semaine` : undefined}
          color={usage && usage.success_rate_percent >= 95 ? CHART_COLORS.green : CHART_COLORS.red}
        />
      </div>

      {/* Charts */}
      {analytics && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Daily Volume - 30 days */}
          <div className="bg-[#111827] border border-white/[0.06] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1">Volume journalier</h3>
            <p className="text-[10px] text-gray-600 mb-4">30 derniers jours</p>
            <div className="h-[220px]">
              <Bar
                data={{
                  labels: analytics.dailyVolume.slice(-30).map(d => {
                    const dt = new Date(d.date);
                    return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
                  }),
                  datasets: [{
                    label: 'Volume USDC',
                    data: analytics.dailyVolume.slice(-30).map(d => d.total),
                    backgroundColor: analytics.dailyVolume.slice(-30).map(d => d.total > 0 ? CHART_COLORS.orange : 'rgba(255,255,255,0.02)'),
                    borderColor: analytics.dailyVolume.slice(-30).map(d => d.total > 0 ? CHART_COLORS.orange : 'transparent'),
                    borderWidth: 1,
                    borderRadius: 3,
                    borderSkipped: false,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      ...CHART_TOOLTIP,
                      callbacks: { label: (ctx) => `$${(ctx.parsed.y ?? 0).toFixed(4)} USDC` },
                    },
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { color: CHART_COLORS.text, font: { size: 9 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 10 },
                    },
                    y: {
                      grid: { color: CHART_COLORS.grid },
                      ticks: { color: CHART_COLORS.text, font: { size: 10 }, callback: (v) => `$${v}` },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Cumulative Revenue */}
          <div className="bg-[#111827] border border-white/[0.06] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1">Revenue cumule</h3>
            <p className="text-[10px] text-gray-600 mb-4">Evolution totale</p>
            <div className="h-[220px]">
              <Line
                data={{
                  labels: analytics.cumulativeRevenue.slice(-30).map(d => {
                    const dt = new Date(d.date);
                    return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
                  }),
                  datasets: [{
                    label: 'Revenue cumule',
                    data: analytics.cumulativeRevenue.slice(-30).map(d => d.total),
                    fill: true,
                    backgroundColor: CHART_COLORS.blueAlpha,
                    borderColor: CHART_COLORS.blue,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHitRadius: 10,
                    tension: 0.3,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      ...CHART_TOOLTIP,
                      callbacks: { label: (ctx) => `$${(ctx.parsed.y ?? 0).toFixed(4)} USDC` },
                    },
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { color: CHART_COLORS.text, font: { size: 9 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 10 },
                    },
                    y: {
                      grid: { color: CHART_COLORS.grid },
                      ticks: { color: CHART_COLORS.text, font: { size: 10 }, callback: (v) => `$${v}` },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Top Endpoints */}
          {analytics.topServices?.length > 0 && (
            <div className="bg-[#111827] border border-white/[0.06] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-1">Top endpoints</h3>
              <p className="text-[10px] text-gray-600 mb-4">Par nombre d'appels</p>
              <div style={{ height: `${Math.max(analytics.topServices.slice(0, 8).length * 30, 180)}px` }}>
                <Bar
                  data={{
                    labels: analytics.topServices.slice(0, 8).map(ep =>
                      ep.endpoint.length > 24 ? ep.endpoint.slice(0, 22) + '..' : ep.endpoint
                    ),
                    datasets: [{
                      label: 'Appels',
                      data: analytics.topServices.slice(0, 8).map(ep => ep.count),
                      backgroundColor: analytics.topServices.slice(0, 8).map((_, i) =>
                        `rgba(255, 153, 0, ${Math.max(0.8 - i * 0.08, 0.15)})`
                      ),
                      borderRadius: 4,
                      borderSkipped: false,
                    }],
                  }}
                  options={{
                    indexAxis: 'y' as const,
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: CHART_TOOLTIP },
                    scales: {
                      x: { grid: { color: CHART_COLORS.grid }, ticks: { color: CHART_COLORS.text, font: { size: 10 } } },
                      y: { grid: { display: false }, ticks: { color: '#D1D5DB', font: { size: 10 } } },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* Revenue by Chain */}
          {revenue?.by_chain && Object.keys(revenue.by_chain).length > 0 && (
            <div className="bg-[#111827] border border-white/[0.06] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-1">Revenue par chain</h3>
              <p className="text-[10px] text-gray-600 mb-4">Distribution</p>
              <div className="h-[200px] flex items-center justify-center">
                <Doughnut
                  data={{
                    labels: Object.keys(revenue.by_chain).map(c => c.charAt(0).toUpperCase() + c.slice(1)),
                    datasets: [{
                      data: Object.values(revenue.by_chain),
                      backgroundColor: [CHART_COLORS.blue, CHART_COLORS.purple, CHART_COLORS.yellow],
                      borderWidth: 0,
                      hoverOffset: 6,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                      legend: { position: 'bottom', labels: { color: '#9CA3AF', font: { size: 11 }, padding: 16, usePointStyle: true, pointStyleWidth: 8 } },
                      tooltip: { ...CHART_TOOLTIP, callbacks: { label: (ctx) => `${ctx.label}: $${Number(ctx.raw).toFixed(4)}` } },
                    },
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ERC-8004 */}
      {erc8004 && (
        <div className="bg-[#111827] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FF9900]/10 flex items-center justify-center border border-[#FF9900]/10">
                <svg className="w-4 h-4 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">ERC-8004 Identity & Reputation</h3>
                <p className="text-[10px] text-gray-600">NFTs on-chain + TrustScore push</p>
              </div>
            </div>
            <button
              onClick={async () => {
                setPushingErc(true);
                setPushResult(null);
                setPushDetails(null);
                try {
                  const res = await adminFetch<ERC8004PushResult>('/api/admin/erc8004/push', { method: 'POST' });
                  setPushDetails(res);
                  if (res.error) {
                    setPushResult(`Erreur: ${res.error}`);
                  } else {
                    const dur = res.duration_ms ? ` (${(res.duration_ms / 1000).toFixed(1)}s)` : '';
                    setPushResult(`${res.pushed}/${res.total} OK, ${res.failed} echoues${dur}`);
                  }
                  const e2 = await adminFetch<ERC8004Status>('/api/admin/erc8004/status').catch(() => null);
                  if (e2) setErc8004(e2);
                } catch (e) {
                  setPushResult(`Erreur: ${(e as Error).message}`);
                } finally { setPushingErc(false); }
              }}
              disabled={pushingErc}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#FF9900]/10 text-[#FF9900] hover:bg-[#FF9900]/20 border border-[#FF9900]/15 transition-colors disabled:opacity-50"
            >
              {pushingErc ? 'Push...' : 'Force Push'}
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3 text-center">
              <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Agent NFTs</p>
              <p className="text-lg font-bold text-white">{erc8004.services.with_agent_id}</p>
            </div>
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3 text-center">
              <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">TrustScore</p>
              <p className="text-lg font-bold text-white">{erc8004.services.with_trust_score}</p>
            </div>
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3 text-center">
              <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Dernier push</p>
              <p className="text-xs font-medium text-white">
                {erc8004.last_push?.timestamp
                  ? new Date(erc8004.last_push.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                  : '--'}
              </p>
            </div>
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3 text-center">
              <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Echoues</p>
              <p className={`text-lg font-bold ${(erc8004.last_push?.failed ?? 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {erc8004.last_push?.failed ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3 text-center">
              <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">CREDITS</p>
              {(() => {
                const bal = erc8004.feedback_wallet?.credits_balance;
                const num = bal ? parseFloat(bal) : null;
                const low = num !== null && num < 0.5;
                return (
                  <p className={`text-lg font-bold ${low ? 'text-yellow-400' : 'text-white'}`}>
                    {num !== null ? num.toFixed(2) : '--'}
                  </p>
                );
              })()}
            </div>
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3 text-center">
              <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Auto-refill</p>
              <div className="flex items-center justify-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${erc8004.auto_refill?.enabled ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-xs text-white">{erc8004.auto_refill?.enabled ? 'On' : 'Off'}</span>
              </div>
            </div>
          </div>

          {/* Status line */}
          <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-white/5 text-[10px]">
            <span className={erc8004.env.AGENT_PRIVATE_KEY ? 'text-green-400/70' : 'text-red-400/70'}>
              Registry {erc8004.env.AGENT_PRIVATE_KEY ? 'OK' : 'Missing'}
            </span>
            <span className={erc8004.env.ERC8004_FEEDBACK_KEY ? 'text-green-400/70' : 'text-red-400/70'}>
              Feedback {erc8004.env.ERC8004_FEEDBACK_KEY ? 'OK' : 'Missing'}
            </span>
            <a href="https://skale-base-explorer.skalenodes.com/address/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#FF9900] transition-colors ml-auto">
              Identity Registry
            </a>
            <a href="https://skale-base-explorer.skalenodes.com/address/0x8004BAa17C55a88189AE136b182e5fdA19dE9b63" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#FF9900] transition-colors">
              Reputation Registry
            </a>
          </div>

          {pushResult && (
            <p className={`text-xs mt-3 ${pushResult.startsWith('Erreur') ? 'text-red-400' : 'text-green-400'}`}>{pushResult}</p>
          )}

          {pushDetails?.failures && pushDetails.failures.length > 0 && (
            <div className="mt-2 max-h-[120px] overflow-y-auto rounded-lg border border-red-500/10 bg-red-500/5">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="text-gray-500 uppercase tracking-wider border-b border-red-500/10">
                    <th className="text-left px-3 py-1.5">Agent ID</th>
                    <th className="text-left px-3 py-1.5">Nom</th>
                    <th className="text-left px-3 py-1.5">Erreur</th>
                  </tr>
                </thead>
                <tbody>
                  {pushDetails.failures.map((f, i) => (
                    <tr key={i} className="border-b border-red-500/5">
                      <td className="px-3 py-1 text-gray-400">{f.agentId}</td>
                      <td className="px-3 py-1 text-white truncate max-w-[120px]">{f.name}</td>
                      <td className="px-3 py-1 text-red-400/80 truncate max-w-[200px]">{f.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Recent Transactions */}
      {analytics?.recentActivity?.length ? (
        <div className="bg-[#111827] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Transactions recentes</h3>
          <div className="space-y-1 max-h-[280px] overflow-y-auto">
            {analytics.recentActivity.slice(0, 10).map((a, i) => {
              const typeColor: Record<string, string> = {
                payment: 'text-blue-400 bg-blue-500/10',
                api_call: 'text-[#FF9900] bg-[#FF9900]/10',
                register: 'text-green-400 bg-green-500/10',
                '402': 'text-yellow-400 bg-yellow-500/10',
                error: 'text-red-400 bg-red-500/10',
              };
              const cls = typeColor[a.type] || 'text-gray-400 bg-gray-500/10';
              return (
                <div key={i} className="flex items-center gap-3 text-xs py-2 px-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <span className={`text-[10px] font-medium uppercase px-1.5 py-0.5 rounded ${cls}`}>{a.type}</span>
                  <span className="text-gray-400 truncate flex-1 text-[11px]">{a.detail?.slice(0, 60)}</span>
                  {a.amount > 0 && <span className="text-blue-300 font-mono text-[11px] shrink-0">${Number(a.amount).toFixed(4)}</span>}
                  {a.txHash && (
                    <a href={txExplorerUrl(a.txHash, a.chain)} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#FF9900] shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  )}
                  <span className="text-gray-700 shrink-0 text-[10px] w-12 text-right">
                    {a.time ? new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
