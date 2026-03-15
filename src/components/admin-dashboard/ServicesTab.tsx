import { useState, useEffect, useCallback, useMemo } from 'react';
import ConfirmModal from './ConfirmModal';
import type { AdminFetch, ServiceItem } from '../../types/admin';

type SortKey = 'name' | 'price_usdc' | 'trust_score' | 'status';
type SortDir = 'asc' | 'desc';

export default function ServicesTab({ adminFetch }: { adminFetch: AdminFetch }) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<{ data: ServiceItem[] }>('/api/services?limit=200');
      setServices(res.data || []);
    } catch (e) {
      if ((e as Error).message !== 'Unauthorized') setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminFetch(`/api/admin/services/${deleteTarget.id}`, { method: 'DELETE' });
      setServices(prev => prev.filter(s => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      alert(`Erreur: ${(e as Error).message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    let list = [...services];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') list = list.filter(s => s.status === statusFilter);
    if (verifiedFilter !== 'all') list = list.filter(s => s.verified_status === verifiedFilter);

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'price_usdc') cmp = (a.price_usdc || 0) - (b.price_usdc || 0);
      else if (sortKey === 'trust_score') cmp = (a.trust_score || 0) - (b.trust_score || 0);
      else if (sortKey === 'status') cmp = (a.status || '').localeCompare(b.status || '');
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return list;
  }, [services, search, statusFilter, verifiedFilter, sortKey, sortDir]);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      online: 'bg-green-500/10 text-green-400 border-green-500/20',
      offline: 'bg-red-500/10 text-red-400 border-red-500/20',
      degraded: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      unknown: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    return (
      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${colors[status] || colors.unknown}`}>
        {status}
      </span>
    );
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return <span className="text-gray-600 ml-1">&#8693;</span>;
    return <span className="text-[#FF9900] ml-1">{sortDir === 'asc' ? '&#9650;' : '&#9660;'}</span>;
  };

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
        <span className="text-sm font-semibold text-white">{filtered.length} services</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FF9900]/40 w-48"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none"
        >
          <option value="all">Tous statuts</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="degraded">Degraded</option>
          <option value="unknown">Unknown</option>
        </select>
        <select
          value={verifiedFilter}
          onChange={e => setVerifiedFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none"
        >
          <option value="all">Verification</option>
          <option value="mainnet_verified">Verified</option>
          <option value="reachable">Reachable</option>
          <option value="pending">Pending</option>
        </select>
        <button onClick={fetchServices} className="text-xs px-3 py-2 rounded-lg bg-[#FF9900]/10 text-[#FF9900] hover:bg-[#FF9900]/20 transition-colors ml-auto">
          Actualiser
        </button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
                <th className="text-left px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                  Nom {sortIcon('name')}
                </th>
                <th className="text-left px-4 py-3">URL</th>
                <th className="text-right px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort('price_usdc')}>
                  Prix {sortIcon('price_usdc')}
                </th>
                <th className="text-center px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                  Statut {sortIcon('status')}
                </th>
                <th className="text-right px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort('trust_score')}>
                  Trust {sortIcon('trust_score')}
                </th>
                <th className="text-center px-4 py-3">Verified</th>
                <th className="text-left px-4 py-3">Owner</th>
                <th className="text-center px-4 py-3">Quick</th>
                <th className="text-center px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-medium text-white max-w-[180px] truncate">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate font-mono">{s.url}</td>
                  <td className="px-4 py-3 text-right text-blue-300 font-mono">${Number(s.price_usdc).toFixed(4)}</td>
                  <td className="px-4 py-3 text-center">{statusBadge(s.status)}</td>
                  <td className="px-4 py-3 text-right">
                    {s.trust_score != null ? (
                      <span className={s.trust_score >= 80 ? 'text-green-400' : s.trust_score >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                        {s.trust_score}
                      </span>
                    ) : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.verified_status === 'mainnet_verified' ? (
                      <span className="text-green-400">&#10003;</span>
                    ) : s.verified_status === 'reachable' ? (
                      <span className="text-yellow-400">~</span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono">
                    {s.owner_wallet ? `${s.owner_wallet.slice(0, 6)}...${s.owner_wallet.slice(-4)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.quick_registered ? <span className="text-[#FF9900]">&#9889;</span> : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setDeleteTarget(s)}
                      className="text-red-400/60 hover:text-red-400 transition-colors"
                      title="Supprimer"
                    >
                      &#10005;
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">Aucun service trouve</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <ConfirmModal
          title="Supprimer ce service ?"
          message={`"${deleteTarget.name}" sera supprime definitivement. Cette action est irreversible.`}
          confirmLabel={deleting ? 'Suppression...' : 'Supprimer'}
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
