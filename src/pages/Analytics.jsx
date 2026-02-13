import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import useSEO from '../hooks/useSEO';
import { API_URL } from '../config';

function StatCard({ label, value, sub, icon, color = '#FF9900' }) {
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

function TopEndpointsTable({ endpoints, t }) {
  if (!endpoints || endpoints.length === 0) return null;
  const max = endpoints[0]?.count || 1;

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">{t.analytics.topServicesTitle}</h3>
      <div className="space-y-3">
        {endpoints.map((ep, i) => (
          <div key={ep.endpoint} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-5 text-right">{i + 1}.</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white truncate">{ep.endpoint}</span>
                <span className="text-xs text-gray-400 ml-2 shrink-0">{ep.count}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(ep.count / max) * 100}%`,
                    background: `linear-gradient(90deg, #FF9900, #FF9900${i > 2 ? '60' : ''})`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonitoringStatus({ monitoring, uptimePercent, t }) {
  const statusColor = monitoring?.overall === 'healthy' ? '#34D399'
    : monitoring?.overall === 'degraded' ? '#FBBF24' : '#EF4444';

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
      {uptimePercent !== null && (
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

export default function Analytics() {
  const { t } = useTranslation();
  useSEO({
    title: t.analytics.title,
    description: 'Real-time public analytics for x402 Bazaar — API calls, uptime, services, and marketplace activity.',
  });

  const ref1 = useReveal();
  const ref2 = useReveal();
  const ref3 = useReveal();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/public-stats`);
        const data = await res.json();
        setStats(data);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
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
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin" />
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
              sub={`${stats.nativeEndpoints || 41} ${t.analytics.nativeLabel || 'native endpoints'}`}
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
              sub={`${stats.tests || 333} ${t.analytics.testsLabel || 'tests passing'}`}
              icon="&#10003;"
              color="#A78BFA"
            />
          </div>

          {/* Monitoring + Top endpoints */}
          <div ref={ref2} className="reveal grid md:grid-cols-2 gap-4 mb-8">
            <MonitoringStatus
              monitoring={stats.monitoring}
              uptimePercent={stats.uptimePercent}
              t={t}
            />
            <TopEndpointsTable endpoints={stats.topEndpoints} t={t} />
          </div>

          {/* Platform info */}
          <div ref={ref3} className="reveal grid sm:grid-cols-3 gap-4">
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
