import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSignMessage } from 'wagmi';
import { parseUnits } from 'viem';
import { API_URL, USDC_ABI, CHAIN_CONFIG } from '../config';
import { useTranslation } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import { Link, useSearchParams } from 'react-router-dom';
import ChainSelector from '../components/ChainSelector';
import { trackEvent } from '../lib/analytics';
import EmbedSnippet from '../components/EmbedSnippet';

const REGISTER_COST = 1;
const PRICE_PRESETS = [0.001, 0.005, 0.01];

const CATEGORIES = ['ai', 'data', 'devtools', 'utility', 'social', 'finance', 'other'];
const METHODS = ['GET', 'POST'];

// ---- Step Indicator ----
function StepIndicator({ num, label, active, done, current }: { num: number; label: string; active: boolean; done?: boolean; current?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div aria-current={current ? "step" : undefined} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border ${
        done
          ? 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/40'
          : active
            ? 'bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/50 shadow-[0_0_12px_rgba(255,153,0,0.2)]'
            : 'bg-white/5 text-gray-500 border-white/10'
      }`}>
        {done ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : num}
      </div>
      <span className={`text-xs transition-colors duration-300 ${done ? 'text-[#34D399]' : active ? 'text-[#FF9900]' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
}

// ---- Tooltip ----
function FieldTooltip({ children, tip }: { children: React.ReactNode; tip: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center ml-1.5">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onFocus={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onBlur={() => setShow(false)}
        className="w-4 h-4 rounded-full bg-white/10 border border-white/20 text-gray-400 hover:text-gray-200
                   text-[10px] font-bold flex items-center justify-center cursor-help transition-colors"
        aria-label={`Help: ${tip}`}
      >
        {children}
      </button>
      {show && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 px-3 py-2 rounded-lg
                     bg-[#1a1f2e] border border-white/15 text-xs text-gray-300 leading-relaxed
                     shadow-xl z-50 pointer-events-none animate-fade-in"
        >
          {tip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1f2e] border-r border-b border-white/15 rotate-45 -mt-1" aria-hidden="true" />
        </div>
      )}
    </span>
  );
}

// ---- CheckItem ----
function CheckItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
        done ? 'bg-[#34D399]/20 text-[#34D399]' : 'bg-white/5 text-gray-500'
      }`}>
        {done ? (
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
        )}
      </div>
      <span className={`text-xs transition-colors duration-300 ${done ? 'text-gray-300' : 'text-gray-500'}`}>{label}</span>
    </div>
  );
}

export default function Register() {
  const { address, isConnected, chain } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<'quick' | 'full'>(
    searchParams.get('mode') === 'full' ? 'full' : 'quick'
  );
  const [quickForm, setQuickForm] = useState({ url: '', price: '', wallet: '' });
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickResult, setQuickResult] = useState<any>(null);
  const [quickError, setQuickError] = useState<string | null>(null);

  useSEO({
    title: 'List Your API — Earn USDC from AI Agents',
    description: 'Publish your API on x402 Bazaar and get paid per call in USDC by AI agents. 95% revenue, instant payments, no subscription model.',
    keywords: 'monetize API x402, earn USDC from API, AI agent revenue, HTTP 402 provider, list API marketplace',
  });

  const PAYMENT_STEPS = [
    '', // 0 = idle
    t.register.step1,
    t.register.step2,
    t.register.step3,
    t.register.step4,
  ];

  const [form, setForm] = useState({
    name: '', description: '', url: '', price: '', tags: '', category: 'utility', method: 'GET', requiredParams: '', freeCallsPerMonth: ''
  });

  // Multi-service state for full mode
  type ServiceFormData = {
    name: string; description: string; url: string; price: string;
    tags: string; category: string; method: string; requiredParams: string;
  };
  const [services, setServices] = useState<ServiceFormData[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<any>(null);
  const { signMessageAsync } = useSignMessage();

  const [wizardStep, setWizardStep] = useState(1);
  const [paymentState, setPaymentState] = useState<'idle' | 'paying' | 'registering' | 'done' | 'error'>('idle');
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [result, setResult] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState(0);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash ?? undefined });

  // Si wallet déjà connecté au mount, passer directement à l'étape 2
  useEffect(() => {
    if (isConnected) setWizardStep(2);
  }, [isConnected]);

  const validateForm = () => {
    if (!form.name.trim() || form.name.length > 200) return t.register.errName || 'Service name is required (max 200 chars)';
    if (form.description && form.description.length > 1000) return t.register.errDescLong || 'Description too long (max 1000 chars)';
    try {
      const parsed = new URL(form.url);
      if (!['http:', 'https:'].includes(parsed.protocol)) return t.register.errUrlProtocol || 'Only HTTP/HTTPS URLs are allowed';
    } catch {
      return t.register.errUrlFormat || 'Invalid URL format';
    }
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0.001 || price > 1000) return t.register.errPrice || 'Price must be between 0.001 and 1000 USDC';
    const tags = form.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    if (tags.length > 10) return t.register.errTagsMax || 'Maximum 10 tags allowed';
    if (tags.some(tag => tag.length > 50)) return t.register.errTagLen || 'Each tag max 50 chars';
    return null;
  };

  // Build tags array with category included
  const buildTags = () => {
    const userTags = form.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    if (form.category && !userTags.includes(form.category)) {
      userTags.unshift(form.category);
    }
    return userTags;
  };

  const totalServiceCount = 1 + services.length;

  const addService = () => {
    if (totalServiceCount >= 50) return;
    setServices([...services, {
      name: '', description: '', url: '', price: '',
      tags: '', category: 'utility', method: 'GET', requiredParams: '',
    }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: string, value: string) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const buildServicePayload = (svc: ServiceFormData) => {
    const userTags = svc.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (svc.category && !userTags.includes(svc.category)) userTags.unshift(svc.category);
    const payload: Record<string, unknown> = {
      name: svc.name,
      description: svc.description,
      url: svc.url,
      price: parseFloat(svc.price),
      tags: userTags,
    };
    const params = svc.requiredParams.split(',').map(p => p.trim()).filter(Boolean);
    if (params.length > 0) payload.required_parameters = { required: params };
    return payload;
  };

  // Build registration payload (reused in both 402 probe and final POST)
  const buildPayload = () => {
    const payload: Record<string, unknown> = {
      name: form.name,
      description: form.description,
      url: form.url,
      price: parseFloat(form.price),
      tags: buildTags(),
      ownerAddress: address,
    };
    // Parse required params from comma-separated input
    const params = form.requiredParams.split(',').map(p => p.trim()).filter(Boolean);
    if (params.length > 0) {
      payload.required_parameters = { required: params };
    }
    // Free tier: only include if > 0
    const freeCallsVal = parseInt(form.freeCallsPerMonth, 10);
    if (!isNaN(freeCallsVal) && freeCallsVal > 0) {
      payload.free_calls_per_month = Math.min(freeCallsVal, 1000);
    }
    return payload;
  };

  const handleGoToStep3 = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError as string);
      return;
    }
    setError(null);
    trackEvent('register_step', { step: '3_pay' });
    setWizardStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setError(null);

    if (!isConnected) {
      setError(t.register.connectError as string);
      return;
    }

    try {
      setPaymentState('paying');
      setPaymentStep(1);
      const res402 = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });

      if (res402.status !== 402) {
        throw new Error(`Unexpected response: ${res402.status}`);
      }

      const { payment_details } = await res402.json();

      // Resolve USDC contract and RPC from user's current chain
      const currentChainConfig = CHAIN_CONFIG[(chain?.id as number) ?? 8453] || CHAIN_CONFIG[8453];
      const usdcContract = currentChainConfig.usdcContract;

      setPaymentStep(2);
      const hash = await writeContractAsync({
        address: usdcContract as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [
          payment_details.recipient,
          parseUnits(String(payment_details.amount), 6),
        ],
      });

      setTxHash(hash);
      setPaymentState('registering');
      setPaymentStep(3);

      let confirmed = false;
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000));
        try {
          const receiptRes = await fetch(currentChainConfig.rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0', method: 'eth_getTransactionReceipt',
              params: [hash], id: 1
            })
          });
          const { result: receipt } = await receiptRes.json();
          if (receipt && receipt.status === '0x1') {
            confirmed = true;
            break;
          }
        } catch { /* polling receipt — erreur non critique */ }
      }

      if (!confirmed) throw new Error('Transaction not confirmed after 60s');

      setPaymentStep(4);
      const resRegister = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Payment-TxHash': hash,
          'X-Payment-Chain': currentChainConfig.key,
        },
        body: JSON.stringify(buildPayload()),
      });

      if (!resRegister.ok) {
        const err = await resRegister.json();
        throw new Error(err.message || err.error || 'Registration failed');
      }

      const data = await resRegister.json();
      setResult(data);
      setPaymentState('done');
      setPaymentStep(0);
      trackEvent('register_success');
    } catch (err: unknown) {
      const e = err as Record<string, any>;
      const safeMessages = ['Transaction not confirmed', 'User rejected', 'Unexpected response'];
      const isSafe = safeMessages.some(m => e.message?.includes(m));
      setError(isSafe ? e.message : 'Registration failed. Please try again.');
      setPaymentState('error');
      setPaymentStep(0);
    }
  };

  const isProcessing = paymentState === 'paying' || paymentState === 'registering';

  const handleQuickRegister = async () => {
    setQuickError(null);

    // Validate
    try { new URL(quickForm.url); } catch { return setQuickError('Invalid URL format'); }
    const price = parseFloat(quickForm.price);
    if (isNaN(price) || price < 0.001 || price > 1000) return setQuickError('Price must be between 0.001 and 1000 USDC');
    if (!/^0x[a-fA-F0-9]{40}$/.test(quickForm.wallet)) return setQuickError('Invalid wallet address');

    setQuickLoading(true);
    try {
      const res = await fetch(`${API_URL}/quick-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: quickForm.url,
          price,
          ownerAddress: quickForm.wallet,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.message || 'Registration failed');
      }
      const data = await res.json();
      setQuickResult(data);
      trackEvent('quick_register_success');
    } catch (err: unknown) {
      setQuickError((err as Error).message || 'Registration failed');
    } finally {
      setQuickLoading(false);
    }
  };

  const handleBatchRegister = async () => {
    // Validate all services
    const allServices = [form, ...services];
    for (let i = 0; i < allServices.length; i++) {
      const svc = allServices[i];
      if (!svc.name.trim()) return setError(`Service ${i + 1}: name is required`);
      try { new URL(svc.url); } catch { return setError(`Service ${i + 1}: invalid URL`); }
      const p = parseFloat(svc.price);
      if (isNaN(p) || p < 0.001 || p > 1000) return setError(`Service ${i + 1}: price must be 0.001-1000 USDC`);
    }

    if (!isConnected || !address) {
      setError(t.register.connectError as string);
      return;
    }

    setBatchLoading(true);
    setError(null);

    try {
      const timestamp = Date.now();
      const message = `batch-register:${address}:${allServices.length}:${timestamp}`;
      const signature = await signMessageAsync({ message });

      const payload = {
        services: allServices.map(svc => buildServicePayload(svc)),
        ownerAddress: address,
        signature,
        timestamp,
      };

      const res = await fetch(`${API_URL}/batch-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.message || 'Batch registration failed');
      }

      const data = await res.json();
      setBatchResult(data);
      trackEvent('batch_register_success', { count: allServices.length });
    } catch (err: unknown) {
      const e = err as Record<string, any>;
      setError(e.message || 'Batch registration failed');
    } finally {
      setBatchLoading(false);
    }
  };

  // Category label mapping
  const categoryLabels: Record<string, string> = {
    ai: t.register.catAi || 'AI & ML',
    data: t.register.catData || 'Data',
    devtools: t.register.catDevtools || 'Dev Tools',
    utility: t.register.catUtility || 'Utility',
    social: t.register.catSocial || 'Social',
    finance: t.register.catFinance || 'Finance',
    other: t.register.catOther || 'Other',
  };

  // Preview data
  const previewName = form.name.trim() || 'My API';
  const previewDesc = form.description.trim() || (t.register.previewDescFallback || 'Your API description will appear here');
  const previewPrice = parseFloat(form.price) || 0;
  const previewTags = buildTags().slice(0, 3);
  const previewInitial = previewName.charAt(0).toUpperCase();

  // ---- SUCCESS VIEW ----
  if (paymentState === 'done') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="glass glow-orange-lg rounded-2xl p-10 text-center animate-fade-in-up relative overflow-hidden">
          {/* Background radial glow */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,153,0,0.15) 0%, transparent 70%)' }}
          />
          <div className="relative z-10">
            {/* Success checkmark */}
            <div className="w-20 h-20 rounded-full bg-[#34D399]/10 border-2 border-[#34D399]/30 flex items-center justify-center mx-auto mb-6 animate-fade-in-up">
              <svg className="w-10 h-10 text-[#34D399]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="text-[#FF9900] text-2xl font-bold mb-2 animate-fade-in-up delay-100">{t.register.successTitle}</div>
            <p className="text-white font-semibold text-lg mb-1 animate-fade-in-up delay-100">
              {result?.data?.name || 'Your API'}
            </p>
            <p className="text-gray-400 text-sm mb-8 animate-fade-in-up delay-200">{t.register.successDesc}</p>

            {/* Next steps */}
            <div className="grid sm:grid-cols-3 gap-3 mb-8 animate-fade-in-up delay-200">
              {[
                { icon: '01', text: 'Your API is now live on the marketplace' },
                { icon: '02', text: 'AI agents can discover and call it instantly' },
                { icon: '03', text: 'Earn 95% USDC per call, directly on-chain' },
              ].map((item) => (
                <div key={item.icon} className="glass rounded-xl p-3 text-left">
                  <span className="text-[10px] text-[#FF9900]/60 font-mono font-bold">{item.icon}</span>
                  <p className="text-gray-300 text-xs mt-1 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3 animate-fade-in-up delay-300">
              {txHash && (
                <a
                  href={`${(CHAIN_CONFIG[(chain?.id as number) ?? 8453] || CHAIN_CONFIG[8453]).explorer}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 gradient-btn text-white font-medium text-sm px-5 py-2.5 rounded-xl no-underline hover:brightness-110 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {t.register.viewTx}
                </a>
              )}
              <Link
                to="/services"
                className="inline-flex items-center gap-2 glass border border-white/15 text-gray-300 hover:text-white
                           text-sm font-medium px-5 py-2.5 rounded-xl no-underline transition-colors"
              >
                {t.register.viewServices || 'View all services'} &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 animate-fade-in-up">
        {mode === 'quick' ? (t.quickRegister?.title || 'Monetize Any API in 10 Seconds') : t.register.title}
      </h1>
      <p className="text-gray-400 mb-2 animate-fade-in-up delay-100">
        {mode === 'quick'
          ? (t.quickRegister?.subtitle || 'Paste your URL, set a price, start earning. No payment required.')
          : t.register.subtitle.replace('{cost}', String(REGISTER_COST))}
      </p>
      {mode === 'full' && (
        <p className="text-sm text-[#FF9900]/80 font-medium mb-8 animate-fade-in-up delay-100">
          One-time 1 USDC anti-spam deposit &middot; 95% revenue share on all calls
        </p>
      )}

      {/* ---- Tab selector ---- */}
      <div className="flex gap-2 mb-8 animate-fade-in-up">
        <button
          onClick={() => setMode('quick')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border ${
            mode === 'quick'
              ? 'bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/30 shadow-[0_0_12px_rgba(255,153,0,0.15)]'
              : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20'
          }`}
        >
          {t.quickRegister?.quickLabel || 'Quick Start'}
        </button>
        <button
          onClick={() => setMode('full')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border ${
            mode === 'full'
              ? 'bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/30 shadow-[0_0_12px_rgba(255,153,0,0.15)]'
              : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20'
          }`}
        >
          {t.quickRegister?.fullRegLabel || 'Full Registration'}
        </button>
      </div>

      {/* ---- Quick Start Form ---- */}
      {mode === 'quick' && !quickResult && (
        <div className="max-w-lg mx-auto animate-fade-in-up">
          <div className="glass-card rounded-xl p-8 space-y-6">
            {/* URL field */}
            <div>
              <label htmlFor="quick-url" className="block text-sm text-gray-300 mb-1.5">API URL</label>
              <input
                id="quick-url"
                type="url"
                required
                value={quickForm.url}
                onChange={e => setQuickForm({ ...quickForm, url: e.target.value })}
                placeholder="https://api.example.com/endpoint"
                aria-describedby="url-hint-quick"
                className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-3 text-white text-lg placeholder-gray-600
                           focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300"
              />
              <p className="text-[11px] text-amber-400/70 mt-1" id="url-hint-quick">
                {t.register.urlHint || "Enter your API's direct endpoint URL, not a proxy or wrapper."}
              </p>
            </div>

            {/* Price with presets */}
            <div>
              <label htmlFor="quick-price" className="block text-sm text-gray-300 mb-1.5">Price per call (USDC)</label>
              <div className="flex gap-2 mb-2">
                {PRICE_PRESETS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setQuickForm({ ...quickForm, price: String(p) })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                      quickForm.price === String(p)
                        ? 'bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/30'
                        : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                    }`}
                  >
                    ${p}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  id="quick-price"
                  type="number"
                  step="0.001"
                  min="0.001"
                  required
                  value={quickForm.price}
                  onChange={e => setQuickForm({ ...quickForm, price: e.target.value })}
                  placeholder="0.01"
                  className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg pl-4 pr-14 py-2.5 text-white placeholder-gray-600
                             focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none font-mono">USDC</span>
              </div>
            </div>

            {/* Wallet */}
            <div>
              <label htmlFor="quick-wallet" className="block text-sm text-gray-300 mb-1.5">Your Wallet Address</label>
              <div className="flex gap-2">
                <input
                  id="quick-wallet"
                  type="text"
                  required
                  value={quickForm.wallet}
                  onChange={e => setQuickForm({ ...quickForm, wallet: e.target.value })}
                  placeholder="0x..."
                  className="flex-1 bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono text-sm placeholder-gray-600
                             focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300"
                />
                {isConnected && address && (
                  <button
                    type="button"
                    onClick={() => setQuickForm({ ...quickForm, wallet: address })}
                    className="px-3 py-2.5 rounded-lg text-xs bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20
                               hover:bg-[#FF9900]/20 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Use Connected
                  </button>
                )}
              </div>
            </div>

            {quickError && (
              <div role="alert" className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-300 text-sm">
                {quickError}
              </div>
            )}

            <button
              onClick={handleQuickRegister}
              disabled={quickLoading}
              className="w-full gradient-btn text-white py-3 rounded-xl font-medium cursor-pointer
                         transition-all duration-300 hover:scale-[1.02] hover:glow-orange
                         disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {quickLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Registering...
                </>
              ) : 'Monetize this API'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              No payment required · Rate limited to prevent spam
            </p>
          </div>
        </div>
      )}

      {/* ---- Quick Start Success ---- */}
      {mode === 'quick' && quickResult && (
        <div className="max-w-2xl mx-auto animate-fade-in-up">
          <div className="glass glow-orange-lg rounded-2xl p-10 text-center relative overflow-hidden">
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,153,0,0.15) 0%, transparent 70%)' }} />
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full bg-[#34D399]/10 border-2 border-[#34D399]/30 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[#34D399]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-[#FF9900] text-2xl font-bold mb-2">API Listed!</h2>
              <p className="text-gray-400 text-sm mb-6">Your API is live on x402 Bazaar. AI agents can now discover and pay for it.</p>

              {/* Proxy URL */}
              <div className="glass rounded-xl p-4 mb-6 text-left">
                <p className="text-xs text-gray-400 mb-2">x402 Proxy Endpoint</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm text-[#FF9900] font-mono flex-1 truncate">{quickResult.proxy_url}</code>
                  <button
                    onClick={() => navigator.clipboard.writeText(quickResult.proxy_url)}
                    className="px-3 py-1.5 rounded-lg text-xs bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20 hover:bg-[#FF9900]/20 transition-colors cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Embed snippets */}
              <div className="mb-6">
                <EmbedSnippet serviceId={quickResult.data?.id} serviceName={quickResult.data?.name} />
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to={`/services/${quickResult.data?.id}`}
                  className="inline-flex items-center gap-2 gradient-btn text-white font-medium text-sm px-5 py-2.5 rounded-xl no-underline hover:brightness-110 transition-all"
                >
                  View Service Page &rarr;
                </Link>
                <button
                  onClick={() => { setQuickResult(null); setQuickForm({ url: '', price: '', wallet: '' }); }}
                  className="inline-flex items-center gap-2 glass border border-white/15 text-gray-300 hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Register Another
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- Batch Register Success ---- */}
      {batchResult && (
        <div className="max-w-2xl mx-auto animate-fade-in-up">
          <div className="glass glow-orange-lg rounded-2xl p-10 text-center relative overflow-hidden">
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,153,0,0.15) 0%, transparent 70%)' }} />
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full bg-[#34D399]/10 border-2 border-[#34D399]/30 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[#34D399]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-[#FF9900] text-2xl font-bold mb-2">
                {batchResult.data?.length} {t.register.batchSuccess || 'services registered successfully!'}
              </h2>
              <p className="text-gray-400 text-sm mb-6">All services are now live on x402 Bazaar.</p>

              <div className="space-y-2 mb-6 text-left">
                {batchResult.data?.map((svc: any) => (
                  <div key={svc.id} className="glass rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <span className="text-white text-sm font-medium">{svc.name}</span>
                      <span className="text-gray-500 text-xs ml-2">${svc.price_usdc} USDC</span>
                    </div>
                    <Link
                      to={`/services/${svc.id}`}
                      className="text-xs text-[#FF9900] no-underline hover:text-[#FEBD69]"
                    >
                      View &rarr;
                    </Link>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 gradient-btn text-white font-medium text-sm px-5 py-2.5 rounded-xl no-underline hover:brightness-110 transition-all"
                >
                  {t.register.viewServices || 'View all services'} &rarr;
                </Link>
                <button
                  onClick={() => { setBatchResult(null); setServices([]); setForm({ name: '', description: '', url: '', price: '', tags: '', category: 'utility', method: 'GET', requiredParams: '', freeCallsPerMonth: '' }); }}
                  className="inline-flex items-center gap-2 glass border border-white/15 text-gray-300 hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Register More
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- Full Registration (existing wizard) ---- */}
      {mode === 'full' && !batchResult && (
        <>

      {/* ---- Progress bar ---- */}
      <div className="flex items-center gap-4 mb-10 animate-fade-in-up" role="list" aria-label="Registration steps">
        <div role="listitem">
          <StepIndicator num={1} label="Connect" active={wizardStep >= 1} done={wizardStep > 1} current={wizardStep === 1} />
        </div>
        <div className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${wizardStep >= 2 ? 'bg-[#FF9900]/50' : 'bg-white/10'}`} aria-hidden="true" />
        <div role="listitem">
          <StepIndicator num={2} label="Configure" active={wizardStep >= 2} done={wizardStep > 2} current={wizardStep === 2} />
        </div>
        <div className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${wizardStep >= 3 ? 'bg-[#FF9900]/50' : 'bg-white/10'}`} aria-hidden="true" />
        <div role="listitem">
          <StepIndicator num={3} label="Pay" active={wizardStep >= 3} current={wizardStep === 3} />
        </div>
      </div>

      {/* ---- STEP 1 — Connect Wallet ---- */}
      {wizardStep === 1 && (
        <div className="max-w-lg mx-auto animate-fade-in-up">
          <div className="glass-card rounded-xl p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/20 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h2>
              <p className="text-gray-400 text-sm">
                You'll need <span className="text-[#FF9900] font-semibold">1 USDC on Base</span> to register your API.
              </p>
            </div>

            {/* Revenue calculator */}
            <div className="glass rounded-xl p-4 text-left space-y-2">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Revenue Potential</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">100 calls/day &times; $0.01 &times; 95%</span>
                <span className="text-[#34D399] font-bold">~$29/month</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">1,000 calls/day &times; $0.01 &times; 95%</span>
                <span className="text-[#34D399] font-bold">~$285/month</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Platform fee: only 5%. No subscription model.</p>
            </div>

            <ChainSelector />

            <button
              onClick={() => {
                trackEvent('register_step', { step: '1_connect' });
                setWizardStep(2);
              }}
              className="w-full gradient-btn text-white py-3 rounded-xl font-medium cursor-pointer
                         transition-all duration-300 hover:scale-[1.02] hover:glow-orange"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      )}

      {/* ---- STEP 2 — Configure API ---- */}
      {wizardStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in-up delay-200">
          {/* Form — 3 cols */}
          <div className="space-y-5 lg:col-span-3">
            <ChainSelector />
            <div>
              <label htmlFor="reg-name" className="block text-sm text-gray-300 mb-1.5">{t.register.serviceName}</label>
              <input
                id="reg-name" type="text" required aria-required="true" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder={t.register.namePlaceholder}
                className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600
                           focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300"
              />
            </div>
            <div>
              <label htmlFor="reg-desc" className="block text-sm text-gray-300 mb-1.5">{t.register.description}</label>
              <textarea
                id="reg-desc" rows={3} value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder={t.register.descPlaceholder}
                className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600
                           focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300 resize-none"
              />
            </div>
            <div>
              <label htmlFor="reg-url" className="block text-sm text-gray-300 mb-1.5">{t.register.apiUrl}</label>
              <input
                id="reg-url" type="url" required aria-required="true" value={form.url}
                onChange={e => setForm({ ...form, url: e.target.value })}
                placeholder={t.register.urlPlaceholder}
                aria-describedby="url-hint-full"
                className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600
                           focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300"
              />
              <p className="text-[11px] text-amber-400/70 mt-1" id="url-hint-full">
                {t.register.urlHint || "Enter your API's direct endpoint URL, not a proxy or wrapper."}
              </p>
            </div>

            {/* Category + Method row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-category" className="block text-sm text-gray-300 mb-1.5">{t.register.categoryLabel || 'Category'}</label>
                <select
                  id="reg-category"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white
                             focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300 cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-[#1a1f2e]">{categoryLabels[cat]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{t.register.methodLabel || 'HTTP Method'}</label>
                <div className="flex gap-2">
                  {METHODS.map(m => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={form.method === m}
                      onClick={() => setForm({ ...form, method: m })}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-mono font-medium transition-all duration-200 cursor-pointer border ${
                        form.method === m
                          ? 'bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/30'
                          : 'bg-[#1a1f2e] text-gray-500 border-white/10 hover:text-gray-300 hover:border-white/20'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price + Tags row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-price" className="flex items-center text-sm text-gray-400 mb-1.5">
                  {t.register.priceLabel}
                  <FieldTooltip tip="Price per API call in USDC. Min 0.001 USDC. AI agents will pay this amount automatically per request. Suggested: 0.001–0.05 USDC for standard APIs.">
                    ?
                  </FieldTooltip>
                </label>
                <div className="relative">
                  <input
                    id="reg-price" type="number" step="0.001" min="0.001" required aria-required="true" value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder={t.register.pricePlaceholder}
                    className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg pl-4 pr-14 py-2.5 text-white placeholder-gray-600
                               focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300"
                    aria-describedby="price-hint"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none font-mono">USDC</span>
                </div>
                <p id="price-hint" className="text-[11px] text-gray-400 mt-1">0.001 – 1000 USDC per call</p>
              </div>
              <div>
                <label htmlFor="reg-tags" className="flex items-center text-sm text-gray-400 mb-1.5">
                  {t.register.tagsLabel}
                  <FieldTooltip tip="Comma-separated keywords to help agents discover your API. Max 10 tags, 50 chars each. Example: weather, forecast, realtime">
                    ?
                  </FieldTooltip>
                </label>
                <input
                  id="reg-tags" type="text" value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder={t.register.tagsPlaceholder}
                  className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600
                             focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300"
                  aria-describedby="tags-hint"
                />
                <p id="tags-hint" className="text-[11px] text-gray-400 mt-1">Comma-separated · max 10 tags</p>
              </div>
            </div>

            {/* Required Parameters */}
            <div>
              <label htmlFor="reg-params" className="flex items-center text-sm text-gray-400 mb-1.5">
                Required Parameters
                <FieldTooltip tip="Comma-separated list of parameters your API requires. This prevents AI agents from calling your API without the right params (and wasting USDC). Example: city, country">
                  ?
                </FieldTooltip>
              </label>
              <input
                id="reg-params" type="text" value={form.requiredParams}
                onChange={e => setForm({ ...form, requiredParams: e.target.value })}
                placeholder="e.g. city, latitude, longitude"
                className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600
                           focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300"
                aria-describedby="params-hint"
              />
              <p id="params-hint" className="text-[11px] text-gray-400 mt-1">Comma-separated · Prevents failed calls &amp; wasted USDC</p>
            </div>

            {/* Free Calls Per Month */}
            <div>
              <label htmlFor="reg-free-calls" className="flex items-center text-sm text-gray-400 mb-1.5">
                Free Calls per Month
                <FieldTooltip tip="Offer X free calls per user per month. When quota is reached, normal USDC payment applies. Set to 0 to disable free tier. Max 1000. Great for user acquisition.">
                  ?
                </FieldTooltip>
              </label>
              <div className="relative">
                <input
                  id="reg-free-calls"
                  type="number"
                  min="0"
                  max="1000"
                  step="1"
                  value={form.freeCallsPerMonth}
                  onChange={e => setForm({ ...form, freeCallsPerMonth: e.target.value })}
                  placeholder="0"
                  className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg pl-4 pr-20 py-2.5 text-white placeholder-gray-600
                             focus:outline-none focus:border-emerald-500/40 transition-all duration-300"
                  aria-describedby="free-calls-hint"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none font-mono">
                  calls/mo
                </span>
              </div>
              <p id="free-calls-hint" className="text-[11px] text-gray-400 mt-1">
                0 = disabled · max 1000 · resets monthly per user
              </p>
            </div>

            {/* Additional services */}
            {services.map((svc, idx) => (
              <div key={idx} className="glass rounded-xl p-4 space-y-3 border border-white/10 relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#FF9900] font-semibold">Service {idx + 2}</span>
                  <button
                    type="button"
                    onClick={() => removeService(idx)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer bg-transparent border-none"
                    aria-label={`${t.register.removeService || 'Remove'} service ${idx + 2}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text" placeholder="Service Name" value={svc.name}
                    onChange={e => updateService(idx, 'name', e.target.value)}
                    className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/40 transition-all"
                  />
                  <input
                    type="number" step="0.001" min="0.001" placeholder="Price (USDC)" value={svc.price}
                    onChange={e => updateService(idx, 'price', e.target.value)}
                    className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/40 transition-all"
                  />
                </div>
                <input
                  type="url" placeholder="https://api.example.com/endpoint" value={svc.url}
                  onChange={e => updateService(idx, 'url', e.target.value)}
                  className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/40 transition-all"
                />
                <p className="text-[11px] text-amber-400/70 -mt-2">{t.register.urlHint || "Enter your API's direct endpoint URL, not a proxy or wrapper."}</p>
                <textarea
                  rows={2} placeholder="Description (optional)" value={svc.description}
                  onChange={e => updateService(idx, 'description', e.target.value)}
                  className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/40 transition-all resize-none"
                />
                <input
                  type="text" placeholder="Tags (comma-separated)" value={svc.tags}
                  onChange={e => updateService(idx, 'tags', e.target.value)}
                  className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/40 transition-all"
                />
              </div>
            ))}

            {/* Add another + counter */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={addService}
                disabled={totalServiceCount >= 50}
                className="text-sm text-[#FF9900] hover:text-[#FEBD69] transition-colors cursor-pointer bg-transparent border-none disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t.register.addAnother || '+ Add another tool'}
              </button>
              {totalServiceCount > 1 && (
                <span className="text-xs text-gray-500">
                  {totalServiceCount} / 50 {t.register.serviceCount || 'services'}
                </span>
              )}
            </div>

            {error && (
              <div role="alert" aria-live="assertive" className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-300 text-sm font-medium">
                {error}
              </div>
            )}

            {totalServiceCount === 1 ? (
              <button
                type="button"
                onClick={handleGoToStep3}
                className="w-full gradient-btn text-white py-3 rounded-xl font-medium
                           cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:glow-orange"
              >
                Next: Review &amp; Pay &rarr;
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBatchRegister}
                disabled={batchLoading}
                className="w-full gradient-btn text-white py-3 rounded-xl font-medium
                           cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:glow-orange
                           disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {batchLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing &amp; Registering...
                  </>
                ) : (
                  `${t.register.registerAll || 'Register All'} (${totalServiceCount} ${t.register.serviceCount || 'services'})`
                )}
              </button>
            )}
          </div>

          {/* Live Preview Card — 2 cols */}
          <div className="lg:col-span-2">
            <div className="sticky top-20">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">{t.register.previewTitle || 'Live Preview'}</p>
              <div className="glass-card rounded-xl p-4 transition-all duration-300">
                {/* Top row: logo + name + price */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-[#232f3e] flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-[#FF9900]">{previewInitial}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-white font-semibold text-sm leading-tight truncate">{previewName}</h3>
                      <span className="text-[11px] bg-[#FF9900]/10 text-[#FF9900] px-1.5 py-0.5 rounded border border-[#FF9900]/20 shrink-0">
                        {form.method}
                      </span>
                    </div>
                    <span className="inline-block text-xs mt-0.5 text-gray-400 capitalize">{categoryLabels[form.category]}</span>
                  </div>
                  <span className={`shrink-0 font-mono text-xs font-bold px-2.5 py-1 rounded-lg ${
                    previewPrice === 0
                      ? 'bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20'
                      : 'bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20'
                  }`}>
                    {previewPrice > 0 ? `$${previewPrice}` : (t.serviceCard?.free || 'Free')}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-xs mb-3 leading-relaxed line-clamp-2">{previewDesc}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {previewTags.map(tag => (
                    <span key={tag} className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-lg">{tag}</span>
                  ))}
                </div>

                {/* Owner */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-xs text-gray-500 font-mono">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x...'}
                  </span>
                  <span className="text-xs text-[#FF9900]">{t.serviceCard?.viewApi || 'View API'} &rarr;</span>
                </div>
              </div>

              {/* Checklist */}
              <div className="mt-4 space-y-2">
                <CheckItem done={form.name.trim().length > 0} label={t.register.checkName || 'Service name'} />
                <CheckItem done={form.url.trim().length > 0 && form.url.startsWith('http')} label={t.register.checkUrl || 'Valid URL'} />
                <CheckItem done={parseFloat(form.price) > 0} label={t.register.checkPrice || 'Price set'} />
                <CheckItem done={form.description.trim().length > 0} label={t.register.checkDesc || 'Description'} />
                <CheckItem done={form.requiredParams.trim().length > 0} label="Required params" />
                <CheckItem done={isConnected} label={t.register.checkWallet || 'Wallet connected'} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- STEP 3 — Review & Pay ---- */}
      {wizardStep === 3 && (
        <div className="max-w-lg mx-auto animate-fade-in-up">
          <div className="glass-card rounded-xl p-8 space-y-6">
            <h2 className="text-xl font-bold text-white text-center">Review &amp; Pay</h2>

            {/* Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-gray-400">Service name</span>
                <span className="text-sm text-white font-medium">{form.name}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-gray-400">API URL</span>
                <span className="text-sm text-white font-mono truncate max-w-[200px]">{form.url}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-gray-400">Price per call</span>
                <span className="text-sm text-[#FF9900] font-bold">${form.price} USDC</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-gray-400">Category</span>
                <span className="text-sm text-white capitalize">{categoryLabels[form.category]}</span>
              </div>
              {form.tags && (
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Tags</span>
                  <span className="text-sm text-white">{form.tags}</span>
                </div>
              )}
              {form.requiredParams.trim() && (
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Required params</span>
                  <span className="text-sm text-amber-300 font-mono">{form.requiredParams}</span>
                </div>
              )}
              {parseInt(form.freeCallsPerMonth, 10) > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Free calls/month</span>
                  <span className="text-sm text-emerald-400 font-medium">
                    {Math.min(parseInt(form.freeCallsPerMonth, 10), 1000)} per user
                  </span>
                </div>
              )}
            </div>

            {/* Registration cost */}
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">One-time registration deposit</p>
              <p className="text-2xl font-bold text-[#FF9900]">1 USDC</p>
              <p className="text-xs text-gray-500 mt-1">Anti-spam fee &middot; 95% revenue on all future calls</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-300 text-sm font-medium">
                {error}
              </div>
            )}

            {isProcessing && paymentStep > 0 && (
              <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 py-4">
                <div className="w-10 h-10 border-2 border-[#FF9900] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                <p className="text-white text-sm font-medium">{PAYMENT_STEPS[paymentStep]}</p>
                <p className="text-gray-400 text-xs">{t.register.stepOf || 'Step'} {paymentStep} / 4</p>
              </div>
            )}

            {isConfirming && (
              <div className="flex items-center justify-center gap-2 text-yellow-600 text-sm">
                <span className="animate-spin">⏳</span>
                Confirming on-chain...
              </div>
            )}
            {isConfirmed && (
              <div className="text-green-600 font-medium text-center text-sm">
                Transaction confirmed!
              </div>
            )}

            <div className="flex flex-col gap-3">
              <form onSubmit={handleSubmit}>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full gradient-btn disabled:opacity-40 text-white py-3 rounded-xl font-medium
                             cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:glow-orange
                             flex items-center justify-center gap-2"
                >
                  {isProcessing && (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {paymentState === 'paying' ? t.register.paying :
                   paymentState === 'registering' ? t.register.confirming :
                   `Register & Pay ${REGISTER_COST} USDC`}
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setPaymentState('idle');
                  setWizardStep(2);
                }}
                disabled={isProcessing}
                className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors duration-200
                           cursor-pointer bg-transparent border-none py-2"
              >
                &larr; Back to Configure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* What Happens Next */}
      <div className="mt-10 mb-2">
        <h2 className="text-lg font-bold text-white text-center mb-6">{t.register.whatHappensNext}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-5 text-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 bg-[#FF9900]/10 border border-[#FF9900]/20">
              <svg className="w-5 h-5 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="text-xs text-[#FF9900] font-semibold mb-1">1</div>
            <p className="text-white text-sm font-medium">{t.register.nextStep1}</p>
          </div>
          <div className="glass-card rounded-xl p-5 text-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 bg-[#FF9900]/10 border border-[#FF9900]/20">
              <svg className="w-5 h-5 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <div className="text-xs text-[#FF9900] font-semibold mb-1">2</div>
            <p className="text-white text-sm font-medium">{t.register.nextStep2}</p>
          </div>
          <div className="glass-card rounded-xl p-5 text-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 bg-[#FF9900]/10 border border-[#FF9900]/20">
              <svg className="w-5 h-5 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-xs text-[#FF9900] font-semibold mb-1">3</div>
            <p className="text-white text-sm font-medium">{t.register.nextStep3}</p>
          </div>
        </div>
      </div>

      {/* Template hint */}
      <div className="mt-8 glass rounded-xl p-5 border border-white/5 text-center">
        <p className="text-gray-400 text-sm mb-3">{t.register.templateHint}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="https://github.com/Wintyx57/x402-fast-monetization-template"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#FF9900] text-sm font-medium no-underline hover:text-[#FEBD69] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            {t.register.templateLink} &rarr;
          </a>
          <Link to="/for-providers" className="text-sm text-gray-400 hover:text-white no-underline transition-colors">
            {t.register.learnMore || 'Learn more about listing'} &rarr;
          </Link>
        </div>
      </div>

        </>
      )}
    </div>
  );
}
