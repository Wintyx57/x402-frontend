// src/pages/ApiKeys.tsx — No-wallet API Key management page
// Allows developers to use x402 Bazaar without a crypto wallet.
// They create an API key, top up with USDC, and call services via X-API-Key header.

import { useState, useCallback, useRef } from 'react';
import { useReveal } from '../hooks/useReveal';
import useSEO from '../hooks/useSEO';
import { API_URL } from '../config';

// ---- Types ----------------------------------------------------------------

interface ApiKeyInfo {
  id: string;
  key_masked: string;
  label: string;
  balance_usdc: number;
  total_spent: number;
  call_count: number;
  active: boolean;
  created_at: string;
  last_used_at: string | null;
}

// ---- Sub-components -------------------------------------------------------

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS or older browsers
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border transition-all duration-200 ${
        copied
          ? 'bg-[#34D399]/10 border-[#34D399]/40 text-[#34D399]'
          : 'bg-white/[0.05] border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
      }`}
      aria-label={copied ? 'Copied!' : `Copy ${label}`}
    >
      {copied ? 'Copied!' : label}
    </button>
  );
}

function BalanceBar({ balance, spent }: { balance: number; spent: number }) {
  const total = balance + spent;
  const pct = total > 0 ? Math.min((balance / total) * 100, 100) : 100;
  const color = pct < 10 ? '#EF4444' : pct < 30 ? '#FBBF24' : '#34D399';

  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] mb-1">
        <span style={{ color }} className="font-mono font-medium">${balance.toFixed(4)} remaining</span>
        <span className="text-gray-600">${spent.toFixed(4)} spent</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}CC, ${color})` }}
        />
      </div>
    </div>
  );
}

