import { useState, useEffect, useCallback } from 'react';
import type { AdminFetch, DailyTesterStatus, ServiceItem, SystemHealth } from '../../types/admin';
import { txExplorerUrl } from '../../types/admin';

const API_BASE = import.meta.env.VITE_API_URL || '';

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}j ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function latencyColor(ms?: number): string {
  if (ms == null) return 'text-gray-400';
  if (ms < 100) return 'text-green-400';
  if (ms <= 500) return 'text-yellow-400';
  return 'text-red-400';
}

export default function MonitoringTab({ adminFetch }: { adminFetch: AdminFetch }) {
  const [tester, setTester] = useState<DailyTesterStatus | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/health/deep`);
      if (res.ok) setHealth(await res.json());
    } catch { /* non-critical */ } finally { setHealthLoading(false); }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, s] = await Promise.all([
        adminFetch<DailyTesterStatus>('/api/admin/daily-tester').catch(() => null),
        adminFetch<{ data: ServiceItem[] }>('/api/services?limit=200').catch(() => ({ data: [] })),
        fetchHealth(),
      ]);
      setTester(t);
      setServices(s.data || []);
    } catch (e) {
      if ((e as Error).message !== 'Unauthorized') setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [adminFetch, fetchHealth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onlineCount = services.filter(s => s.status === 'online').length;
  const offlineCount = services.filter(s => s.status === 'offline').length;
  const degradedCount = services.filter(s => s.status === 'degraded').length;
  const unknownCount = services.filter(s => !s.status || s.status === 'unknown').length;

  const resultBadge = (result: string) => {
    const colors: Record<string, string> = {
      pass: 'bg-green-500/10 text-green-400 border-green-500/20',
      partial: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      fail: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return (
      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${colors[result] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
        {result}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="glass-card rounded-xl p-4 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* System Health */}
      {health && (
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-white">Sante Systeme</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded border ${
                health.status === 'ok'
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              }`}>
                {health.status === 'ok' ? 'OK' : 'Degrade'}
              </span>
              <span className="text-[10px] text-gray-600">v{health.version}</span>
              <span className="text-[10px] text-gray-600">uptime: {formatUptime(health.uptime_seconds)}</span>
            </div>
            <button
              onClick={fetchHealth}
              disabled={healthLoading}
              className="text-xs text-gray-500 hover:text-[#FF9900] transition-colors disabled:opacity-50"
            >
              {healthLoading ? <span className="inline-block w-3 h-3 border border-[#FF9900]/30 border-t-[#FF9900] rounded-full animate-spin" /> : <span>&#8635;</span>}
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(health.checks).map(([name, check]) => {
              const isOk = check.status === 'ok' || check.status === 'connected';
              const label: Record<string, string> = {
                supabase: 'Supabase', base_rpc: 'Base RPC', skale_rpc: 'SKALE RPC',
                polygon_rpc: 'Polygon RPC', fee_splitter: 'FeeSplitter', erc8004: 'ERC-8004',
              };
              return (
                <div key={name} className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${isOk ? 'bg-green-400' : 'bg-red-400'}`} />
                    <p className="text-xs font-medium text-white">{label[name] || name}</p>
                  </div>
                  <div className="space-y-0.5 text-[10px]">
                    {check.latency_ms != null && (
                      <p className={latencyColor(check.latency_ms)}>{check.latency_ms}ms</p>
                    )}
                    {check.block_number != null && (
                      <p className="text-gray-500">block #{check.block_number.toLocaleString()}</p>
                    )}
                    {check.contract && (
                      <p className="text-gray-600 font-mono truncate">{check.contract.slice(0, 10)}...{check.contract.slice(-6)}</p>
                    )}
                    {check.pending_usdc != null && (
                      <p className="text-gray-400">pending: ${parseFloat(check.pending_usdc).toFixed(4)}</p>
                    )}
                    {check.push_in_progress != null && (
                      <p className={check.push_in_progress ? 'text-yellow-400' : 'text-gray-600'}>
                        push: {check.push_in_progress ? 'en cours' : 'idle'}
                      </p>
                    )}
                    {check.services_with_agent_id != null && (
                      <p className="text-gray-500">{check.services_with_agent_id} agents</p>
                    )}
                    {check.error && (
                      <p className="text-red-400 truncate">{check.error}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Tester E2E */}
      {tester && (
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Daily Tester E2E</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded border ${
              tester.enabled ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {tester.enabled ? 'Active' : 'Inactif'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Dernier run</p>
              <p className="text-sm text-white">{tester.lastRun ? new Date(tester.lastRun).toLocaleString('fr-FR') : '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Prochain run</p>
              <p className="text-sm text-white">{tester.nextRun ? new Date(tester.nextRun).toLocaleString('fr-FR') : '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Balance</p>
              <p className="text-sm text-white">{tester.balance != null ? `$${Number(tester.balance).toFixed(4)}` : '—'}</p>
            </div>
          </div>

          {/* Results Table */}
          {tester.results && tester.results.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
                    <th className="text-left px-3 py-2">Service</th>
                    <th className="text-center px-3 py-2">Resultat</th>
                    <th className="text-left px-3 py-2">Erreur</th>
                    <th className="text-right px-3 py-2">Duree</th>
                    <th className="text-center px-3 py-2">Chain</th>
                    <th className="text-center px-3 py-2">Tx</th>
                  </tr>
                </thead>
                <tbody>
                  {tester.results.map((r, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="px-3 py-2 text-white max-w-[180px] truncate">{r.service_name}</td>
                      <td className="px-3 py-2 text-center">{resultBadge(r.result)}</td>
                      <td className="px-3 py-2 text-red-400/70 max-w-[200px] truncate">{r.error || '—'}</td>
                      <td className="px-3 py-2 text-right text-gray-400">{r.duration_ms ? `${r.duration_ms}ms` : '—'}</td>
                      <td className="px-3 py-2 text-center text-gray-500 uppercase">{r.chain || '—'}</td>
                      <td className="px-3 py-2 text-center">
                        {r.txHash ? (
                          <a href={txExplorerUrl(r.txHash, r.chain)} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#FF9900]">↗</a>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Service Status Grid */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Grille statut services</h3>
          <button onClick={fetchData} className="text-xs text-gray-500 hover:text-[#FF9900] transition-colors">&#8635;</button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center py-2 rounded-lg bg-green-500/5 border border-green-500/10">
            <p className="text-xl font-bold text-green-400">{onlineCount}</p>
            <p className="text-[10px] text-gray-500 uppercase">Online</p>
          </div>
          <div className="text-center py-2 rounded-lg bg-red-500/5 border border-red-500/10">
            <p className="text-xl font-bold text-red-400">{offlineCount}</p>
            <p className="text-[10px] text-gray-500 uppercase">Offline</p>
          </div>
          <div className="text-center py-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
            <p className="text-xl font-bold text-yellow-400">{degradedCount}</p>
            <p className="text-[10px] text-gray-500 uppercase">Degraded</p>
          </div>
          <div className="text-center py-2 rounded-lg bg-gray-500/5 border border-gray-500/10">
            <p className="text-xl font-bold text-gray-400">{unknownCount}</p>
            <p className="text-[10px] text-gray-500 uppercase">Unknown</p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5">
          {services.map(s => {
            const colorMap: Record<string, string> = {
              online: 'bg-green-500/20 border-green-500/30 hover:bg-green-500/30',
              offline: 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30',
              degraded: 'bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/30',
              unknown: 'bg-gray-500/10 border-gray-500/20 hover:bg-gray-500/20',
            };
            return (
              <div
                key={s.id}
                className={`p-1.5 rounded border text-center transition-colors ${colorMap[s.status] || colorMap.unknown}`}
                title={`${s.name} — ${s.status}`}
              >
                <p className="text-[9px] text-white/80 truncate">{s.name.split(' ')[0]}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
