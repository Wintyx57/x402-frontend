import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler);

import { ADMIN_STORAGE_KEY as STORAGE_KEY } from '../constants/admin';
import useSEO from '../hooks/useSEO';

/* ─── Types ─── */
interface StatsData {
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

interface AnalyticsData {
  dailyVolume: { date: string; total: number; count: number }[];
  topServices: { endpoint: string; count: number }[];
  cumulativeRevenue: { date: string; total: number }[];
  totals: { revenue: number; transactions: number; services: number };
  walletBalance: number;
  walletAddress: string;
  recentActivity: {
    type: string;
    detail: string;
    amount: number;
    time: string;
    txHash?: string;
  }[];
  avgPrice: number;
}

/* ─── Login Modal ─── */
function LoginModal({ onLogin }: { onLogin: (token: string) => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) { setError(true); return; }
    onLogin(value.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <form onSubmit={submit} className="glass-strong rounded-2xl p-8 w-full max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FF9900]/10 flex items-center justify-center text-xl">&#9776;</div>
          <div>
            <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
            <p className="text-xs text-gray-500">x402bazaar.org</p>
          </div>
        </div>
        <input
          type="password"
          value={value}
          onChange={e => { setValue(e.target.value); setError(false); }}
          placeholder="Admin token"
          autoFocus
          className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 mb-4 outline-none focus:border-[#FF9900]/40 transition-colors ${
            error ? 'border-red-500' : 'border-white/10'
          }`}
        />
        {error && <p className="text-xs text-red-400 mb-3">Token requis</p>}
        <button type="submit" className="w-full gradient-btn text-white font-semibold py-3 rounded-lg">
          Acceder
        </button>
      </form>
    </div>
  );
}

/* ─── Stat Card ─── */
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

/* ─── Daily Volume Chart ─── */
function DailyVolumeChart({ data }: { data: { date: string; total: number; count: number }[] }) {
  if (!data?.length) return null;

  const last7 = data.slice(-7);
  const chartData = {
    labels: last7.map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })),
    datasets: [{
      label: 'Volume USDC',
      data: last7.map(d => d.total),
      backgroundColor: 'rgba(255, 153, 0, 0.3)',
      borderColor: '#FF9900',
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a2332',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#9CA3AF',
        callbacks: {
          label: (ctx: { parsed: { y: number }; dataset: { label: string } }) => `${ctx.dataset.label}: $${ctx.parsed.y.toFixed(4)}`,
        },
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6B7280', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6B7280', font: { size: 11 }, callback: (v: number) => `$${v}` } },
    },
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Volume journalier (7j)</h3>
      <div style={{ height: '200px' }}>
        <Bar data={chartData} options={options as Parameters<typeof Bar>[0]['options']} />
      </div>
    </div>
  );
}

/* ─── Cumulative Revenue Chart ─── */
function CumulativeRevenueChart({ data }: { data: { date: string; total: number }[] }) {
  if (!data?.length) return null;

  const last14 = data.slice(-14);
  const chartData = {
    labels: last14.map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })),
    datasets: [{
      label: 'Revenue cumulé',
      data: last14.map(d => d.total),
      fill: true,
      backgroundColor: 'rgba(96, 165, 250, 0.1)',
      borderColor: '#60A5FA',
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: '#60A5FA',
      tension: 0.4,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a2332',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#9CA3AF',
        callbacks: {
          label: (ctx: { parsed: { y: number }; dataset: { label: string } }) => `${ctx.dataset.label}: $${ctx.parsed.y.toFixed(4)}`,
        },
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6B7280', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6B7280', font: { size: 11 }, callback: (v: number) => `$${v}` } },
    },
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Revenue cumulé (14j)</h3>
      <div style={{ height: '200px' }}>
        <Line data={chartData} options={options as Parameters<typeof Line>[0]['options']} />
      </div>
    </div>
  );
}

/* ─── Top Endpoints ─── */
function TopEndpointsChart({ endpoints }: { endpoints: { endpoint: string; count: number }[] }) {
  if (!endpoints?.length) return null;

  const top8 = endpoints.slice(0, 8);
  const chartData = {
    labels: top8.map(ep => ep.endpoint.length > 22 ? ep.endpoint.slice(0, 20) + '…' : ep.endpoint),
    datasets: [{
      label: 'Appels',
      data: top8.map(ep => ep.count),
      backgroundColor: top8.map((_, i) => {
        const alpha = 1 - i * 0.1;
        return `rgba(255, 153, 0, ${Math.max(alpha, 0.2)})`;
      }),
      borderRadius: 4,
      borderSkipped: false,
    }],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a2332',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#9CA3AF',
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6B7280', font: { size: 11 } } },
      y: { grid: { display: false }, ticks: { color: '#D1D5DB', font: { size: 11 } } },
    },
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Top endpoints</h3>
      <div style={{ height: `${Math.max(top8.length * 32, 200)}px` }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

/* ─── Recent Transactions ─── */
function RecentTransactions({ activities }: { activities: AnalyticsData['recentActivity'] }) {
  if (!activities?.length) return null;

  const typeColor: Record<string, string> = {
    payment: 'text-blue-400',
    api_call: 'text-[#FF9900]',
    register: 'text-green-400',
    '402': 'text-yellow-400',
    error: 'text-red-400',
  };
  const typeIcon: Record<string, string> = {
    payment: '💰',
    api_call: '⚡',
    register: '🆕',
    '402': '🔒',
    error: '❌',
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Transactions récentes</h3>
      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
        {activities.map((a, i) => (
          <div key={i} className="flex items-center gap-3 text-xs py-1.5 border-b border-white/5 last:border-0">
            <span className="text-base w-5 shrink-0">{typeIcon[a.type] || '•'}</span>
            <span className={`font-semibold uppercase w-16 shrink-0 ${typeColor[a.type] || 'text-gray-400'}`}>
              {a.type}
            </span>
            <span className="text-gray-400 truncate flex-1">{a.detail?.slice(0, 45)}</span>
            {a.amount > 0 && (
              <span className="text-blue-300 font-semibold shrink-0">+${Number(a.amount).toFixed(4)}</span>
            )}
            {a.txHash && (
              <a
                href={`https://basescan.org/tx/${a.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-[#FF9900] shrink-0"
                title="Voir sur BaseScan"
              >
                ↗
              </a>
            )}
            <span className="text-gray-600 shrink-0 w-10 text-right">
              {a.time ? new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function AdminDashboard() {
  useSEO({ title: 'Admin Dashboard', noindex: true });
  const [showLogin, setShowLogin] = useState(!sessionStorage.getItem(STORAGE_KEY));
  const [stats, setStats] = useState<StatsData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const adminFetch = useCallback(async <T,>(path: string): Promise<T> => {
    const token = sessionStorage.getItem(STORAGE_KEY) || '';
    const res = await fetch(`${API_URL}${path}`, {
      headers: { 'X-Admin-Token': token },
    });
    if (res.status === 401 || res.status === 403) {
      sessionStorage.removeItem(STORAGE_KEY);
      setShowLogin(true);
      throw new Error('Unauthorized');
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { error?: string; message?: string }).error || `Erreur ${res.status}`);
    }
    return res.json() as Promise<T>;
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, analyticsData] = await Promise.all([
        adminFetch<StatsData>('/api/stats'),
        adminFetch<AnalyticsData>('/api/analytics'),
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
      setLastRefresh(new Date());
    } catch (e) {
      if ((e as Error).message !== 'Unauthorized') {
        setError((e as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  useEffect(() => {
    if (!showLogin) fetchData();
  }, [showLogin, fetchData]);

  const handleLogin = (token: string) => {
    sessionStorage.setItem(STORAGE_KEY, token);
    setShowLogin(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setStats(null);
    setAnalytics(null);
    setShowLogin(true);
  };

  if (showLogin) return <LoginModal onLogin={handleLogin} />;

  const totalRevenue = analytics?.totals?.revenue ?? stats?.totalRevenue ?? 0;
  const totalTx = analytics?.totals?.transactions ?? stats?.totalPayments ?? 0;
  const walletBalance = stats?.walletBalance ?? analytics?.walletBalance ?? 0;
  const avgPrice = analytics?.avgPrice ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-gray-400 hover:text-[#FF9900] transition-colors">&larr; Back</Link>
          <div>
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            {lastRefresh && (
              <p className="text-xs text-gray-500 mt-0.5">
                Mis à jour à {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/community-agent"
            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Community Agent
          </Link>
          <button
            onClick={fetchData}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#FF9900]/10 text-[#FF9900] hover:bg-[#FF9900]/20 transition-colors disabled:opacity-50"
          >
            {loading ? 'Chargement…' : 'Actualiser'}
          </button>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-400 transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 glass-card rounded-xl p-4 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={fetchData} className="mt-2 text-xs text-[#FF9900] hover:underline">Réessayer</button>
        </div>
      )}

      {loading && !stats ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-8 h-8 border-2 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin" />
          <p className="text-xs text-gray-500">Chargement des données admin…</p>
        </div>
      ) : (
        <>
          {/* Wallet Card */}
          {stats && (
            <div className="glass-card rounded-xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#FF9900]/15 flex items-center justify-center text-lg shrink-0">
                  &#9679;
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Wallet plateforme</p>
                  <p className="text-sm font-mono text-white truncate">{stats.walletFull || stats.wallet}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      {stats.network}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Balance USDC</p>
                  <p className="text-2xl font-bold text-white">{Number(walletBalance).toFixed(4)}</p>
                  <p className="text-xs text-gray-500">USDC</p>
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

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard
              label="Revenue total"
              value={`$${Number(totalRevenue).toFixed(4)}`}
              sub="USDC encaissé"
              icon="&#9650;"
              color="#34D399"
            />
            <KPICard
              label="Transactions"
              value={totalTx.toLocaleString()}
              sub="paiements on-chain"
              icon="&#9711;"
              color="#60A5FA"
            />
            <KPICard
              label="Services actifs"
              value={(analytics?.totals?.services ?? stats?.totalServices ?? 0).toLocaleString()}
              sub="enregistrés"
              icon="&#9632;"
              color="#FF9900"
            />
            <KPICard
              label="Prix moyen"
              value={avgPrice > 0 ? `$${Number(avgPrice).toFixed(4)}` : '—'}
              sub="par appel API"
              icon="&#8776;"
              color="#A78BFA"
            />
          </div>

          {/* Charts Row 1 */}
          {analytics && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <DailyVolumeChart data={analytics.dailyVolume} />
              <CumulativeRevenueChart data={analytics.cumulativeRevenue} />
            </div>
          )}

          {/* Charts Row 2 */}
          {analytics && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <TopEndpointsChart endpoints={analytics.topServices} />
              <RecentTransactions activities={analytics.recentActivity} />
            </div>
          )}

          {/* Quick Links */}
          <div className="grid grid-cols-3 gap-4">
            <Link
              to="/admin/community-agent"
              className="glass-card rounded-xl p-4 text-center hover:border-[#FF9900]/20 border border-transparent transition-colors group"
            >
              <div className="text-2xl mb-2">&#128227;</div>
              <p className="text-sm font-medium text-white group-hover:text-[#FF9900] transition-colors">Community Agent</p>
              <p className="text-xs text-gray-500 mt-1">Scheduler, publications</p>
            </Link>
            <Link
              to="/analytics"
              className="glass-card rounded-xl p-4 text-center hover:border-[#60A5FA]/20 border border-transparent transition-colors group"
            >
              <div className="text-2xl mb-2">&#128202;</div>
              <p className="text-sm font-medium text-white group-hover:text-[#60A5FA] transition-colors">Analytics public</p>
              <p className="text-xs text-gray-500 mt-1">Stats visibles par tous</p>
            </Link>
            <Link
              to="/status"
              className="glass-card rounded-xl p-4 text-center hover:border-[#34D399]/20 border border-transparent transition-colors group"
            >
              <div className="text-2xl mb-2">&#128994;</div>
              <p className="text-sm font-medium text-white group-hover:text-[#34D399] transition-colors">Status</p>
              <p className="text-xs text-gray-500 mt-1">Monitoring endpoints</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
