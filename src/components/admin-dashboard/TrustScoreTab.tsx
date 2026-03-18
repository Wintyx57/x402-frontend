import { useState, useEffect, useCallback, Fragment } from 'react';
import ConfirmModal from './ConfirmModal';
import type { AdminFetch, TrustScoreService, TrustBreakdown } from '../../types/admin';

export default function TrustScoreTab({ adminFetch }: { adminFetch: AdminFetch }) {
  const [services, setServices] = useState<TrustScoreService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<TrustBreakdown | null>(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const [showRecalc, setShowRecalc] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const fetchScores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<{ services: TrustScoreService[]; count: number }>('/api/admin/trust-score');
      setServices(res.services || []);
    } catch (e) {
      if ((e as Error).message !== 'Unauthorized') setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  useEffect(() => { fetchScores(); }, [fetchScores]);

  const handleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setBreakdown(null);
      return;
    }
    setExpandedId(id);
    setBreakdown(null);
    setLoadingBreakdown(true);
    try {
      const data = await adminFetch<TrustBreakdown>(`/api/admin/trust-score/${id}`);
      setBreakdown(data);
    } catch {
      // Non-critical
    } finally {
      setLoadingBreakdown(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    setShowRecalc(false);
    try {
      await adminFetch('/api/admin/trust-score/recalculate', { method: 'POST' });
      setTimeout(fetchScores, 3000);
    } catch {
      // Non-critical
    } finally {
      setRecalculating(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const scoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-400';
    if (score >= 50) return 'bg-yellow-400';
    return 'bg-red-400';
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white">{services.length} services avec score</span>
        <button
          onClick={() => setShowRecalc(true)}
          disabled={recalculating}
          className="text-xs px-4 py-2 rounded-lg bg-[#FF9900]/10 text-[#FF9900] hover:bg-[#FF9900]/20 transition-colors disabled:opacity-50"
        >
          {recalculating ? 'Recalcul en cours...' : 'Recalculer tous les scores'}
        </button>
      </div>

      {/* Leaderboard */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
                <th className="text-center px-3 py-3 w-12">#</th>
                <th className="text-left px-4 py-3">Nom</th>
                <th className="text-left px-4 py-3">URL</th>
                <th className="text-left px-4 py-3 w-48">Trust Score</th>
                <th className="text-center px-4 py-3">Statut</th>
                <th className="text-right px-4 py-3">Prix</th>
                <th className="text-right px-4 py-3">Derniere MaJ</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, i) => (
                <Fragment key={s.id}>
                  <tr
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => handleExpand(s.id)}
                  >
                    <td className="text-center px-3 py-3 text-gray-500 font-semibold">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-white max-w-[180px] truncate">
                      <span className="mr-1.5">{expandedId === s.id ? '&#9660;' : '&#9654;'}</span>
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono max-w-[140px] truncate">{s.url}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold w-8 ${scoreColor(s.trust_score)}`}>{s.trust_score}</span>
                        <div className="flex-1 bg-white/5 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${scoreBarColor(s.trust_score)} transition-all`}
                            style={{ width: `${s.trust_score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        s.status === 'online' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        s.status === 'offline' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-blue-300 font-mono">${Number(s.price_usdc).toFixed(4)}</td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {s.trust_score_updated_at
                        ? new Date(s.trust_score_updated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                        : '—'}
                    </td>
                  </tr>
                  {expandedId === s.id && (
                    <tr key={`${s.id}-bd`}>
                      <td colSpan={7} className="px-8 py-4 bg-white/[0.01]">
                        {loadingBreakdown ? (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="w-4 h-4 border-2 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin" />
                            Chargement...
                          </div>
                        ) : breakdown?.breakdown ? (
                          <div className="grid grid-cols-4 gap-4">
                            {Object.entries(breakdown.breakdown).map(([key, val]) => (
                              <div key={key} className="text-center">
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                                  {key.replace(/_/g, ' ')}
                                </p>
                                <p className={`text-lg font-bold ${scoreColor(val as number)}`}>{String(val)}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">Pas de breakdown disponible</p>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2 py-4">
                      <span className="text-2xl">&#9733;</span>
                      <p className="text-sm text-gray-400">Aucun score disponible</p>
                      <p className="text-xs text-gray-600">Les scores de confiance seront calcules automatiquement</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recalculate Modal */}
      {showRecalc && (
        <ConfirmModal
          title="Recalculer les Trust Scores ?"
          message="Tous les scores seront recalcules en arriere-plan. Cela peut prendre quelques minutes."
          confirmLabel="Recalculer"
          onConfirm={handleRecalculate}
          onCancel={() => setShowRecalc(false)}
        />
      )}
    </div>
  );
}
