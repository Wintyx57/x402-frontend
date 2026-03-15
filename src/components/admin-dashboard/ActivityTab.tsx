import { useState, useEffect, useCallback, useRef } from 'react';
import type { AdminFetch, ActivityItem } from '../../types/admin';

const TYPE_COLORS: Record<string, string> = {
  payment: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  api_call: 'bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
  admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  register: 'bg-green-500/10 text-green-400 border-green-500/20',
  fee_splitter: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  '402': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  budget: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

export default function ActivityTab({ adminFetch }: { adminFetch: AdminFetch }) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchActivity = useCallback(async () => {
    try {
      const data = await adminFetch<ActivityItem[]>('/api/activity');
      setActivities(data || []);
      setError(null);
    } catch (e) {
      if ((e as Error).message !== 'Unauthorized') setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchActivity, 15000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, fetchActivity]);

  const filtered = activities.filter(a => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!a.detail?.toLowerCase().includes(q) && !a.type.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const types = ['all', ...new Set(activities.map(a => a.type))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="glass-card rounded-xl p-4 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm font-semibold text-white">{filtered.length} entrees</span>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none"
        >
          {types.map(t => (
            <option key={t} value={t}>{t === 'all' ? 'Tous types' : t}</option>
          ))}
        </select>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FF9900]/40 w-48"
        />
        <label className="flex items-center gap-2 ml-auto cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={e => setAutoRefresh(e.target.checked)}
            className="accent-[#FF9900] w-3.5 h-3.5"
          />
          <span className="text-xs text-gray-400">Auto-refresh 15s</span>
        </label>
        <button onClick={fetchActivity} className="text-xs px-3 py-2 rounded-lg bg-[#FF9900]/10 text-[#FF9900] hover:bg-[#FF9900]/20 transition-colors">
          Actualiser
        </button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Detail</th>
                <th className="text-right px-4 py-3">Montant</th>
                <th className="text-right px-4 py-3">Date</th>
                <th className="text-center px-4 py-3">Lien</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((a, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${TYPE_COLORS[a.type] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                      {a.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 max-w-[400px] truncate">{a.detail}</td>
                  <td className="px-4 py-3 text-right">
                    {a.amount > 0 ? <span className="text-blue-300 font-mono">${Number(a.amount).toFixed(4)}</span> : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {a.time ? new Date(a.time).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {a.txHash ? (
                      <a
                        href={`https://basescan.org/tx/${a.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-[#FF9900] transition-colors"
                      >↗</a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Aucune activite trouvee</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
