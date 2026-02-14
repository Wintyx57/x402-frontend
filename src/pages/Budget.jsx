import { useState, useCallback } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import useSEO from '../hooks/useSEO';
import { API_URL } from '../config';

const PERIODS = ['daily', 'weekly', 'monthly'];

function ProgressBar({ label, spent, limit, thresholds = [50, 75, 90] }) {
  const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const color =
    percent >= 90 ? '#EF4444' :
    percent >= 75 ? '#FBBF24' :
    percent >= 50 ? '#FF9900' :
    '#34D399';

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-400 font-medium">{label}</span>
        <span className="text-xs font-mono" style={{ color }}>
          ${spent.toFixed(4)} / ${limit.toFixed(2)}
        </span>
      </div>
      <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${color}CC, ${color})`,
          }}
        />
        {thresholds.map(t => (
          <div
            key={t}
            className="absolute top-0 h-full w-px bg-white/20"
            style={{ left: `${t}%` }}
            title={`${t}%`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {thresholds.map(t => (
          <span
            key={t}
            className="text-[10px]"
            style={{
              color: percent >= t ? color : '#6B7280',
              position: 'relative',
              left: `${t - (t === 50 ? 2 : t === 75 ? 3 : 4)}%`,
            }}
          >
            {t}%
          </span>
        ))}
      </div>
    </div>
  );
}

function AlertBadge({ level, triggered }) {
  const colors = {
    50: { bg: 'bg-[#FF9900]/10', text: 'text-[#FF9900]', border: 'border-[#FF9900]/30' },
    75: { bg: 'bg-[#FBBF24]/10', text: 'text-[#FBBF24]', border: 'border-[#FBBF24]/30' },
    90: { bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]', border: 'border-[#EF4444]/30' },
  };
  const c = colors[level] || colors[50];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${triggered ? 'animate-pulse' : 'opacity-30'}`}
        style={{ backgroundColor: triggered ? 'currentColor' : '#6B7280' }}
      />
      {level}%
    </span>
  );
}

function BudgetStatusCard({ budget, t }) {
  const b = t.budget;
  if (!budget) return null;

  const alertLevels = [50, 75, 90];
  const triggeredAlerts = budget.alerts_triggered || [];

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-white">{b.currentStatus}</h3>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/30 capitalize">
          {budget.period}
        </span>
      </div>

      <ProgressBar
        label={b.spendingProgress}
        spent={budget.spent_usdc}
        limit={budget.max_budget_usdc}
      />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white/[0.03] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">${budget.max_budget_usdc}</div>
          <div className="text-[10px] text-gray-500 uppercase">{b.limitLabel}</div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#FF9900]">${budget.spent_usdc}</div>
          <div className="text-[10px] text-gray-500 uppercase">{b.spentLabel}</div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#34D399]">${budget.remaining_usdc}</div>
          <div className="text-[10px] text-gray-500 uppercase">{b.remainingLabel}</div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-400 mb-2">{b.alertThresholds}</h4>
        <div className="flex gap-2">
          {alertLevels.map(level => (
            <AlertBadge
              key={level}
              level={level}
              triggered={triggeredAlerts.includes(`${level}%`)}
            />
          ))}
        </div>
      </div>

      {budget.period_start && (
        <p className="text-[11px] text-gray-600 mt-4">
          {b.periodStart}: {new Date(budget.period_start).toLocaleString()}
        </p>
      )}
    </div>
  );
}

