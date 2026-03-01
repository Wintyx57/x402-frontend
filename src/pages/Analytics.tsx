import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import useSEO from '../hooks/useSEO';
import { usePublicStats } from '../hooks/usePublicStats';
import { API_URL } from '../config';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ArcElement);

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color?: string;
}

function StatCard({ label, value, sub, icon, color = '#FF9900' }: StatCardProps) {
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

interface Endpoint {
  endpoint: string;
  count: number;
}

function TopEndpointsChart({ endpoints, t }: { endpoints: Endpoint[]; t: Record<string, any> }) {
  if (!endpoints || endpoints.length === 0) return null;

  const data = {
    labels: endpoints.map((ep: Endpoint) => ep.endpoint.length > 20 ? ep.endpoint.slice(0, 18) + '...' : ep.endpoint),
    datasets: [{
      label: t.analytics.callsLabel || 'Calls',
      data: endpoints.map((ep: Endpoint) => ep.count),
      backgroundColor: endpoints.map((_: Endpoint, i: number) => {
        const colors = ['#FF9900', '#FF9900CC', '#FF990099', '#FF990066', '#FF990044', '#FF990033', '#FF990022', '#FF990011'];
        return colors[i] || colors[colors.length - 1];
      }),
      borderRadius: 6,
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
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#6B7280', font: { size: 11 } },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#D1D5DB', font: { size: 11 } },
      },
    },
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">{t.analytics.topServicesTitle}</h3>
      <div style={{ height: `${Math.max(endpoints.length * 36, 200)}px` }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

function MonitoringStatus({ monitoring, uptimePercent, t }: { monitoring: Record<string, any>; uptimePercent: number | null; t: Record<string, any> }) {
  const isOperational = monitoring?.overall === 'operational' || monitoring?.overall === 'healthy';
  const isDegraded = monitoring?.overall === 'degraded';
  const statusColor = isOperational ? '#34D399' : isDegraded ? '#FBBF24' : '#EF4444';

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">{t.analytics.monitoringTitle || 'Monitoring'}</h3>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: statusColor }} />
        <span className="text-white font-medium capitalize">{monitoring?.overall || 'unknown'}</span>
        <span className="text-xs text-gray-500">
          {monitoring?.online}/{monitoring?.total} {t.analytics.endpointsOnline || 'endpoints online'}
        </span>
      </div>
      {uptimePercent !== null && uptimePercent !== undefined && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">{t.analytics.uptimeLabel || 'Uptime (24h)'}</span>
            <span className="text-sm font-semibold" style={{ color: uptimePercent > 95 ? '#34D399' : '#FBBF24' }}>
              {uptimePercent}%
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${uptimePercent}%`,
                background: uptimePercent > 95 ? 'linear-gradient(90deg, #34D399, #10B981)' : 'linear-gradient(90deg, #FBBF24, #F59E0B)',
              }}
            />
          </div>
        </div>
      )}
      {monitoring?.lastCheck && (
        <p className="text-xs text-gray-500 mt-3">
          {t.analytics.lastCheckLabel || 'Last check'}: {new Date(monitoring.lastCheck).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}

function PaymentsDoughnut({ totalPayments, apiCalls, t }: { totalPayments: number | null; apiCalls: number | null; t: Record<string, any> }) {
  if (!totalPayments && !apiCalls) return null;

  const data = {
    labels: [t.analytics.totalPayments || 'Payments', t.analytics.totalApiCalls || 'API Calls'],
    datasets: [{
      data: [totalPayments || 0, apiCalls || 0],
      backgroundColor: ['#60A5FA', '#FF9900'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#9CA3AF', font: { size: 11 }, padding: 16, usePointStyle: true },
      },
      tooltip: {
        backgroundColor: '#1a2332',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#9CA3AF',
      },
    },
    cutout: '65%',
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">{t.analytics.activityBreakdown || 'Activity Breakdown'}</h3>
      <div style={{ height: '220px' }}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}

interface Activity {
  type: string;
  detail?: string;
  amount?: number;
  time?: string;
}

function RecentActivity({ activities, t }: { activities: Activity[] | null; t: Record<string, any> }) {
  if (!activities || activities.length === 0) return null;

  const typeEmoji: Record<string, string> = { payment: '\uD83D\uDCB0', api_call: '\u26A1', register: '\uD83C\uDD95', '402': '\uD83D\uDD12', error: '\u274C' };
  const typeColor: Record<string, string> = { payment: 'text-blue-400', api_call: 'text-[#FF9900]', register: 'text-green-400', '402': 'text-yellow-400', error: 'text-red-400' };

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">{t.analytics.recentActivityTitle || 'Recent Activity'}</h3>
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
        {activities.map((a: Activity, i: number) => (
          <div key={i} className="flex items-center gap-3 text-xs">
            <span>{typeEmoji[a.type] || '\u2022'}</span>
            <span className={`font-medium uppercase w-16 shrink-0 ${typeColor[a.type] || 'text-gray-400'}`}>
              {a.type}
            </span>
            <span className="text-gray-300 truncate flex-1">{a.detail?.slice(0, 50)}</span>
            {(a.amount ?? 0) > 0 && (
              <span className="text-blue-400 shrink-0">${Number(a.amount).toFixed(3)}</span>
            )}
            <span className="text-gray-600 shrink-0">
              {a.time ? new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Analytics() {
  const { t } = useTranslation();
  useSEO({
    title: t.analytics.title,
    description: 'Real-time public analytics for x402 Bazaar — API calls, uptime, services, and marketplace activity.',
    noindex: true,
  });

  const ref1 = useReveal();
  const ref2 = useReveal();
  const ref3 = useReveal();
  const ref4 = useReveal();

  const { data: stats, isLoading: loading, error: statsError, refetch } = usePublicStats({
    refetchInterval: 60000,
  });
  const error = statsError?.message || null;

  // Fetch recent activity (separate call to public-stats doesn't include it, use the full endpoint)
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    const fetchActivity = async () => {
      try {
        const res = await fetch(`${API_URL}/api/activity`, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          setRecentActivity(Array.isArray(data) ? data.slice(0, 15) : []);
        }
      } catch { /* ignore */ }
    };
    fetchActivity();
    return () => controller.abort();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="animate-fade-in-up mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20">
            {t.analytics.live}
          </span>
          <span className="text-xs text-gray-500">{t.analytics.autoRefresh || 'Auto-refresh every 60s'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{t.analytics.title}</h1>
        <p className="text-gray-400 text-sm max-w-2xl">{t.analytics.subtitle}</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-8 h-8 border-2 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin" />
          <p className="text-xs text-gray-500">{(t.analytics as any).loadingLabel || 'Loading analytics...'}</p>
        </div>
      ) : error && !stats ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <p className="text-gray-400 mb-2">{(t.analytics as any).errorLabel || 'Unable to load analytics'}</p>
          <p className="text-xs text-gray-600">{error}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 text-xs text-[#FF9900] border border-[#FF9900]/20 rounded-lg hover:bg-[#FF9900]/10 transition-colors cursor-pointer"
          >
            {(t.analytics as any).retryLabel || 'Retry'}
          </button>
        </div>
      ) : !stats ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <p className="text-gray-400">{t.analytics.noData}</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div ref={ref1} className="reveal grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label={t.analytics.totalServices}
              value={stats.services || 0}
              sub={`${stats.nativeEndpoints || 61} ${t.analytics.nativeLabel || 'native endpoints'}`}
              icon="&#9632;"
            />
            <StatCard
              label={t.analytics.totalApiCalls || 'API Calls'}
              value={(stats.apiCalls || 0).toLocaleString()}
              sub={`${stats.recentCallCount24h || 0} ${t.analytics.last24h || 'in last 24h'}`}
              icon="&#9654;"
              color="#34D399"
            />
            <StatCard
              label={t.analytics.totalPayments || 'Payments'}
              value={(stats.totalPayments || 0).toLocaleString()}
              sub={t.analytics.onChainLabel || 'verified on-chain'}
              icon="&#9733;"
              color="#60A5FA"
            />
            <StatCard
              label={t.analytics.integrationsLabel || 'Integrations'}
              value={stats.integrations || 6}
              sub={`${stats.tests || 416} ${t.analytics.testsLabel || 'tests passing'}`}
              icon="&#10003;"
              color="#A78BFA"
            />
          </div>

          {/* Charts row: Monitoring + Top Endpoints */}
          <div ref={ref2} className="reveal grid md:grid-cols-2 gap-4 mb-8">
            <MonitoringStatus
              monitoring={stats.monitoring}
              uptimePercent={stats.uptimePercent}
              t={t}
            />
            <TopEndpointsChart endpoints={stats.topEndpoints} t={t} />
          </div>

          {/* Charts row 2: Doughnut + Recent Activity */}
          <div ref={ref3} className="reveal grid md:grid-cols-2 gap-4 mb-8">
            <PaymentsDoughnut
              totalPayments={stats.totalPayments || null}
              apiCalls={stats.apiCalls || null}
              t={t}
            />
            <RecentActivity activities={recentActivity} t={t} />
          </div>

          {/* Platform info */}
          <div ref={ref4} className="reveal grid sm:grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-[#FF9900] mb-1">$0.003</div>
              <div className="text-xs text-gray-400">{t.analytics.cheapestCall || 'Cheapest API call'}</div>
            </div>
            <div className="glass-card rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-[#34D399] mb-1">95%</div>
              <div className="text-xs text-gray-400">{t.analytics.creatorRevenue || 'Creator revenue share'}</div>
            </div>
            <div className="glass-card rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-[#60A5FA] mb-1">6</div>
              <div className="text-xs text-gray-400">{t.analytics.platformsLabel || 'Platform integrations'}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
