import { useState, useEffect, useCallback, Fragment } from 'react';
import ConfirmModal from './ConfirmModal';
import type { AdminFetch, TrustScoreService, TrustBreakdown, TrustDiagnostic } from '../../types/admin';

export default function TrustScoreTab({ adminFetch }: { adminFetch: AdminFetch }) {
  const [services, setServices] = useState<TrustScoreService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<TrustBreakdown | null>(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const [showRecalc, setShowRecalc] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [diagnostic, setDiagnostic] = useState<TrustDiagnostic | null>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [loadingDiag, setLoadingDiag] = useState(false);

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
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (showDiagnostic && diagnostic) { setShowDiagnostic(false); return; }
              setShowDiagnostic(true);
              setLoadingDiag(true);
              try {
                const d = await adminFetch<TrustDiagnostic>('/api/admin/trust-score/diagnostic');
                setDiagnostic(d);
              } catch { /* non-critical */ } finally { setLoadingDiag(false); }
            }}
            disabled={loadingDiag}
            className="text-xs px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors disabled:opacity-50"
          >
            {loadingDiag ? 'Chargement...' : showDiagnostic ? 'Masquer diagnostic' : 'Diagnostic'}
          </button>
          <button
            onClick={() => setShowRecalc(true)}
            disabled={recalculating}
            className="text-xs px-4 py-2 rounded-lg bg-[#FF9900]/10 text-[#FF9900] hover:bg-[#FF9900]/20 transition-colors disabled:opacity-50"
          >
            {recalculating ? 'Recalcul en cours...' : 'Recalculer tous les scores'}
          </button>
        </div>
      </div>

      {/* Diagnostic Panel */}
      {showDiagnostic && diagnostic && (
        <div className="glass-card rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Pipeline de donnees Trust Score</h4>

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Monitoring rows</p>
              <p className="text-lg font-bold text-white">{diagnostic.monitoring_checks.total_rows.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Endpoints uniques</p>
              <p className="text-lg font-bold text-white">{diagnostic.monitoring_checks.unique_endpoints}</p>
            </div>
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Daily rows</p>
              <p className="text-lg font-bold text-white">{diagnostic.daily_checks.total_rows.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Date cutoff</p>
              <p className="text-sm font-medium text-white">{new Date(diagnostic.cutoff_date).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          {/* Sample monitoring */}
          {diagnostic.sample_monitoring.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Sample monitoring_checks (5)</p>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-500 uppercase tracking-wider">
                      <th className="text-left px-2 py-1.5">Endpoint</th>
                      <th className="text-center px-2 py-1.5">Status</th>
                      <th className="text-right px-2 py-1.5">Latence</th>
                      <th className="text-right px-2 py-1.5">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnostic.sample_monitoring.map((s, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="px-2 py-1 text-gray-300 font-mono truncate max-w-[200px]">{s.endpoint}</td>
                        <td className="px-2 py-1 text-center">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                            s.status === 'online' || s.status === 'pass' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            s.status === 'fail' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-gray-500/10 text-gray-400 border-gray-500/20'
                          }`}>{s.status}</span>
                        </td>
                        <td className="px-2 py-1 text-right text-gray-400">{s.latency}ms</td>
                        <td className="px-2 py-1 text-right text-gray-500">{new Date(s.checked_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sample daily */}
          {diagnostic.sample_daily.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Sample daily_checks (5)</p>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-500 uppercase tracking-wider">
                      <th className="text-left px-2 py-1.5">Endpoint</th>
                      <th className="text-center px-2 py-1.5">Status</th>
                      <th className="text-right px-2 py-1.5">Latence</th>
                      <th className="text-right px-2 py-1.5">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnostic.sample_daily.map((s, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="px-2 py-1 text-gray-300 font-mono truncate max-w-[200px]">{s.endpoint}</td>
                        <td className="px-2 py-1 text-center">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                            s.overall_status === 'pass' || s.overall_status === 'online' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            s.overall_status === 'fail' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>{s.overall_status}</span>
                        </td>
                        <td className="px-2 py-1 text-right text-gray-400">{s.call_latency_ms}ms</td>
                        <td className="px-2 py-1 text-right text-gray-500">{new Date(s.checked_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sample services */}
          {diagnostic.sample_services.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Sample services (5)</p>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-500 uppercase tracking-wider">
                      <th className="text-left px-2 py-1.5">ID</th>
                      <th className="text-left px-2 py-1.5">Path</th>
                      <th className="text-right px-2 py-1.5">Trust Score</th>
                      <th className="text-right px-2 py-1.5">Agent ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnostic.sample_services.map((s, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="px-2 py-1 text-gray-400 font-mono">{s.id.slice(0, 8)}</td>
                        <td className="px-2 py-1 text-gray-300 font-mono truncate max-w-[200px]">{s.path}</td>
                        <td className="px-2 py-1 text-right">
                          <span className={s.trust_score != null && s.trust_score >= 80 ? 'text-green-400' : s.trust_score != null && s.trust_score >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                            {s.trust_score ?? '—'}
                          </span>
                        </td>
                        <td className="px-2 py-1 text-right text-gray-500">{s.erc8004_agent_id ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

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
                    <div className="flex flex-col items-center gap-3 py-6">
                      <span className="text-3xl">&#9733;</span>
                      <p className="text-sm text-gray-400">Aucun score disponible</p>
                      <p className="text-xs text-gray-500 max-w-md">
                        Les scores sont calcules automatiquement toutes les 6h a partir des donnees de monitoring.
                        Cliquez "Recalculer tous les scores" pour forcer le calcul immediatement.
                      </p>
                      <button
                        onClick={() => setShowRecalc(true)}
                        disabled={recalculating}
                        className="mt-2 text-xs px-4 py-2 rounded-lg bg-[#FF9900]/10 text-[#FF9900] hover:bg-[#FF9900]/20 transition-colors disabled:opacity-50"
                      >
                        {recalculating ? 'Recalcul en cours...' : 'Recalculer maintenant'}
                      </button>
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
