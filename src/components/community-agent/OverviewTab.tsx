import { useState, useEffect, useRef } from 'react';
import StatCard from './StatCard';
import StatusIndicator from './StatusIndicator';
import PlatformBadge from './PlatformBadge';

interface Props {
  adminFetch: <T = unknown>(path: string, options?: RequestInit) => Promise<T>;
}

interface HealthData {
  status: string;
  uptime?: number;
  version?: string;
}

interface StatsData {
  totalPublished?: number;
  last24h?: number;
  queueSize?: number;
  platforms?: Record<string, { enabled?: boolean; autoPublish?: boolean }>;
  recentActivity?: Array<{ timestamp: string; platform: string; status: string; message?: string }>;
  scheduler?: { running?: boolean; lastRun?: string; nextRun?: string; strategy?: string };
}

function formatUptime(seconds?: number): string {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function OverviewTab({ adminFetch }: Props) {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const fetchData = async () => {
    try {
      const [h, s] = await Promise.all([
        adminFetch<HealthData>('/health').catch(() => null),
        adminFetch<StatsData>('/stats').catch(() => null),
      ]);
      setHealth(h);
      setStats(s);
      setError(null);
    } catch (err: any) {
      if (err.message !== 'Unauthorized') setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const agentOnline = health?.status === 'ok' || health?.status === 'running';
  const platforms = stats?.platforms || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <div className="glass-card rounded-lg p-3 border-red-500/30 text-red-400 text-sm">{error}</div>
      )}

      {/* Live indicator */}
      {!loading && (
        <div className="flex justify-end">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400/70 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Auto-refresh 5s
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="●" label="Status" value={agentOnline ? 'ONLINE' : 'OFFLINE'} color={agentOnline ? 'text-emerald-400' : 'text-red-400'} loading={loading} />
        <StatCard icon="📊" label="24h Posts" value={stats?.last24h ?? '—'} loading={loading} />
        <StatCard icon="📋" label="Queue" value={stats?.queueSize != null ? `${stats.queueSize} pending` : '—'} loading={loading} />
        <StatCard icon="⏱" label="Uptime" value={formatUptime(health?.uptime)} loading={loading} />
      </div>

      {/* Scheduler Status */}
      {stats?.scheduler && (
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <StatusIndicator color={stats.scheduler.running ? 'green' : 'gray'} pulse={stats.scheduler.running} size="md" />
            Scheduler
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Status</span>
              <p className="text-white">{stats.scheduler.running ? 'Active' : 'Stopped'}</p>
            </div>
            <div>
              <span className="text-gray-500">Strategy</span>
              <p className="text-white">{stats.scheduler.strategy || '—'}</p>
            </div>
            <div>
              <span className="text-gray-500">Last run</span>
              <p className="text-white">{stats.scheduler.lastRun ? new Date(stats.scheduler.lastRun).toLocaleTimeString() : '—'}</p>
            </div>
            <div>
              <span className="text-gray-500">Next run</span>
              <p className="text-white">{stats.scheduler.nextRun ? new Date(stats.scheduler.nextRun).toLocaleTimeString() : '—'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Platforms + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Platforms</h3>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-8 rounded animate-shimmer" />)}</div>
          ) : Object.keys(platforms).length > 0 ? (
            <div className="divide-y divide-white/5">
              {Object.entries(platforms).map(([name, cfg]) => (
                <PlatformBadge key={name} name={name} enabled={!!cfg.enabled} autoPublish={cfg.autoPublish} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No platform data</p>
          )}
        </div>

        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Recent Activity</h3>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-6 rounded animate-shimmer" />)}</div>
          ) : stats?.recentActivity?.length ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.recentActivity.slice(0, 10).map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 text-xs font-mono shrink-0">
                    {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-gray-300 capitalize">{a.platform}</span>
                  <span className={a.status === 'success' || a.status === 'published' ? 'text-emerald-400' : 'text-red-400'}>
                    {a.status === 'success' || a.status === 'published' ? '✓' : '✗'}
                  </span>
                  {a.message && <span className="text-gray-500 truncate">{a.message}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
