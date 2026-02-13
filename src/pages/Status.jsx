import { useEffect, useState, useCallback } from 'react';
import { API_URL } from '../config';
import { useTranslation } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';

const REFRESH_INTERVAL = 60000; // 60s

function StatusBadge({ overall }) {
  const { t } = useTranslation();
  const config = {
    operational: { color: 'bg-emerald-500', text: t.status?.operational || 'All Systems Operational', ring: 'ring-emerald-500/30' },
    degraded: { color: 'bg-amber-500', text: t.status?.degraded || 'Degraded Performance', ring: 'ring-amber-500/30' },
    major_outage: { color: 'bg-red-500', text: t.status?.majorOutage || 'Major Outage', ring: 'ring-red-500/30' },
    unknown: { color: 'bg-gray-500', text: t.status?.unknown || 'Checking...', ring: 'ring-gray-500/30' },
  };
  const c = config[overall] || config.unknown;

  return (
    <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full glass-card ring-2 ${c.ring}`}>
      <span className={`w-3 h-3 rounded-full ${c.color} animate-pulse`} />
      <span className="text-white font-semibold text-lg">{c.text}</span>
    </div>
  );
}

function EndpointCard({ ep, t }) {
  const isOnline = ep.status === 'online';
  return (
    <div className="glass-card rounded-lg p-4 flex items-center gap-3 hover:bg-white/5 transition-colors">
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{ep.label}</p>
        <p className="text-gray-500 text-xs font-mono truncate">{ep.endpoint}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-medium ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
          {isOnline ? (t.status?.online || 'Online') : (t.status?.offline || 'Offline')}
        </p>
        {ep.latency > 0 && (
          <p className="text-gray-500 text-xs">{ep.latency}ms</p>
        )}
      </div>
    </div>
  );
}

function UptimeBar({ uptime }) {
  const pct = uptime ?? 0;
  let color = 'bg-emerald-500';
  if (pct < 99) color = 'bg-amber-500';
  if (pct < 95) color = 'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-gray-400 text-xs w-14 text-right">
        {uptime !== null ? `${uptime}%` : '---'}
      </span>
    </div>
  );
}

export default function Status() {
  const { t } = useTranslation();
  const [status, setStatus] = useState(null);
  const [uptime, setUptime] = useState(null);
  const [period, setPeriod] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  useSEO({
    title: t.status?.pageTitle || 'System Status - x402 Bazaar',
    description: t.status?.pageDesc || 'Real-time status of all 41 API endpoints on x402 Bazaar.',
  });

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/status`);
      const data = await res.json();
      if (data.success) setStatus(data);
    } catch { /* ignore */ }
    setLoading(false);
    setLastRefresh(new Date());
  }, []);

  const fetchUptime = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/status/uptime?period=${period}`);
      const data = await res.json();
      if (data.success) setUptime(data);
    } catch { /* ignore */ }
  }, [period]);

  useEffect(() => {
    fetchStatus();
    fetchUptime();
    const interval = setInterval(() => {
      fetchStatus();
      fetchUptime();
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchUptime]);

  useEffect(() => {
    fetchUptime();
  }, [period, fetchUptime]);

  const onlineCount = status?.onlineCount ?? 0;
  const totalCount = status?.totalCount ?? 0;
  const overallUptime = uptime?.overallUptime;

  return (
    <main className="min-h-screen pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t.status?.title || 'System Status'}
          </h1>
          <p className="text-gray-400 mb-6">
            {t.status?.subtitle || 'Real-time monitoring of all x402 Bazaar API endpoints'}
          </p>

          {/* Overall badge */}
          <StatusBadge overall={status?.overall || 'unknown'} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="glass-card rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-white">{totalCount}</p>
            <p className="text-gray-500 text-sm">{t.status?.endpoints || 'Endpoints'}</p>
          </div>
          <div className="glass-card rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{onlineCount}</p>
            <p className="text-gray-500 text-sm">{t.status?.online || 'Online'}</p>
          </div>
          <div className="glass-card rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{totalCount - onlineCount}</p>
            <p className="text-gray-500 text-sm">{t.status?.offline || 'Offline'}</p>
          </div>
          <div className="glass-card rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-[#FF9900]">
              {overallUptime !== null && overallUptime !== undefined ? `${overallUptime}%` : '---'}
            </p>
            <p className="text-gray-500 text-sm">{t.status?.uptime || 'Uptime'}</p>
          </div>
        </div>

        {/* Period selector + last refresh */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            {['24h', '7d', '30d'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-[#FF9900] text-black'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          {lastRefresh && (
            <p className="text-gray-500 text-xs">
              {t.status?.lastUpdate || 'Last update'}: {lastRefresh.toLocaleTimeString()}
              <span className="ml-2 text-gray-600">({t.status?.autoRefresh || 'auto-refresh 60s'})</span>
            </p>
          )}
        </div>

        {/* Endpoint grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card rounded-lg p-4 animate-shimmer h-16" />
            ))}
          </div>
        ) : status?.endpoints?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {status.endpoints.map((ep) => {
              const uptimeData = uptime?.endpoints?.find((u) => u.endpoint === ep.endpoint);
              return (
                <div key={ep.endpoint}>
                  <EndpointCard ep={ep} t={t} />
                  {uptimeData && (
                    <div className="px-4 pb-2 -mt-1">
                      <UptimeBar uptime={uptimeData.uptime} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card rounded-lg p-8 text-center">
            <p className="text-gray-400">
              {t.status?.noData || 'No monitoring data yet. First check runs 30 seconds after server start.'}
            </p>
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-gray-600 text-xs mt-8">
          {t.status?.footer || 'Endpoints are checked every 5 minutes. Status 402 (Payment Required) or 400 (Missing Params) = Online.'}
        </p>
      </div>
    </main>
  );
}
