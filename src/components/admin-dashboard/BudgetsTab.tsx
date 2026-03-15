import { useState, useEffect, useCallback } from 'react';
import ConfirmModal from './ConfirmModal';
import type { AdminFetch, BudgetItem } from '../../types/admin';

export default function BudgetsTab({ adminFetch }: { adminFetch: AdminFetch }) {
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form
  const [wallet, setWallet] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [period, setPeriod] = useState('daily');
  const [saving, setSaving] = useState(false);
  const [formResult, setFormResult] = useState<string | null>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<{ count: number; budgets: BudgetItem[] }>('/api/budgets');
      setBudgets(res.budgets || []);
    } catch (e) {
      if ((e as Error).message !== 'Unauthorized') setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.trim() || !maxBudget.trim()) return;
    setSaving(true);
    setFormResult(null);
    try {
      await adminFetch('/api/budget', {
        method: 'POST',
        body: JSON.stringify({
          wallet: wallet.trim(),
          max_budget_usdc: parseFloat(maxBudget),
          period,
        }),
      });
      setFormResult('Budget cree avec succes');
      setWallet('');
      setMaxBudget('');
      fetchBudgets();
    } catch (e) {
      setFormResult(`Erreur: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminFetch(`/api/budget/${deleteTarget}`, { method: 'DELETE' });
      setBudgets(prev => prev.filter(b => b.wallet !== deleteTarget));
      setDeleteTarget(null);
    } catch (e) {
      alert(`Erreur: ${(e as Error).message}`);
    } finally {
      setDeleting(false);
    }
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

      {/* Create Form */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Creer / Modifier un budget</h3>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Wallet</label>
            <input
              type="text"
              value={wallet}
              onChange={e => setWallet(e.target.value)}
              placeholder="0x..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FF9900]/40 font-mono"
            />
          </div>
          <div className="w-32">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Max USDC</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={maxBudget}
              onChange={e => setMaxBudget(e.target.value)}
              placeholder="10.00"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FF9900]/40"
            />
          </div>
          <div className="w-32">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Periode</label>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={saving || !wallet.trim() || !maxBudget.trim()}
            className="px-4 py-2 rounded-lg gradient-btn text-white text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
        {formResult && (
          <p className={`text-xs mt-3 ${formResult.startsWith('Erreur') ? 'text-red-400' : 'text-green-400'}`}>{formResult}</p>
        )}
      </div>

      {/* Budgets Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">{budgets.length} budgets actifs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
                <th className="text-left px-4 py-3">Wallet</th>
                <th className="text-right px-4 py-3">Budget max</th>
                <th className="text-right px-4 py-3">Depense</th>
                <th className="text-right px-4 py-3">Restant</th>
                <th className="text-left px-4 py-3 w-36">Utilisation</th>
                <th className="text-center px-4 py-3">Periode</th>
                <th className="text-center px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map(b => {
                const pct = b.used_percent || 0;
                const isAlert = pct >= 90;
                return (
                  <tr key={b.wallet} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-mono text-gray-300">
                      {b.wallet.slice(0, 8)}...{b.wallet.slice(-6)}
                    </td>
                    <td className="px-4 py-3 text-right text-white font-mono">${Number(b.max_budget_usdc).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-blue-300 font-mono">${Number(b.spent_usdc).toFixed(4)}</td>
                    <td className="px-4 py-3 text-right text-green-400 font-mono">${Number(b.remaining_usdc).toFixed(4)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/5 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${isAlert ? 'bg-red-400' : pct >= 50 ? 'bg-yellow-400' : 'bg-green-400'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-mono w-10 text-right ${isAlert ? 'text-red-400' : 'text-gray-400'}`}>
                          {pct.toFixed(0)}%
                        </span>
                        {isAlert && <span className="text-red-400 text-sm" title="Alerte >90%">&#9888;</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-400 capitalize">{b.period}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setDeleteTarget(b.wallet)}
                        className="text-red-400/60 hover:text-red-400 transition-colors"
                        title="Supprimer"
                      >
                        &#10005;
                      </button>
                    </td>
                  </tr>
                );
              })}
              {budgets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Aucun budget configure</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <ConfirmModal
          title="Supprimer ce budget ?"
          message={`Le budget pour ${deleteTarget.slice(0, 10)}... sera supprime. L'agent n'aura plus de limite de depenses.`}
          confirmLabel={deleting ? 'Suppression...' : 'Supprimer'}
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
