import { useState, useEffect, useCallback } from 'react';
import ConfirmModal from './ConfirmModal';
import type { AdminFetch, RevenueOverview, PayoutsResponse, FeeSplitterData } from '../../types/admin';
import { txExplorerUrl } from '../../types/admin';

export default function RevenueTab({ adminFetch }: { adminFetch: AdminFetch }) {
  const [revenue, setRevenue] = useState<RevenueOverview | null>(null);
  const [payouts, setPayouts] = useState<PayoutsResponse | null>(null);
  const [feeSplitter, setFeeSplitter] = useState<FeeSplitterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mark paid
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [txHashOut, setTxHashOut] = useState('');
  const [marking, setMarking] = useState(false);
  const [markResult, setMarkResult] = useState<string | null>(null);

  // FeeSplitter
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<string | null>(null);

  // Distribute
  const [showDistribute, setShowDistribute] = useState(false);
  const [distributeProvider, setDistributeProvider] = useState('');
  const [distributeAmount, setDistributeAmount] = useState('');
  const [distributing, setDistributing] = useState(false);
  const [distributeResult, setDistributeResult] = useState<string | null>(null);
  const [showDistributeConfirm, setShowDistributeConfirm] = useState(false);

  // Expanded providers
  const [expandedWallets, setExpandedWallets] = useState<Set<string>>(new Set());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, p, f] = await Promise.all([
        adminFetch<RevenueOverview>('/api/admin/revenue').catch(() => null),
        adminFetch<PayoutsResponse>('/api/admin/payouts').catch(() => null),
        adminFetch<FeeSplitterData>('/api/admin/fee-splitter').catch(() => null),
      ]);
      setRevenue(r);
      setPayouts(p);
      setFeeSplitter(f);
    } catch (e) {
      if ((e as Error).message !== 'Unauthorized') setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleMarkPaid = async () => {
    if (selectedIds.size === 0 || !txHashOut.trim()) return;
    setMarking(true);
    setMarkResult(null);
    try {
      const res = await adminFetch<{ success: boolean; updated?: number; error?: string }>('/api/admin/payouts/mark-paid', {
        method: 'POST',
        body: JSON.stringify({ ids: Array.from(selectedIds), txHashOut: txHashOut.trim() }),
      });
      if (res.success) {
        setMarkResult(`${res.updated} payouts marques comme payes`);
        setSelectedIds(new Set());
        setTxHashOut('');
        fetchAll();
      } else {
        setMarkResult(`Erreur: ${res.error}`);
      }
    } catch (e) {
      setMarkResult(`Erreur: ${(e as Error).message}`);
    } finally {
      setMarking(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    setWithdrawResult(null);
    try {
      const res = await adminFetch<{ success: boolean; txHash?: string; error?: string; amount_usdc?: string }>('/api/admin/fee-splitter/withdraw', {
        method: 'POST',
      });
      if (res.success) {
        setWithdrawResult(res.txHash ? `Withdraw OK — tx: ${res.txHash.slice(0, 18)}...` : `OK — ${res.amount_usdc} USDC`);
        fetchAll();
      } else {
        setWithdrawResult(`Erreur: ${res.error}`);
      }
    } catch (e) {
      setWithdrawResult(`Erreur: ${(e as Error).message}`);
    } finally {
      setWithdrawing(false);
    }
  };

  const toggleExpand = (wallet: string) => {
    setExpandedWallets(prev => {
      const next = new Set(prev);
      next.has(wallet) ? next.delete(wallet) : next.add(wallet);
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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

      {/* Revenue Cards */}
      {revenue && !revenue.error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Revenue brut</p>
            <p className="text-2xl font-bold text-white">${Number(revenue.total_revenue_usdc).toFixed(4)}</p>
          </div>
          <div className="glass-card rounded-xl p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Payouts providers (95%)</p>
            <p className="text-2xl font-bold text-green-400">${Number(revenue.provider_payouts_usdc).toFixed(4)}</p>
          </div>
          <div className="glass-card rounded-xl p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Frais plateforme (5%)</p>
            <p className="text-2xl font-bold text-purple-400">${Number(revenue.platform_fees_usdc).toFixed(4)}</p>
          </div>
          <div className="glass-card rounded-xl p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">En attente</p>
            <p className="text-2xl font-bold text-yellow-400">${Number(revenue.pending_usdc).toFixed(4)}</p>
          </div>
        </div>
      )}

      {/* Revenue by Status & Chain */}
      {revenue && (revenue.by_status || revenue.by_chain) && (
        <div className="grid md:grid-cols-2 gap-4">
          {revenue.by_status && Object.keys(revenue.by_status).length > 0 && (
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Par statut</h3>
              <div className="space-y-2">
                {Object.entries(revenue.by_status).map(([k, v]) => {
                  const colors: Record<string, string> = { pending: 'bg-yellow-400', paid: 'bg-green-400', processing: 'bg-blue-400', failed: 'bg-red-400' };
                  return (
                    <div key={k} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${colors[k] || 'bg-gray-400'}`} />
                      <span className="text-xs text-gray-400 capitalize w-20">{k}</span>
                      <span className="text-xs text-white font-mono">${Number(v).toFixed(4)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {revenue.by_chain && Object.keys(revenue.by_chain).length > 0 && (
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Par chain</h3>
              <div className="space-y-2">
                {Object.entries(revenue.by_chain).map(([k, v]) => {
                  const total = Object.values(revenue.by_chain!).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? (v / total) * 100 : 0;
                  const colors: Record<string, string> = { base: 'bg-blue-400', skale: 'bg-purple-400', polygon: 'bg-amber-400' };
                  return (
                    <div key={k} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 capitalize">{k}</span>
                        <span className="text-white font-mono">${Number(v).toFixed(4)}</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${colors[k] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pending Payouts */}
      {payouts && !payouts.error && payouts.providers?.length > 0 && (
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Payouts en attente ({payouts.count})</h3>
          <div className="space-y-2">
            {payouts.providers.map(prov => (
              <div key={prov.wallet} className="border border-white/5 rounded-lg">
                <div
                  className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-white/[0.02]"
                  onClick={() => toggleExpand(prov.wallet)}
                >
                  <span className="text-gray-500">{expandedWallets.has(prov.wallet) ? '&#9660;' : '&#9654;'}</span>
                  <span className="text-xs font-mono text-gray-300">{prov.wallet.slice(0, 8)}...{prov.wallet.slice(-6)}</span>
                  <span className="text-xs text-white font-semibold ml-auto">${Number(prov.total_due).toFixed(4)}</span>
                  <span className="text-[10px] text-gray-500">{prov.count} payout{prov.count > 1 ? 's' : ''}</span>
                </div>
                {expandedWallets.has(prov.wallet) && (
                  <div className="px-4 pb-3 space-y-1.5">
                    {prov.payouts.map(p => (
                      <div key={p.id} className="flex items-center gap-3 text-[11px] py-1 border-t border-white/5">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          className="accent-[#FF9900] w-3.5 h-3.5"
                        />
                        <span className="text-gray-400 truncate flex-1">{p.service_name}</span>
                        <span className="text-blue-300 font-mono">${Number(p.amount_usdc).toFixed(4)}</span>
                        <span className="text-gray-600 uppercase">{p.chain}</span>
                        {p.tx_hash_in && (
                          <a
                            href={txExplorerUrl(p.tx_hash_in, p.chain)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-[#FF9900]"
                          >↗</a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mark Paid */}
          {selectedIds.size > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
              <span className="text-xs text-gray-400">{selectedIds.size} selectionne(s)</span>
              <input
                type="text"
                value={txHashOut}
                onChange={e => setTxHashOut(e.target.value)}
                placeholder="0x... (tx hash du paiement)"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-[#FF9900]/40 flex-1 min-w-[200px] font-mono"
              />
              <button
                onClick={handleMarkPaid}
                disabled={marking || !txHashOut.trim()}
                className="text-xs px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-colors disabled:opacity-50"
              >
                {marking ? 'En cours...' : 'Marquer comme paye'}
              </button>
            </div>
          )}
          {markResult && (
            <p className={`text-xs mt-2 ${markResult.startsWith('Erreur') ? 'text-red-400' : 'text-green-400'}`}>{markResult}</p>
          )}
        </div>
      )}

      {/* FeeSplitter */}
      {feeSplitter && (
        <div className="glass-card rounded-xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">&#9878;</span>
              <h3 className="text-sm font-semibold text-white">FeeSplitter (Polygon)</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">95/5 split</span>
            </div>
            <button onClick={fetchAll} className="text-xs text-gray-500 hover:text-[#FF9900] transition-colors">&#8635;</button>
          </div>

          {!feeSplitter.configured ? (
            <p className="text-xs text-gray-500">{feeSplitter.message || 'Non configure'}</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Solde en attente</p>
                  <p className={`text-xl font-bold ${parseFloat(feeSplitter.pending_usdc || '0') > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                    ${parseFloat(feeSplitter.pending_usdc || '0').toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Split preview (1 USDC)</p>
                  <p className="text-sm text-white">Provider: <span className="text-green-400">${feeSplitter.preview_1usdc?.provider || '—'}</span></p>
                  <p className="text-sm text-white">Platform: <span className="text-blue-400">${feeSplitter.preview_1usdc?.platform || '—'}</span></p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Contrat</p>
                  <a
                    href={`https://polygonscan.com/address/${feeSplitter.contract}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-gray-400 hover:text-[#FF9900] transition-colors break-all"
                  >
                    {feeSplitter.contract?.slice(0, 10)}...{feeSplitter.contract?.slice(-8)} &#8599;
                  </a>
                </div>
              </div>
              {parseFloat(feeSplitter.pending_usdc || '0') > 0 && (
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                  className="w-full py-2.5 rounded-lg bg-[#FF9900]/10 text-[#FF9900] text-sm font-semibold hover:bg-[#FF9900]/20 border border-[#FF9900]/20 transition-colors disabled:opacity-50"
                >
                  {withdrawing ? 'Withdraw en cours...' : `Withdraw ${parseFloat(feeSplitter.pending_usdc || '0').toFixed(6)} USDC`}
                </button>
              )}
              {withdrawResult && (
                <p className={`text-xs mt-2 ${withdrawResult.startsWith('Erreur') ? 'text-red-400' : 'text-green-400'}`}>{withdrawResult}</p>
              )}

              {/* Distribute to provider */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => { setShowDistribute(!showDistribute); setDistributeResult(null); }}
                  className="text-xs text-gray-400 hover:text-[#FF9900] transition-colors flex items-center gap-1"
                >
                  <span>{showDistribute ? '\u25BC' : '\u25B6'}</span>
                  Distribuer a un provider
                </button>

                {showDistribute && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Adresse provider</label>
                      <input
                        type="text"
                        value={distributeProvider}
                        onChange={e => setDistributeProvider(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-[#FF9900]/40 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Montant USDC</label>
                      <input
                        type="number"
                        value={distributeAmount}
                        onChange={e => setDistributeAmount(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-[#FF9900]/40 font-mono"
                      />
                    </div>
                    <button
                      onClick={() => setShowDistributeConfirm(true)}
                      disabled={distributing || !distributeProvider.match(/^0x[a-fA-F0-9]{40}$/) || !distributeAmount || parseFloat(distributeAmount) <= 0 || parseFloat(distributeAmount) > 10000}
                      className="w-full py-2 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-semibold hover:bg-purple-500/20 border border-purple-500/20 transition-colors disabled:opacity-50"
                    >
                      {distributing ? 'Distribution en cours...' : 'Distribuer'}
                    </button>
                    {distributeResult && (
                      <p className={`text-xs ${distributeResult.startsWith('Erreur') ? 'text-red-400' : 'text-green-400'}`}>{distributeResult}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Distribute Confirm Modal */}
              {showDistributeConfirm && (
                <ConfirmModal
                  title="Confirmer la distribution"
                  message={`Distribuer ${distributeAmount} USDC a ${distributeProvider.slice(0, 8)}...${distributeProvider.slice(-6)} via FeeSplitter ?`}
                  confirmLabel="Distribuer"
                  loading={distributing}
                  onConfirm={async () => {
                    setDistributing(true);
                    setDistributeResult(null);
                    setShowDistributeConfirm(false);
                    try {
                      const res = await adminFetch<{ success: boolean; txHash?: string; error?: string }>('/api/admin/fee-splitter/distribute', {
                        method: 'POST',
                        body: JSON.stringify({ provider: distributeProvider, amount_usdc: parseFloat(distributeAmount) }),
                      });
                      if (res.success) {
                        const link = res.txHash ? ` tx: ${res.txHash.slice(0, 18)}...` : '';
                        setDistributeResult(`Distribution OK${link}`);
                        setDistributeProvider('');
                        setDistributeAmount('');
                        fetchAll();
                      } else {
                        setDistributeResult(`Erreur: ${res.error}`);
                      }
                    } catch (e) {
                      setDistributeResult(`Erreur: ${(e as Error).message}`);
                    } finally { setDistributing(false); }
                  }}
                  onCancel={() => setShowDistributeConfirm(false)}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
