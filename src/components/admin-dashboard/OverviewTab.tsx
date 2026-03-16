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
import type { AdminFetch, StatsData, AnalyticsData, RevenueOverview } from '../../types/admin';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const CHART_TOOLTIP = {
  backgroundColor: '#1a2332',
  borderColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  titleColor: '#fff',
  bodyColor: '#9CA3AF',
};

function KPICard({ label, value, sub, icon, color = '#FF9900' }: { label: string; value: string; sub?: string; icon: string; color?: string }) {
  return (
    <div className="glass-card rounded-xl p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
        <span style={{ color }}>{icon}</span>
        {label}
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-gray-500">{sub}</div>}
    </div>
  );
}

export default function OverviewTab({ adminFetch }: { adminFetch: AdminFetch }) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [revenue, setRevenue] = useState<RevenueOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, a, r] = await Promise.all([
        adminFetch<StatsData>('/api/stats'),
        adminFetch<AnalyticsData>('/api/analytics'),
        adminFetch<RevenueOverview>('/api/admin/revenue').catch(() => null),
      ]);
      setStats(s);
      setAnalytics(a);
      setRevenue(r);
    } catch (e) {
      if ((e as Error).message !== 'Unauthorized') setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-xl p-4 border border-red-500/20">
        <p className="text-sm text-red-400">{error}</p>
        <button onClick={fetchData} className="mt-2 text-xs text-[#FF9900] hover:underline">Reessayer</button>
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
      {/* Wallet Card */}
      {stats && (
        <div className="glass-card rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#FF9900]/15 flex items-center justify-center text-lg shrink-0">&#9679;</div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Wallet plateforme</p>
              <p className="text-sm font-mono text-white truncate">{stats.walletFull || stats.wallet}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 mt-1 inline-block">
                {stats.network}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Balance USDC</p>
              <p className="text-2xl font-bold text-white">{Number(walletBalance).toFixed(4)}</p>
            </div>
            <a
              href={`${stats.explorer}/address/${stats.walletFull || stats.wallet}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-[#FF9900] hover:border-[#FF9900]/30 transition-colors"
            >
              BaseScan ↗
            </a>
          </div>
        </div>
      )}

      {/* Agent Wallet (unified) */}
      {stats?.agentWallet && (
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-500/15 flex items-center justify-center text-sm">&#9881;</div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Wallet Agent Unifie</p>
              <p className="text-xs font-mono text-gray-400">{stats.agentWallet.address_full}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {/* SKALE */}
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">SKALE on Base</p>
              <p className="text-lg font-bold text-white">{stats.agentWallet.skale.usdc.toFixed(2)} <span className="text-xs text-gray-400">USDC</span></p>
              <p className="text-xs text-gray-500 mt-1">{stats.agentWallet.skale.credits.toFixed(2)} CREDITS</p>
            </div>
            {/* Base */}
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Base</p>
              <p className="text-lg font-bold text-white">{stats.agentWallet.base.usdc.toFixed(2)} <span className="text-xs text-gray-400">USDC</span></p>
              <p className="text-xs text-gray-500 mt-1">{stats.agentWallet.base.eth.toFixed(6)} ETH</p>
            </div>
            {/* Polygon */}
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Polygon</p>
              <p className="text-lg font-bold text-white">{stats.agentWallet.polygon.usdc.toFixed(2)} <span className="text-xs text-gray-400">USDC</span></p>
              <p className="text-xs text-gray-500 mt-1">{stats.agentWallet.polygon.pol.toFixed(4)} POL</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <span className="text-xs text-gray-500">Total USDC (3 chains)</span>
            <span className="text-sm font-bold text-[#FF9900]">${stats.agentWallet.total_usdc.toFixed(4)}</span>
          </div>
        </div>
      )}

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard label="Revenue brut total" value={`$${Number(totalRevenue).toFixed(4)}`} sub="USDC encaisse" icon="&#9650;" color="#34D399" />
        <KPICard label="Frais plateforme 5%" value={`$${Number(platformFees).toFixed(4)}`} sub="Commissions" icon="&#9733;" color="#A78BFA" />
        <KPICard label="Payouts en attente" value={`$${Number(pendingPayouts).toFixed(4)}`} sub="A distribuer" icon="&#9888;" color="#FBBF24" />
        <KPICard label="Transactions" value={totalTx.toLocaleString()} sub="paiements on-chain" icon="&#9711;" color="#60A5FA" />
        <KPICard label="Services actifs" value={(analytics?.totals?.services ?? stats?.totalServices ?? 0).toLocaleString()} sub="enregistres" icon="&#9632;" color="#FF9900" />
        <KPICard label="Prix moyen/appel" value={avgPrice > 0 ? `$${Number(avgPrice).toFixed(4)}` : '—'} sub="USDC par call" icon="&#8776;" color="#F472B6" />
      </div>

      {/* Charts 2x2 */}
      {analytics && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Daily Volume */}
          {analytics.dailyVolume?.length > 0 && (
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Volume journalier (7j)</h3>
              <div style={{ height: '200px' }}>
                <Bar
                  data={{
                    labels: analytics.dailyVolume.slice(-7).map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })),
                    datasets: [{
                      label: 'Volume USDC',
                      data: analytics.dailyVolume.slice(-7).map(d => d.total),
                      backgroundColor: 'rgba(255, 153, 0, 0.3)',
                      borderColor: '#FF9900',
                      borderWidth: 2,
                      borderRadius: 6,
                      borderSkipped: false,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { ...CHART_TOOLTIP, callbacks: { label: (ctx) => `${ctx.dataset.label}: $${(ctx.parsed.y ?? 0).toFixed(4)}` } } },
                    scales: {
                      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6B7280', font: { size: 11 } } },
                      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6B7280', font: { size: 11 }, callback: (v) => `$${v}` } },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* Cumulative Revenue */}
          {analytics.cumulativeRevenue?.length > 0 && (
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Revenue cumule (14j)</h3>
              <div style={{ height: '200px' }}>
                <Line
                  data={{
                    labels: analytics.cumulativeRevenue.slice(-14).map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })),
                    datasets: [{
                      label: 'Revenue cumule',
                      data: analytics.cumulativeRevenue.slice(-14).map(d => d.total),
                      fill: true,
                      backgroundColor: 'rgba(96, 165, 250, 0.1)',
                      borderColor: '#60A5FA',
                      borderWidth: 2,
                      pointRadius: 3,
                      pointBackgroundColor: '#60A5FA',
                      tension: 0.4,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { ...CHART_TOOLTIP, callbacks: { label: (ctx) => `${ctx.dataset.label}: $${(ctx.parsed.y ?? 0).toFixed(4)}` } } },
                    scales: {
                      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6B7280', font: { size: 11 } } },
                      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6B7280', font: { size: 11 }, callback: (v) => `$${v}` } },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* Top Endpoints */}
          {analytics.topServices?.length > 0 && (
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Top 8 endpoints</h3>
              <div style={{ height: `${Math.max(analytics.topServices.slice(0, 8).length * 32, 200)}px` }}>
                <Bar
                  data={{
                    labels: analytics.topServices.slice(0, 8).map(ep => ep.endpoint.length > 22 ? ep.endpoint.slice(0, 20) + '...' : ep.endpoint),
                    datasets: [{
                      label: 'Appels',
                      data: analytics.topServices.slice(0, 8).map(ep => ep.count),
                      backgroundColor: analytics.topServices.slice(0, 8).map((_, i) => `rgba(255, 153, 0, ${Math.max(1 - i * 0.1, 0.2)})`),
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
                      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6B7280', font: { size: 11 } } },
                      y: { grid: { display: false }, ticks: { color: '#D1D5DB', font: { size: 11 } } },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* Revenue by Chain */}
          {revenue?.by_chain && Object.keys(revenue.by_chain).length > 0 && (
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Revenue par chain</h3>
              <div style={{ height: '200px' }} className="flex items-center justify-center">
                <Doughnut
                  data={{
                    labels: Object.keys(revenue.by_chain).map(c => c.charAt(0).toUpperCase() + c.slice(1)),
                    datasets: [{
                      data: Object.values(revenue.by_chain),
                      backgroundColor: ['#3B82F6', '#A78BFA', '#F59E0B'],
                      borderWidth: 0,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { color: '#9CA3AF', font: { size: 11 }, padding: 16 } },
                      tooltip: { ...CHART_TOOLTIP, callbacks: { label: (ctx) => `${ctx.label}: $${Number(ctx.raw).toFixed(4)}` } },
                    },
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Transactions */}
      {analytics?.recentActivity?.length ? (
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Transactions recentes</h3>
          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {analytics.recentActivity.slice(0, 10).map((a, i) => {
              const typeColor: Record<string, string> = { payment: 'text-blue-400', api_call: 'text-[#FF9900]', register: 'text-green-400', '402': 'text-yellow-400', error: 'text-red-400' };
              return (
                <div key={i} className="flex items-center gap-3 text-xs py-1.5 border-b border-white/5 last:border-0">
                  <span className={`font-semibold uppercase w-16 shrink-0 ${typeColor[a.type] || 'text-gray-400'}`}>{a.type}</span>
                  <span className="text-gray-400 truncate flex-1">{a.detail?.slice(0, 50)}</span>
                  {a.amount > 0 && <span className="text-blue-300 font-semibold shrink-0">+${Number(a.amount).toFixed(4)}</span>}
                  {a.txHash && (
                    <a href={`https://basescan.org/tx/${a.txHash}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#FF9900] shrink-0">↗</a>
                  )}
                  <span className="text-gray-600 shrink-0 w-10 text-right">
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