export default function Budget() {
  const { t } = useTranslation();
  const b = t.budget || {};
  useSEO({
    title: b.title || 'Agent Budget Dashboard',
    description: 'Monitor and control AI agent spending with Budget Guardian. Set daily, weekly, or monthly USDC limits with real-time alerts.',
  });

  const heroRef = useReveal();
  const formRef = useReveal();
  const statusRef = useReveal();

  const [wallet, setWallet] = useState('');
  const [maxBudget, setMaxBudget] = useState('1.00');
  const [period, setPeriod] = useState('daily');
  const [checkAmount, setCheckAmount] = useState('0.01');

  const [budgetData, setBudgetData] = useState(null);
  const [checkResult, setCheckResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isValidWallet = /^0x[a-fA-F0-9]{40}$/.test(wallet);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
    setCheckResult(null);
  };

  const fetchBudget = useCallback(async () => {
    if (!isValidWallet) return;
    clearMessages();
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${API_URL}/api/budget/${wallet}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBudgetData(data.budget);
      if (!data.budget) {
        setSuccess(b.noBudgetSet || 'No budget set for this wallet.');
      }
    } catch (err) {
      setError(err.name === 'AbortError' ? (b.timeout || 'Request timed out') : err.message);
    } finally {
      setLoading(false);
    }
  }, [wallet, isValidWallet, b]);

  const setBudgetAction = useCallback(async () => {
    if (!isValidWallet || !maxBudget) return;
    clearMessages();
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${API_URL}/api/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet,
          max_budget_usdc: parseFloat(maxBudget),
          period,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setBudgetData(data.budget);
      setSuccess(b.budgetSetSuccess || 'Budget set successfully!');
    } catch (err) {
      setError(err.name === 'AbortError' ? (b.timeout || 'Request timed out') : err.message);
    } finally {
      setLoading(false);
    }
  }, [wallet, maxBudget, period, isValidWallet, b]);

  const removeBudget = useCallback(async () => {
    if (!isValidWallet) return;
    clearMessages();
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${API_URL}/api/budget/${wallet}`, {
        method: 'DELETE',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setBudgetData(null);
      setSuccess(b.budgetRemoved || 'Budget removed.');
    } catch (err) {
      setError(err.name === 'AbortError' ? (b.timeout || 'Request timed out') : err.message);
    } finally {
      setLoading(false);
    }
  }, [wallet, isValidWallet, b]);

  const checkBudgetAction = useCallback(async () => {
    if (!isValidWallet || !checkAmount) return;
    clearMessages();
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${API_URL}/api/budget/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet,
          amount_usdc: parseFloat(checkAmount),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCheckResult(data);
      if (data.budget) setBudgetData(data.budget);
    } catch (err) {
      setError(err.name === 'AbortError' ? (b.timeout || 'Request timed out') : err.message);
    } finally {
      setLoading(false);
    }
  }, [wallet, checkAmount, isValidWallet, b]);

  return (
    <main data-page-gradient className="min-h-screen bg-gradient-to-b from-[#0a0e17] to-[#131921] pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div ref={heroRef} className="reveal text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20 mb-4">
            Budget Guardian
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {b.title || 'Agent Budget Dashboard'}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {b.subtitle || 'Monitor and control AI agent spending. Set USDC limits, track usage in real-time, and get alerts before budgets run out.'}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          {/* Left: Form */}
          <div ref={formRef} className="reveal space-y-6">
            {/* Wallet Input */}
            <div className="bg-white/[0.03] border border-white/8 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">
                {b.walletSection || 'Agent Wallet'}
              </h3>
              <label className="block text-xs text-gray-400 mb-1.5" htmlFor="budget-wallet">
                {b.walletLabel || 'Wallet Address'}
              </label>
              <input
                id="budget-wallet"
                type="text"
                value={wallet}
                onChange={e => setWallet(e.target.value.trim())}
                placeholder="0x..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white font-mono
                           placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/50 transition-colors"
              />
              {wallet && !isValidWallet && (
                <p className="text-xs text-red-400 mt-1">{b.invalidWallet || 'Invalid wallet address (must be 0x + 40 hex chars)'}</p>
              )}

              <button
                onClick={fetchBudget}
                disabled={loading || !isValidWallet}
                className="w-full mt-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer border border-white/10
                           bg-white/[0.05] text-white hover:bg-white/10
                           disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (b.loading || 'Loading...') : (b.checkBudget || 'Check Budget')}
              </button>
            </div>

            {/* Set Budget */}
            <div className="bg-white/[0.03] border border-white/8 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">
                {b.setBudgetTitle || 'Set Budget'}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5" htmlFor="budget-max">
                    {b.maxBudgetLabel || 'Max Budget (USDC)'}
                  </label>
                  <input
                    id="budget-max"
                    type="number"
                    step="0.01"
                    min="0.001"
                    value={maxBudget}
                    onChange={e => setMaxBudget(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white
                               placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5" htmlFor="budget-period">
                    {b.periodLabel || 'Period'}
                  </label>
                  <div className="flex gap-2" role="radiogroup" aria-label={b.periodLabel || 'Period'}>
                    {PERIODS.map(p => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        role="radio"
                        aria-checked={period === p}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer border transition-all duration-200 capitalize ${
                          period === p
                            ? 'bg-[#FF9900]/10 border-[#FF9900]/40 text-[#FF9900]'
                            : 'bg-white/[0.02] border-white/6 text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {b[`period_${p}`] || p}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={setBudgetAction}
                  disabled={loading || !isValidWallet || !maxBudget}
                  className="w-full py-2.5 rounded-lg text-sm font-medium text-white cursor-pointer border-none
                             bg-gradient-to-r from-[#FF9900] to-[#FF6600] hover:from-[#FFa500] hover:to-[#FF7700]
                             disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (b.loading || 'Loading...') : (b.setBudgetBtn || 'Set Budget')}
                </button>
              </div>
            </div>

            {/* Pre-flight Check */}
            <div className="bg-white/[0.03] border border-white/8 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">
                {b.preflightTitle || 'Pre-flight Check'}
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                {b.preflightDesc || 'Check if a specific amount is within the budget before making a call.'}
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={checkAmount}
                  onChange={e => setCheckAmount(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white
                             placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/50 transition-colors"
                  aria-label={b.amountLabel || 'Amount (USDC)'}
                  placeholder="0.01"
                />
                <button
                  onClick={checkBudgetAction}
                  disabled={loading || !isValidWallet || !checkAmount}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer border border-white/10
                             bg-white/[0.05] text-white hover:bg-white/10
                             disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {b.checkBtn || 'Check'}
                </button>
              </div>
              {checkResult && (
                <div className={`mt-3 p-3 rounded-lg text-sm border ${
                  checkResult.allowed
                    ? 'bg-[#34D399]/10 border-[#34D399]/30 text-[#34D399]'
                    : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
                }`}>
                  {checkResult.allowed
                    ? (b.allowed || 'Allowed — within budget')
                    : `${b.denied || 'Denied'} — ${checkResult.reason || 'exceeds budget'}`
                  }
                </div>
              )}
            </div>

            {/* Remove Budget */}
            {budgetData && (
              <button
                onClick={removeBudget}
                disabled={loading || !isValidWallet}
                className="w-full py-2.5 rounded-lg text-sm font-medium cursor-pointer border border-[#EF4444]/30
                           bg-[#EF4444]/5 text-[#EF4444] hover:bg-[#EF4444]/10
                           disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                {b.removeBudget || 'Remove Budget'}
              </button>
            )}
          </div>

          {/* Right: Status */}
          <div ref={statusRef} className="reveal space-y-6">
            {/* Messages */}
            {error && (
              <div className="p-3 rounded-lg text-sm bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444]">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-lg text-sm bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399]">
                {success}
              </div>
            )}

            {/* Budget Status */}
            {budgetData ? (
              <BudgetStatusCard budget={budgetData} t={t} />
            ) : (
              <div className="glass-card rounded-xl p-8 text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-gray-400 text-sm mb-1">{b.emptyTitle || 'No budget loaded'}</p>
                <p className="text-gray-600 text-xs">{b.emptyDesc || 'Enter an agent wallet address and click Check Budget to view spending controls.'}</p>
              </div>
            )}

            {/* How It Works */}
            <div className="bg-white/[0.03] border border-white/8 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">{b.howItWorks || 'How Budget Guardian Works'}</h3>
              <div className="space-y-3">
                {[
                  { icon: '1', text: b.step1 || 'Set a USDC spending limit for any agent wallet (daily, weekly, or monthly).' },
                  { icon: '2', text: b.step2 || 'Every x402 payment is tracked against the budget in real-time.' },
                  { icon: '3', text: b.step3 || 'Alerts trigger at 50%, 75%, and 90% usage. Payments are blocked at 100%.' },
                ].map(({ icon, text }) => (
                  <div key={icon} className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#FF9900]/10 text-[#FF9900] text-xs font-bold flex items-center justify-center">
                      {icon}
                    </span>
                    <p className="text-xs text-gray-400 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-white/[0.03] border border-white/8 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">{b.tipsTitle || 'Quick Tips'}</h3>
              <ul className="space-y-2">
                {[
                  b.tip1 || 'Start with $0.10/day for testing, scale to $1.00+ for production.',
                  b.tip2 || 'Use the pre-flight check before heavy operations to avoid rejections.',
                  b.tip3 || 'Budget resets automatically at the start of each period.',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                    <span className="text-[#FF9900] mt-0.5 shrink-0">&#9656;</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