function KeyCard({ keyInfo, onDeactivate }: { keyInfo: ApiKeyInfo; onDeactivate: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className={`bg-white/[0.03] border rounded-xl p-4 space-y-3 transition-all duration-200 ${
      keyInfo.active ? 'border-white/8 hover:border-white/15' : 'border-white/4 opacity-50'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm text-white truncate">{keyInfo.key_masked}</span>
            {keyInfo.active ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20">
                Active
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-gray-500 border border-white/5">
                Inactive
              </span>
            )}
          </div>
          {keyInfo.label && (
            <p className="text-xs text-gray-500 mt-0.5">{keyInfo.label}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-white">${keyInfo.balance_usdc.toFixed(4)}</p>
          <p className="text-[10px] text-gray-600">{keyInfo.call_count} calls</p>
        </div>
      </div>

      <BalanceBar balance={keyInfo.balance_usdc} spent={keyInfo.total_spent} />

      <div className="flex items-center justify-between pt-1">
        <p className="text-[10px] text-gray-600">
          Created {new Date(keyInfo.created_at).toLocaleDateString()}
          {keyInfo.last_used_at && (
            <> · Last used {new Date(keyInfo.last_used_at).toLocaleDateString()}</>
          )}
        </p>
        {keyInfo.active && (
          confirming ? (
            <div className="flex gap-2">
              <button
                onClick={() => { onDeactivate(keyInfo.id); setConfirming(false); }}
                className="px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer border border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 transition-all"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer border border-[#EF4444]/20 bg-transparent text-[#EF4444]/60 hover:bg-[#EF4444]/10 hover:text-[#EF4444] transition-all"
            >
              Revoke
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ---- Main page ------------------------------------------------------------

export default function ApiKeys() {
  useSEO({
    title: 'API Keys — x402 Bazaar',
    description: 'Create API keys with prepaid USDC balance. Call any x402 Bazaar service without a crypto wallet — just use your X-API-Key header.',
    noindex: false,
  });

  const heroRef = useReveal();
  const formRef = useReveal();
  const listRef = useReveal();
  const docsRef = useReveal();

  // --- Creation form ---
  const [email, setEmail] = useState('');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // The raw key is shown ONCE after creation
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const keyDisplayRef = useRef<HTMLInputElement>(null);

  // --- Keys list (by email + existing key auth) ---
  const [listEmail, setListEmail] = useState('');
  const [existingKey, setExistingKey] = useState('');
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // --- Top-up ---
  const [topupKeyId, setTopupKeyId] = useState('');
  const [topupAmount, setTopupAmount] = useState('5.00');
  const [topupTxHash, setTopupTxHash] = useState('');
  const [topupCurrentKey, setTopupCurrentKey] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupError, setTopupError] = useState<string | null>(null);
  const [topupSuccess, setTopupSuccess] = useState<string | null>(null);

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isValidTxHash = (h: string) => /^0x[a-fA-F0-9]{64}$/.test(h);

  // ---- Handlers -----------------------------------------------------------

  const handleCreate = useCallback(async () => {
    if (!isValidEmail(email)) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    setCreatedKey(null);

    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${API_URL}/api/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), label: label.trim() }),
        signal: controller.signal,
      });
      clearTimeout(tid);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || `HTTP ${res.status}`);
      }
      setCreatedKey(data.key);
      setSuccess('API key created! Copy it now — it will not be shown again.');
      setEmail('');
      setLabel('');
      // Auto-select the key text for easy copy
      setTimeout(() => keyDisplayRef.current?.select(), 100);
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? (err.name === 'AbortError' ? 'Request timed out' : err.message)
        : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [email, label]);

  const handleLoadKeys = useCallback(async () => {
    if (!existingKey || !existingKey.startsWith('sk_live_')) return;
    setListLoading(true);
    setListError(null);

    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${API_URL}/api/keys`, {
        headers: { 'X-API-Key': existingKey },
        signal: controller.signal,
      });
      clearTimeout(tid);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
      setKeys(data.keys || []);
      setListEmail(data.email || '');
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? (err.name === 'AbortError' ? 'Request timed out' : err.message)
        : String(err);
      setListError(msg);
    } finally {
      setListLoading(false);
    }
  }, [existingKey]);

  const handleDeactivate = useCallback(async (keyId: string) => {
    if (!existingKey) return;
    try {
      const res = await fetch(`${API_URL}/api/keys/${keyId}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': existingKey },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || `HTTP ${res.status}`);
      }
      setKeys(prev => prev.map(k => k.id === keyId ? { ...k, active: false } : k));
    } catch (err: unknown) {
      setListError(err instanceof Error ? err.message : String(err));
    }
  }, [existingKey]);

  const handleTopup = useCallback(async () => {
    if (!topupCurrentKey || !isValidTxHash(topupTxHash) || !parseFloat(topupAmount)) return;
    setTopupLoading(true);
    setTopupError(null);
    setTopupSuccess(null);

    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${API_URL}/api/keys/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': topupCurrentKey },
        body: JSON.stringify({ amount: parseFloat(topupAmount), tx_hash: topupTxHash }),
        signal: controller.signal,
      });
      clearTimeout(tid);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
      setTopupSuccess(`Successfully added ${data.amount_added} USDC. New balance: $${data.new_balance.toFixed(4)}`);
      setTopupTxHash('');
      // Refresh keys list if loaded
      if (existingKey) handleLoadKeys();
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? (err.name === 'AbortError' ? 'Request timed out' : err.message)
        : String(err);
      setTopupError(msg);
    } finally {
      setTopupLoading(false);
    }
  }, [topupCurrentKey, topupTxHash, topupAmount, existingKey, handleLoadKeys]);

  // ---- Render -------------------------------------------------------------

  return (
    <main data-page-gradient className="min-h-screen bg-gradient-to-b from-[#0a0e17] to-[#131921] pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Hero */}
        <div ref={heroRef} className="reveal text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20 mb-4">
            No Wallet Required
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            API Keys — Prepaid Access
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            No crypto wallet needed. Create an API key, top up with USDC once, and call any service
            using a single <code className="text-[#FF9900] bg-[#FF9900]/10 px-1.5 py-0.5 rounded text-xs font-mono">X-API-Key</code> header.
          </p>

          {/* Value props */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {[
              { icon: '⚡', text: 'No on-chain tx per call' },
              { icon: '🔑', text: 'Single header integration' },
              { icon: '💳', text: 'Prepaid USDC balance' },
              { icon: '📊', text: 'Usage tracking built-in' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/8 rounded-full text-xs text-gray-400">
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-6 mb-6">

          {/* Left: Create Key */}
          <div ref={formRef} className="reveal space-y-5">
            <div className="bg-white/[0.03] border border-white/8 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white mb-1">Create New API Key</h2>
              <p className="text-xs text-gray-500 mb-4">
                Your key will be shown once — store it securely.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5" htmlFor="ak-email">
                    Email address
                  </label>
                  <input
                    id="ak-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value.trim())}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white
                               placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5" htmlFor="ak-label">
                    Label <span className="text-gray-600">(optional)</span>
                  </label>
                  <input
                    id="ak-label"
                    type="text"
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    placeholder="e.g. Production, My AI Agent"
                    maxLength={100}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white
                               placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/50 transition-colors"
                  />
                </div>

                <button
                  onClick={handleCreate}
                  disabled={loading || !isValidEmail(email)}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer border-none
                             bg-gradient-to-r from-[#FF9900] to-[#FF6600] hover:from-[#FFa500] hover:to-[#FF7700]
                             disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? 'Creating...' : 'Create API Key'}
                </button>
              </div>

              {/* Messages */}
              {error && (
                <div className="mt-3 p-3 rounded-lg text-xs bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444]">
                  {error}
                </div>
              )}

              {/* Key display — shown ONCE */}
              {createdKey && (
                <div className="mt-4 p-4 bg-[#34D399]/5 border border-[#34D399]/30 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
                    <p className="text-xs font-semibold text-[#34D399]">
                      {success}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={keyDisplayRef}
                      type="text"
                      readOnly
                      value={createdKey}
                      className="flex-1 font-mono text-xs bg-black/30 border border-white/10 rounded-lg px-3 py-2
                                 text-white focus:outline-none focus:border-[#FF9900]/50"
                      onClick={e => (e.target as HTMLInputElement).select()}
                      aria-label="Your new API key"
                    />
                    <CopyButton text={createdKey} label="Copy key" />
                  </div>
                  <p className="text-[10px] text-gray-600">
                    This key will not be shown again. Store it in your environment variables or a password manager.
                  </p>
                </div>
              )}
            </div>

            {/* Top-up form */}
            <div className="bg-white/[0.03] border border-white/8 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white mb-1">Top Up Balance</h2>
              <p className="text-xs text-gray-500 mb-4">
                Send USDC to the platform wallet and provide the transaction hash.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5" htmlFor="topup-key">
                    Your API Key
                  </label>
                  <input
                    id="topup-key"
                    type="text"
                    value={topupCurrentKey}
                    onChange={e => setTopupCurrentKey(e.target.value.trim())}
                    placeholder="sk_live_..."
                    className="w-full font-mono bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white
                               placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5" htmlFor="topup-amount">
                    Amount (USDC)
                  </label>
                  <input
                    id="topup-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="10000"
                    value={topupAmount}
                    onChange={e => setTopupAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white
                               focus:outline-none focus:border-[#FF9900]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5" htmlFor="topup-tx">
                    Transaction Hash
                  </label>
                  <input
                    id="topup-tx"
                    type="text"
                    value={topupTxHash}
                    onChange={e => setTopupTxHash(e.target.value.trim())}
                    placeholder="0x..."
                    className={`w-full font-mono bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white
                               placeholder-gray-600 focus:outline-none transition-colors ${
                                 topupTxHash && !isValidTxHash(topupTxHash)
                                   ? 'border-[#EF4444]/50 focus:border-[#EF4444]'
                                   : 'border-white/10 focus:border-[#FF9900]/50'
                               }`}
                  />
                  {topupTxHash && !isValidTxHash(topupTxHash) && (
                    <p className="text-[10px] text-[#EF4444] mt-1">Invalid tx hash format (must be 0x + 64 hex chars)</p>
                  )}
                </div>

                {/* Platform wallet info */}
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-1.5">
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Send USDC to:</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-300 break-all">
                      {import.meta.env.VITE_PLATFORM_WALLET || '0xfb1c478BD5567BdcD39782E0D6D23418bFda2430'}
                    </span>
                    <CopyButton
                      text={import.meta.env.VITE_PLATFORM_WALLET || '0xfb1c478BD5567BdcD39782E0D6D23418bFda2430'}
                      label="Copy"
                    />
                  </div>
                  <p className="text-[10px] text-gray-600">
                    Supported networks: Base (USDC 6 dec), SKALE on Base, Polygon
                  </p>
                </div>

                <button
                  onClick={handleTopup}
                  disabled={topupLoading || !topupCurrentKey.startsWith('sk_live_') || !isValidTxHash(topupTxHash) || !parseFloat(topupAmount)}
                  className="w-full py-2.5 rounded-lg text-sm font-medium text-white cursor-pointer border-none
                             bg-gradient-to-r from-[#FF9900] to-[#FF6600] hover:from-[#FFa500] hover:to-[#FF7700]
                             disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {topupLoading ? 'Processing...' : 'Top Up Balance'}
                </button>
              </div>

              {topupError && (
                <div className="mt-3 p-3 rounded-lg text-xs bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444]">
                  {topupError}
                </div>
              )}
              {topupSuccess && (
                <div className="mt-3 p-3 rounded-lg text-xs bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399]">
                  {topupSuccess}
                </div>
              )}
            </div>
          </div>

          {/* Right: My Keys */}
          <div ref={listRef} className="reveal space-y-5">
            <div className="bg-white/[0.03] border border-white/8 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white mb-1">My API Keys</h2>
              <p className="text-xs text-gray-500 mb-4">
                Authenticate with any of your active keys to see all keys for your account.
              </p>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={existingKey}
                  onChange={e => setExistingKey(e.target.value.trim())}
                  placeholder="sk_live_..."
                  className="flex-1 font-mono bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white
                             placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/50 transition-colors"
                  aria-label="Existing API key to authenticate"
                />
                <button
                  onClick={handleLoadKeys}
                  disabled={listLoading || !existingKey.startsWith('sk_live_')}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer border border-white/10
                             bg-white/[0.05] text-white hover:bg-white/10
                             disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {listLoading ? 'Loading...' : 'Load'}
                </button>
              </div>

              {listError && (
                <div className="mb-3 p-3 rounded-lg text-xs bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444]">
                  {listError}
                </div>
              )}

              {listEmail && (
                <p className="text-xs text-gray-500 mb-3">
                  Showing keys for <span className="text-gray-300">{listEmail}</span>
                </p>
              )}

              {keys.length > 0 ? (
                <div className="space-y-3">
                  {keys.map(k => (
                    <KeyCard key={k.id} keyInfo={k} onDeactivate={handleDeactivate} />
                  ))}
                </div>
              ) : listEmail ? (
                <p className="text-center text-gray-600 text-sm py-6">No API keys found.</p>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-10 h-10 mx-auto mb-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <p className="text-gray-600 text-xs">Enter an existing API key above to view your account.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* How to use */}
        <div ref={docsRef} className="reveal">
          <div className="bg-white/[0.03] border border-white/8 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-5">How to use API Keys</h2>
            <div className="grid md:grid-cols-3 gap-5 mb-6">
              {[
                {
                  step: '1',
                  title: 'Create your key',
                  desc: 'Enter your email and optional label. The key is shown once — store it safely.',
                },
                {
                  step: '2',
                  title: 'Top up with USDC',
                  desc: 'Send any amount of USDC to the platform wallet on Base, SKALE, or Polygon, then submit the tx hash.',
                },
                {
                  step: '3',
                  title: 'Call any service',
                  desc: 'Add X-API-Key: sk_live_xxx to your HTTP requests. Balance is deducted automatically.',
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#FF9900]/10 text-[#FF9900] text-xs font-bold flex items-center justify-center">
                    {step}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white mb-1">{title}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Code examples */}
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Code examples</h3>
            <div className="space-y-3">
              {[
                {
                  lang: 'bash',
                  label: 'cURL',
                  code: `curl -X POST https://x402-api.onrender.com/api/call/<serviceId> \\
  -H "X-API-Key: sk_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"q": "What is x402?"}'`,
                },
                {
                  lang: 'javascript',
                  label: 'JavaScript / Node.js',
                  code: `const response = await fetch(
  'https://x402-api.onrender.com/api/call/<serviceId>',
  {
    method: 'POST',
    headers: {
      'X-API-Key': process.env.X402_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: 'What is x402?' }),
  }
);
const data = await response.json();
console.log(data._x402.remaining_balance); // remaining USDC balance`,
                },
                {
                  lang: 'python',
                  label: 'Python',
                  code: `import httpx

response = httpx.post(
    "https://x402-api.onrender.com/api/call/<serviceId>",
    headers={"X-API-Key": os.environ["X402_API_KEY"]},
    json={"q": "What is x402?"},
)
data = response.json()
print(data["_x402"]["remaining_balance"])`,
                },
              ].map(({ lang, label, code }) => (
                <div key={lang} className="relative">
                  <div className="flex items-center justify-between bg-[#0d1117] border border-white/8 rounded-t-lg px-4 py-2">
                    <span className="text-xs text-gray-500 font-medium">{label}</span>
                    <CopyButton text={code} label="Copy" />
                  </div>
                  <pre className="bg-[#0d1117] border border-t-0 border-white/8 rounded-b-lg px-4 py-3 text-xs text-gray-300 overflow-x-auto leading-relaxed">
                    <code>{code}</code>
                  </pre>
                </div>
              ))}
            </div>

            {/* Response structure */}
            <div className="mt-5 p-4 bg-white/[0.02] border border-white/5 rounded-lg">
              <p className="text-xs font-medium text-gray-400 mb-2">Response includes API key metadata:</p>
              <pre className="text-xs text-gray-400 leading-relaxed overflow-x-auto">{`{
  "success": true,
  "data": { /* service response */ },
  "_x402": {
    "payment": "0.01 USDC",
    "split_mode": "api_key",
    "remaining_balance": "4.990000 USDC",
    "key_prefix": "sk_live_abcd"
  }
}`}</pre>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
