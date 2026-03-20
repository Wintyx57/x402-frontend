import { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { API_URL } from '../config';
import { useTranslation } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import ChainSelector from '../components/ChainSelector';
import { trackEvent } from '../lib/analytics';
import EmbedSnippet from '../components/EmbedSnippet';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { CHAIN_CONFIG, USDC_ABI } from '../config';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';

const PRICE_PRESETS = [0.001, 0.005, 0.01];
const PAYLINK_PRICE_PRESETS = [0.001, 0.01, 0.05, 0.10, 1.00];
const CATEGORIES = ['ai', 'data', 'devtools', 'utility', 'social', 'finance', 'other'];
const METHODS = ['GET', 'POST'];

// ---- Step Indicator ----
function StepIndicator({ num, label, active, done, current }: { num: number; label: string; active: boolean; done?: boolean; current?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div aria-current={current ? 'step' : undefined} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border ${
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

// ---- Path Cards ----
interface PathCardProps {
  accent: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
  glowColor: string;
}

function PathCard({ accent, icon, title, description, cta, onClick, glowColor }: PathCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
      style={{ '--glow': glowColor } as React.CSSProperties}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${glowColor}20, 0 1px 0 rgba(255,255,255,0.1) inset`;
        (e.currentTarget as HTMLElement).style.borderColor = `${glowColor}40`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '';
        (e.currentTarget as HTMLElement).style.borderColor = '';
      }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}
      >
        <span style={{ color: accent }}>{icon}</span>
      </div>

      {/* Content */}
      <h2 className="text-white font-bold text-lg mb-2 leading-tight">{title}</h2>
      <p className="text-gray-400 text-sm leading-relaxed mb-5">{description}</p>

      {/* CTA */}
      <span
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-200 group-hover:gap-2.5"
        style={{ color: accent }}
      >
        {cta}
        <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </button>
  );
}

// ---- Back Bar ----
function BackBar({ modeLabel, modeColor, onBack }: { modeLabel: string; modeColor: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer bg-transparent border-none"
        aria-label="Back to monetization options"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to options
      </button>
      <span className="text-gray-700" aria-hidden="true">/</span>
      <span className="text-sm font-medium" style={{ color: modeColor }}>{modeLabel}</span>
    </div>
  );
}

// ============================================================
// Main Register Component
// ============================================================
type RegisterMode = 'none' | 'quick' | 'full' | 'paylink';

export default function Register() {
  const { address, isConnected, chain } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { openConnectModal } = useConnectModal();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialMode = (): RegisterMode => {
    const m = searchParams.get('mode');
    if (m === 'quick') return 'quick';
    if (m === 'full') return 'full';
    if (m === 'paylink') return 'paylink';
    return 'none';
  };

  const [mode, setMode] = useState<RegisterMode>(initialMode);

  useSEO({
    title: 'Monetize Anything — Earn USDC from AI Agents',
    description: 'Publish your API or content on x402 Bazaar and get paid in USDC by AI agents. 95% revenue, instant payments. Quick register, full wizard, OpenAPI import, or payment links.',
    keywords: 'monetize API x402, earn USDC from API, AI agent revenue, HTTP 402 provider, list API marketplace, payment link USDC',
  });

  // ---- Quick Register state ----
  const [quickForm, setQuickForm] = useState({ url: '', price: '', wallet: '' });
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickResult, setQuickResult] = useState<any>(null);
  const [quickError, setQuickError] = useState<string | null>(null);
  const { signMessageAsync } = useSignMessage();

  // ---- Full Register state ----
  const PAYMENT_STEPS = [
    '',
    t.register.step1,
    t.register.step2,
    t.register.step3,
    t.register.step4,
  ];
  const [form, setForm] = useState({
    name: '', description: '', url: '', price: '', tags: '', category: 'utility', method: 'GET', requiredParams: '', freeCallsPerMonth: ''
  });
  type ServiceFormData = {
    name: string; description: string; url: string; price: string;
    tags: string; category: string; method: string; requiredParams: string;
  };
  const [services, setServices] = useState<ServiceFormData[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<any>(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [paymentState, setPaymentState] = useState<'idle' | 'paying' | 'registering' | 'done' | 'error'>('idle');
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [result, setResult] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState(0);
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash ?? undefined });

  // ---- Payment Link state ----
  const [paylinkForm, setPaylinkForm] = useState({ title: '', description: '', targetUrl: '', price: '0.05', wallet: '' });
  const [paylinkLoading, setPaylinkLoading] = useState(false);
  const [paylinkResult, setPaylinkResult] = useState<{ id: string; share_url: string } | null>(null);
  const [paylinkError, setPaylinkError] = useState<string | null>(null);
  const [paylinkCopied, setPaylinkCopied] = useState(false);

  // Auto-fill wallet address when connected
  useEffect(() => {
    if (isConnected && address) {
      setQuickForm(prev => prev.wallet ? prev : { ...prev, wallet: address });
      setPaylinkForm(prev => prev.wallet ? prev : { ...prev, wallet: address });
    }
  }, [isConnected, address]);

  // Skip step 1 if wallet already connected
  useEffect(() => {
    if (isConnected) setWizardStep(2);
  }, [isConnected]);

  // =====================
  // Category labels
  // =====================
  const categoryLabels: Record<string, string> = {
    ai: t.register.catAi || 'AI & ML',
    data: t.register.catData || 'Data',
    devtools: t.register.catDevtools || 'Dev Tools',
    utility: t.register.catUtility || 'Utility',
    social: t.register.catSocial || 'Social',
    finance: t.register.catFinance || 'Finance',
    other: t.register.catOther || 'Other',
  };

  // =====================
  // Full form helpers
  // =====================
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
    setServices([...services, { name: '', description: '', url: '', price: '', tags: '', category: 'utility', method: 'GET', requiredParams: '' }]);
  };

  const removeService = (index: number) => setServices(services.filter((_, i) => i !== index));

  const updateService = (index: number, field: string, value: string) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const buildServicePayload = (svc: ServiceFormData) => {
    const userTags = svc.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    if (svc.category && !userTags.includes(svc.category)) userTags.unshift(svc.category);
    const payload: Record<string, unknown> = { name: svc.name, description: svc.description, url: svc.url, price: parseFloat(svc.price), tags: userTags };
    const params = svc.requiredParams.split(',').map(p => p.trim()).filter(Boolean);
    if (params.length > 0) payload.required_parameters = { required: params };
    return payload;
  };

  const buildPayload = () => {
    const payload: Record<string, unknown> = {
      name: form.name, description: form.description, url: form.url, price: parseFloat(form.price), tags: buildTags(), ownerAddress: address,
    };
    const params = form.requiredParams.split(',').map(p => p.trim()).filter(Boolean);
    if (params.length > 0) payload.required_parameters = { required: params };
    const freeCallsVal = parseInt(form.freeCallsPerMonth, 10);
    if (!isNaN(freeCallsVal) && freeCallsVal > 0) payload.free_calls_per_month = Math.min(freeCallsVal, 1000);
    return payload;
  };

  const handleGoToStep3 = () => {
    const validationError = validateForm();
    if (validationError) { setError(validationError as string); return; }
    setError(null);
    trackEvent('register_step', { step: '3_pay' });
    setWizardStep(3);
  };

  const isProcessing = paymentState === 'paying' || paymentState === 'registering';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setError(null);
    if (!isConnected || !address) { setError(t.register.connectError as string); return; }

    try {
      setPaymentState('paying');
      setPaymentStep(1);
      const timestamp = Date.now();
      const message = `batch-register:${address}:1:${timestamp}`;
      setPaymentStep(2);
      const signature = await signMessageAsync({ message });
      setPaymentState('registering');
      setPaymentStep(3);
      const res = await fetch(`${API_URL}/batch-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: [buildServicePayload(form)], ownerAddress: address, signature, timestamp }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || err.error || 'Registration failed'); }
      const data = await res.json();
      setResult(data);
      setPaymentState('done');
      setPaymentStep(0);
      trackEvent('register_success');
    } catch (err: unknown) {
      const e = err as Record<string, any>;
      const safeMessages = ['User rejected', 'Unexpected response'];
      const isSafe = safeMessages.some(m => e.message?.includes(m));
      setError(isSafe ? e.message : 'Registration failed. Please try again.');
      setPaymentState('error');
      setPaymentStep(0);
    }
  };

  const handleQuickRegister = async () => {
    setQuickError(null);
    if (!isConnected) { openConnectModal?.(); return setQuickError('Please connect your wallet first to sign the registration'); }
    try { new URL(quickForm.url); } catch { return setQuickError('Invalid URL format'); }
    const price = parseFloat(quickForm.price);
    if (isNaN(price) || price < 0.001 || price > 1000) return setQuickError('Price must be between 0.001 and 1000 USDC');
    if (!/^0x[a-fA-F0-9]{40}$/.test(quickForm.wallet)) return setQuickError('Invalid wallet address');

    setQuickLoading(true);
    try {
      const timestamp = Date.now();
      const message = `quick-register:${quickForm.url}:${quickForm.wallet}:${timestamp}`;
      const signature = await signMessageAsync({ message });
      const res = await fetch(`${API_URL}/quick-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: quickForm.url, price, ownerAddress: quickForm.wallet, signature, timestamp }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || err.message || 'Registration failed'); }
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
    const allServices = [form, ...services];
    for (let i = 0; i < allServices.length; i++) {
      const svc = allServices[i];
      if (!svc.name.trim()) return setError(`Service ${i + 1}: name is required`);
      try { new URL(svc.url); } catch { return setError(`Service ${i + 1}: invalid URL`); }
      const p = parseFloat(svc.price);
      if (isNaN(p) || p < 0.001 || p > 1000) return setError(`Service ${i + 1}: price must be 0.001-1000 USDC`);
    }
    if (!isConnected || !address) { setError(t.register.connectError as string); return; }
    setBatchLoading(true);
    setError(null);
    try {
      const timestamp = Date.now();
      const message = `batch-register:${address}:${allServices.length}:${timestamp}`;
      const signature = await signMessageAsync({ message });
      const res = await fetch(`${API_URL}/batch-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: allServices.map(svc => buildServicePayload(svc)), ownerAddress: address, signature, timestamp }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || err.message || 'Batch registration failed'); }
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

  // ---- Payment Link handler ----
  const handleCreatePaylink = async () => {
    setPaylinkError(null);
    if (!isConnected) { openConnectModal?.(); return; }
    if (!paylinkForm.title.trim()) return setPaylinkError('Title is required');
    try { new URL(paylinkForm.targetUrl); } catch { return setPaylinkError('Invalid content URL'); }
    const price = parseFloat(paylinkForm.price);
    if (isNaN(price) || price < 0.001 || price > 1000) return setPaylinkError('Price must be between 0.001 and 1000 USDC');
    if (!/^0x[a-fA-F0-9]{40}$/.test(paylinkForm.wallet)) return setPaylinkError('Invalid wallet address');

    setPaylinkLoading(true);
    try {
      const timestamp = Date.now();
      const message = `create-payment-link:${paylinkForm.wallet}:${timestamp}`;
      const signature = await signMessageAsync({ message });
      const res = await fetch(`${API_URL}/api/payment-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: paylinkForm.title,
          description: paylinkForm.description,
          targetUrl: paylinkForm.targetUrl,
          priceUsdc: price,
          ownerAddress: paylinkForm.wallet,
          signature,
          timestamp,
        }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || err.message || 'Failed to create payment link'); }
      const data = await res.json();
      setPaylinkResult(data);
      trackEvent('paylink_create_success');
    } catch (err: unknown) {
      setPaylinkError((err as Error).message || 'Failed to create payment link');
    } finally {
      setPaylinkLoading(false);
    }
  };

  const handleCopyPaylink = () => {
    if (!paylinkResult) return;
    navigator.clipboard.writeText(paylinkResult.payment_link?.paywall_url);
    setPaylinkCopied(true);
    setTimeout(() => setPaylinkCopied(false), 2000);
  };

  // =====================
  // Preview data (full mode)
  // =====================
  const previewName = form.name.trim() || 'My API';
  const previewDesc = form.description.trim() || (t.register.previewDescFallback || 'Your API description will appear here');
  const previewPrice = parseFloat(form.price) || 0;
  const previewTags = buildTags().slice(0, 3);
  const previewInitial = previewName.charAt(0).toUpperCase();

  // =====================
  // Full Register Success
  // =====================
  if (mode === 'full' && paymentState === 'done') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="glass glow-orange-lg rounded-2xl p-10 text-center animate-fade-in-up relative overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,153,0,0.15) 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full bg-[#34D399]/10 border-2 border-[#34D399]/30 flex items-center justify-center mx-auto mb-6 animate-fade-in-up">
              <svg className="w-10 h-10 text-[#34D399]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-[#FF9900] text-2xl font-bold mb-2 animate-fade-in-up delay-100">{t.register.successTitle}</div>
            <p className="text-white font-semibold text-lg mb-1 animate-fade-in-up delay-100">{result?.data?.name || 'Your API'}</p>
            <p className="text-gray-400 text-sm mb-8 animate-fade-in-up delay-200">{t.register.successDesc}</p>
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
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 gradient-btn text-white font-medium text-sm px-5 py-2.5 rounded-xl no-underline hover:brightness-110 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {t.register.viewTx}
                </a>
              )}
              <Link to="/services"
                className="inline-flex items-center gap-2 glass border border-white/15 text-gray-300 hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl no-underline transition-colors">
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

      {/* ===================== NONE MODE — Hero + Cards ===================== */}
      {mode === 'none' && (
        <div className="animate-fade-in-up">
          {/* Hero */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/20 text-[#FF9900] text-xs font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] animate-pulse" aria-hidden="true" />
              95% Revenue Share
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Monetize Anything<br />
              <span className="text-[#FF9900]">with x402</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
              APIs, content, data — set a price, earn USDC from AI agents worldwide.
              95% revenue, instant payments.
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid sm:grid-cols-2 gap-4 mb-10" role="list" aria-label="Monetization options">
            <div role="listitem">
              <PathCard
                accent="#34D399"
                glowColor="#34D399"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
                title="Quick Monetize"
                description="Paste a URL, set a price, done. Your API is live on the marketplace in 10 seconds. No payment required."
                cta="Get Started"
                onClick={() => { setMode('quick'); trackEvent('register_mode', { mode: 'quick' }); }}
              />
            </div>
            <div role="listitem">
              <PathCard
                accent="#60A5FA"
                glowColor="#60A5FA"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
                title="Full Registration"
                description="Detailed form with description, tags, parameters, and category. Best for discoverability and serious providers."
                cta="Get Started"
                onClick={() => { setMode('full'); trackEvent('register_mode', { mode: 'full' }); }}
              />
            </div>
            <div role="listitem">
              <PathCard
                accent="#FF9900"
                glowColor="#FF9900"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                }
                title="Import OpenAPI"
                description="Upload your OpenAPI/Swagger spec and list 100+ API endpoints in 2 minutes. Bulk registration made simple."
                cta="Import Spec"
                onClick={() => navigate('/import')}
              />
            </div>
            <div role="listitem">
              <PathCard
                accent="#A78BFA"
                glowColor="#A78BFA"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                }
                title="Payment Link"
                description="Paywall any URL. Share a link, get paid in USDC. Perfect for reports, datasets, or exclusive content."
                cta="Create Link"
                onClick={() => { setMode('paylink'); trackEvent('register_mode', { mode: 'paylink' }); }}
              />
            </div>
          </div>

          {/* Bottom hint */}
          <div className="glass rounded-xl p-5 border border-white/5 text-center">
            <p className="text-gray-400 text-sm mb-3">{t.register.templateHint}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://github.com/Wintyx57/x402-fast-monetization-template"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#FF9900] text-sm font-medium no-underline hover:text-[#FEBD69] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                {t.register.templateLink} &rarr;
              </a>
              <Link to="/for-providers" className="text-sm text-gray-400 hover:text-white no-underline transition-colors">
                {t.register.learnMore || 'Learn more about listing'} &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ===================== QUICK MODE ===================== */}
      {mode === 'quick' && (
        <div className="animate-fade-in-up">
          <BackBar modeLabel="Quick Monetize" modeColor="#34D399" onBack={() => setMode('none')} />

          {!quickResult ? (
            <div className="max-w-lg mx-auto">
              <h1 className="text-3xl font-bold text-white mb-2">
                {t.quickRegister?.title || 'Monetize Any API in 10 Seconds'}
              </h1>
              <p className="text-gray-400 mb-8">
                {t.quickRegister?.subtitle || 'Paste your URL, set a price, start earning. No payment required.'}
              </p>

              <div className="glass-card rounded-xl p-8 space-y-6">
                {/* URL */}
                <div>
                  <label htmlFor="quick-url" className="block text-sm text-gray-300 mb-1.5">API URL</label>
                  <input
                    id="quick-url" type="url" required value={quickForm.url}
                    onChange={e => setQuickForm({ ...quickForm, url: e.target.value })}
                    placeholder="https://api.example.com/endpoint"
                    aria-describedby="url-hint-quick"
                    className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-3 text-white text-lg placeholder-gray-600 focus:outline-none focus:border-[#34D399]/40 transition-all duration-300"
                  />
                  <p className="text-[11px] text-amber-400/70 mt-1" id="url-hint-quick">
                    {t.register.urlHint || "Enter your API's direct endpoint URL, not a proxy or wrapper."}
                  </p>
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="quick-price" className="block text-sm text-gray-300 mb-1.5">Price per call (USDC)</label>
                  <div className="flex gap-2 mb-2">
                    {PRICE_PRESETS.map(p => (
                      <button key={p} type="button" onClick={() => setQuickForm({ ...quickForm, price: String(p) })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                          quickForm.price === String(p)
                            ? 'bg-[#34D399]/10 text-[#34D399] border-[#34D399]/30'
                            : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                        }`}>
                        ${p}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <input
                      id="quick-price" type="number" step="0.001" min="0.001" required value={quickForm.price}
                      onChange={e => setQuickForm({ ...quickForm, price: e.target.value })}
                      placeholder="0.01"
                      className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg pl-4 pr-14 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#34D399]/40 transition-all duration-300"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none font-mono">USDC</span>
                  </div>
                </div>

                {/* Wallet */}
                <div>
                  <label htmlFor="quick-wallet" className="block text-sm text-gray-300 mb-1.5">Your Wallet Address</label>
                  <div className="flex gap-2">
                    <input
                      id="quick-wallet" type="text" required value={quickForm.wallet}
                      onChange={e => setQuickForm({ ...quickForm, wallet: e.target.value })}
                      placeholder="0x..."
                      className="flex-1 bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-[#34D399]/40 transition-all duration-300"
                    />
                    {isConnected && address && (
                      <button type="button" onClick={() => setQuickForm({ ...quickForm, wallet: address })}
                        className="px-3 py-2.5 rounded-lg text-xs bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20 hover:bg-[#34D399]/20 transition-colors cursor-pointer whitespace-nowrap">
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

                <button onClick={handleQuickRegister} disabled={quickLoading}
                  className="w-full gradient-btn text-white py-3 rounded-xl font-medium cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:glow-orange disabled:opacity-40 flex items-center justify-center gap-2">
                  {quickLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Registering...
                    </>
                  ) : 'Monetize this API'}
                </button>

                <p className="text-xs text-gray-500 text-center">No payment required · Rate limited to prevent spam</p>
              </div>
            </div>
          ) : (
            /* Quick Success */
            <div className="max-w-2xl mx-auto animate-fade-in-up">
              <div className="glass glow-orange-lg rounded-2xl p-10 text-center relative overflow-hidden">
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,153,0,0.15) 0%, transparent 70%)' }} />
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-full bg-[#34D399]/10 border-2 border-[#34D399]/30 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-[#34D399]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-[#FF9900] text-2xl font-bold mb-2">API Listed!</h2>
                  <p className="text-gray-400 text-sm mb-6">Your API is live on x402 Bazaar. AI agents can now discover and pay for it.</p>
                  <div className="glass rounded-xl p-4 mb-6 text-left">
                    <p className="text-xs text-gray-400 mb-2">x402 Proxy Endpoint</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm text-[#FF9900] font-mono flex-1 truncate">{quickResult.proxy_url}</code>
                      <button onClick={() => navigator.clipboard.writeText(quickResult.proxy_url)}
                        className="px-3 py-1.5 rounded-lg text-xs bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20 hover:bg-[#FF9900]/20 transition-colors cursor-pointer">
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="mb-6">
                    <EmbedSnippet serviceId={quickResult.data?.id} serviceName={quickResult.data?.name} />
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link to={`/services/${quickResult.data?.id}`}
                      className="inline-flex items-center gap-2 gradient-btn text-white font-medium text-sm px-5 py-2.5 rounded-xl no-underline hover:brightness-110 transition-all">
                      View Service Page &rarr;
                    </Link>
                    <button onClick={() => { setQuickResult(null); setQuickForm({ url: '', price: '', wallet: '' }); }}
                      className="inline-flex items-center gap-2 glass border border-white/15 text-gray-300 hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors cursor-pointer">
                      Register Another
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== FULL MODE ===================== */}
      {mode === 'full' && !batchResult && (
        <div className="animate-fade-in-up">
          <BackBar modeLabel="Full Registration" modeColor="#60A5FA" onBack={() => setMode('none')} />

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{t.register.title}</h1>
          <p className="text-gray-400 mb-2">{t.register.subtitle}</p>
          <p className="text-sm text-[#FF9900]/80 font-medium mb-8">
            Free registration &middot; 95% revenue share on all calls
          </p>

          {/* Progress bar */}
          <div className="flex items-center gap-4 mb-10" role="list" aria-label="Registration steps">
            <div role="listitem"><StepIndicator num={1} label="Connect" active={wizardStep >= 1} done={wizardStep > 1} current={wizardStep === 1} /></div>
            <div className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${wizardStep >= 2 ? 'bg-[#FF9900]/50' : 'bg-white/10'}`} aria-hidden="true" />
            <div role="listitem"><StepIndicator num={2} label="Configure" active={wizardStep >= 2} done={wizardStep > 2} current={wizardStep === 2} /></div>
            <div className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${wizardStep >= 3 ? 'bg-[#FF9900]/50' : 'bg-white/10'}`} aria-hidden="true" />
            <div role="listitem"><StepIndicator num={3} label="Confirm" active={wizardStep >= 3} current={wizardStep === 3} /></div>
          </div>

          {/* Step 1 — Connect */}
          {wizardStep === 1 && (
            <div className="max-w-lg mx-auto animate-fade-in-up">
              <div className="glass-card rounded-xl p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/20 flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h2>
                  <p className="text-gray-400 text-sm">Connect your wallet to verify ownership and register your API for free.</p>
                </div>
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
                  onClick={() => { trackEvent('register_step', { step: '1_connect' }); setWizardStep(2); }}
                  className="w-full gradient-btn text-white py-3 rounded-xl font-medium cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:glow-orange">
                  Connect Wallet
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Configure */}
          {wizardStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in-up delay-200">
              <div className="space-y-5 lg:col-span-3">
                <ChainSelector />
                <div>
                  <label htmlFor="reg-name" className="block text-sm text-gray-300 mb-1.5">{t.register.serviceName}</label>
                  <input id="reg-name" type="text" required aria-required="true" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder={t.register.namePlaceholder}
                    className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300"
                  />
                </div>
                <div>
                  <label htmlFor="reg-desc" className="block text-sm text-gray-300 mb-1.5">{t.register.description}</label>
                  <textarea id="reg-desc" rows={3} value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder={t.register.descPlaceholder}
                    className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300 resize-none"
                  />
                </div>
                <div>
                  <label htmlFor="reg-url" className="block text-sm text-gray-300 mb-1.5">{t.register.apiUrl}</label>
                  <input id="reg-url" type="url" required aria-required="true" value={form.url}
                    onChange={e => setForm({ ...form, url: e.target.value })}
                    placeholder={t.register.urlPlaceholder}
                    aria-describedby="url-hint-full"
                    className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300"
                  />
                  <p className="text-[11px] text-amber-400/70 mt-1" id="url-hint-full">
                    {t.register.urlHint || "Enter your API's direct endpoint URL, not a proxy or wrapper."}
                  </p>
                </div>

                {/* Category + Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-category" className="block text-sm text-gray-300 mb-1.5">{t.register.categoryLabel || 'Category'}</label>
                    <select id="reg-category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300 cursor-pointer">
                      {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-[#1a1f2e]">{categoryLabels[cat]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">{t.register.methodLabel || 'HTTP Method'}</label>
                    <div className="flex gap-2">
                      {METHODS.map(m => (
                        <button key={m} type="button" aria-pressed={form.method === m} onClick={() => setForm({ ...form, method: m })}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-mono font-medium transition-all duration-200 cursor-pointer border ${
                            form.method === m ? 'bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/30' : 'bg-[#1a1f2e] text-gray-500 border-white/10 hover:text-gray-300 hover:border-white/20'
                          }`}>{m}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price + Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-price" className="flex items-center text-sm text-gray-400 mb-1.5">
                      {t.register.priceLabel}
                      <FieldTooltip tip="Price per API call in USDC. Min 0.001 USDC. AI agents will pay this amount automatically per request. Suggested: 0.001–0.05 USDC for standard APIs.">?</FieldTooltip>
                    </label>
                    <div className="relative">
                      <input id="reg-price" type="number" step="0.001" min="0.001" required aria-required="true" value={form.price}
                        onChange={e => setForm({ ...form, price: e.target.value })}
                        placeholder={t.register.pricePlaceholder}
                        className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg pl-4 pr-14 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300"
                        aria-describedby="price-hint"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none font-mono">USDC</span>
                    </div>
                    <p id="price-hint" className="text-[11px] text-gray-400 mt-1">0.001 – 1000 USDC per call</p>
                  </div>
                  <div>
                    <label htmlFor="reg-tags" className="flex items-center text-sm text-gray-400 mb-1.5">
                      {t.register.tagsLabel}
                      <FieldTooltip tip="Comma-separated keywords to help agents discover your API. Max 10 tags, 50 chars each. Example: weather, forecast, realtime">?</FieldTooltip>
                    </label>
                    <input id="reg-tags" type="text" value={form.tags}
                      onChange={e => setForm({ ...form, tags: e.target.value })}
                      placeholder={t.register.tagsPlaceholder}
                      className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300"
                      aria-describedby="tags-hint"
                    />
                    <p id="tags-hint" className="text-[11px] text-gray-400 mt-1">Comma-separated · max 10 tags</p>
                  </div>
                </div>

                {/* Required Params */}
                <div>
                  <label htmlFor="reg-params" className="flex items-center text-sm text-gray-400 mb-1.5">
                    Required Parameters
                    <FieldTooltip tip="Comma-separated list of parameters your API requires. This prevents AI agents from calling your API without the right params (and wasting USDC). Example: city, country">?</FieldTooltip>
                  </label>
                  <input id="reg-params" type="text" value={form.requiredParams}
                    onChange={e => setForm({ ...form, requiredParams: e.target.value })}
                    placeholder="e.g. city, latitude, longitude"
                    className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300"
                    aria-describedby="params-hint"
                  />
                  <p id="params-hint" className="text-[11px] text-gray-400 mt-1">Comma-separated · Prevents failed calls &amp; wasted USDC</p>
                </div>

                {/* Free Calls */}
                <div>
                  <label htmlFor="reg-free-calls" className="flex items-center text-sm text-gray-400 mb-1.5">
                    Free Calls per Month
                    <FieldTooltip tip="Offer X free calls per user per month. When quota is reached, normal USDC payment applies. Set to 0 to disable free tier. Max 1000. Great for user acquisition.">?</FieldTooltip>
                  </label>
                  <div className="relative">
                    <input id="reg-free-calls" type="number" min="0" max="1000" step="1" value={form.freeCallsPerMonth}
                      onChange={e => setForm({ ...form, freeCallsPerMonth: e.target.value })}
                      placeholder="0"
                      className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg pl-4 pr-20 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/40 transition-all duration-300"
                      aria-describedby="free-calls-hint"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none font-mono">calls/mo</span>
                  </div>
                  <p id="free-calls-hint" className="text-[11px] text-gray-400 mt-1">0 = disabled · max 1000 · resets monthly per user</p>
                </div>

                {/* Additional services */}
                {services.map((svc, idx) => (
                  <div key={idx} className="glass rounded-xl p-4 space-y-3 border border-white/10 relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#FF9900] font-semibold">Service {idx + 2}</span>
                      <button type="button" onClick={() => removeService(idx)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer bg-transparent border-none"
                        aria-label={`${t.register.removeService || 'Remove'} service ${idx + 2}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" placeholder="Service Name" value={svc.name} onChange={e => updateService(idx, 'name', e.target.value)}
                        className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/40 transition-all" />
                      <input type="number" step="0.001" min="0.001" placeholder="Price (USDC)" value={svc.price} onChange={e => updateService(idx, 'price', e.target.value)}
                        className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/40 transition-all" />
                    </div>
                    <input type="url" placeholder="https://api.example.com/endpoint" value={svc.url} onChange={e => updateService(idx, 'url', e.target.value)}
                      className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/40 transition-all" />
                    <p className="text-[11px] text-amber-400/70 -mt-2">{t.register.urlHint || "Enter your API's direct endpoint URL, not a proxy or wrapper."}</p>
                    <textarea rows={2} placeholder="Description (optional)" value={svc.description} onChange={e => updateService(idx, 'description', e.target.value)}
                      className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/40 transition-all resize-none" />
                    <input type="text" placeholder="Tags (comma-separated)" value={svc.tags} onChange={e => updateService(idx, 'tags', e.target.value)}
                      className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/40 transition-all" />
                  </div>
                ))}

                <div className="flex items-center justify-between">
                  <button type="button" onClick={addService} disabled={totalServiceCount >= 50}
                    className="text-sm text-[#FF9900] hover:text-[#FEBD69] transition-colors cursor-pointer bg-transparent border-none disabled:opacity-40 disabled:cursor-not-allowed">
                    {t.register.addAnother || '+ Add another tool'}
                  </button>
                  {totalServiceCount > 1 && (
                    <span className="text-xs text-gray-500">{totalServiceCount} / 50 {t.register.serviceCount || 'services'}</span>
                  )}
                </div>

                {error && (
                  <div role="alert" aria-live="assertive" className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-300 text-sm font-medium">{error}</div>
                )}

                {totalServiceCount === 1 ? (
                  <button type="button" onClick={handleGoToStep3}
                    className="w-full gradient-btn text-white py-3 rounded-xl font-medium cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:glow-orange">
                    Next: Review &amp; Confirm &rarr;
                  </button>
                ) : (
                  <button type="button" onClick={handleBatchRegister} disabled={batchLoading}
                    className="w-full gradient-btn text-white py-3 rounded-xl font-medium cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:glow-orange disabled:opacity-40 flex items-center justify-center gap-2">
                    {batchLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

              {/* Live Preview */}
              <div className="lg:col-span-2">
                <div className="sticky top-20">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">{t.register.previewTitle || 'Live Preview'}</p>
                  <div className="glass-card rounded-xl p-4 transition-all duration-300">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[#232f3e] flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-[#FF9900]">{previewInitial}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-white font-semibold text-sm leading-tight truncate">{previewName}</h3>
                          <span className="text-[11px] bg-[#FF9900]/10 text-[#FF9900] px-1.5 py-0.5 rounded border border-[#FF9900]/20 shrink-0">{form.method}</span>
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
                    <p className="text-gray-400 text-xs mb-3 leading-relaxed line-clamp-2">{previewDesc}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {previewTags.map(tag => (
                        <span key={tag} className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-lg">{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-xs text-gray-500 font-mono">
                        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x...'}
                      </span>
                      <span className="text-xs text-[#FF9900]">{t.serviceCard?.viewApi || 'View API'} &rarr;</span>
                    </div>
                  </div>
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

          {/* Step 3 — Confirm */}
          {wizardStep === 3 && (
            <div className="max-w-lg mx-auto animate-fade-in-up">
              <div className="glass-card rounded-xl p-8 space-y-6">
                <h2 className="text-xl font-bold text-white text-center">Review &amp; Confirm</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Service name', value: form.name },
                    { label: 'API URL', value: form.url, mono: true },
                    { label: 'Price per call', value: `$${form.price} USDC`, accent: true },
                    { label: 'Category', value: categoryLabels[form.category] },
                    form.tags ? { label: 'Tags', value: form.tags } : null,
                    form.requiredParams.trim() ? { label: 'Required params', value: form.requiredParams, warn: true } : null,
                    parseInt(form.freeCallsPerMonth, 10) > 0 ? { label: 'Free calls/month', value: `${Math.min(parseInt(form.freeCallsPerMonth, 10), 1000)} per user`, green: true } : null,
                  ].filter(Boolean).map((item: any) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-400">{item.label}</span>
                      <span className={`text-sm font-medium truncate max-w-[200px] ${
                        item.accent ? 'text-[#FF9900] font-bold' :
                        item.warn ? 'text-amber-300 font-mono' :
                        item.green ? 'text-emerald-400' :
                        item.mono ? 'text-white font-mono' : 'text-white'
                      }`}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="glass rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">Registration</p>
                  <p className="text-2xl font-bold text-[#34D399]">Free</p>
                  <p className="text-xs text-gray-500 mt-1">Wallet signature only &middot; 95% revenue on all future calls</p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-300 text-sm font-medium">{error}</div>
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
                    <span className="animate-spin" aria-hidden="true">⏳</span> Confirming on-chain...
                  </div>
                )}
                {isConfirmed && (
                  <div className="text-green-600 font-medium text-center text-sm">Transaction confirmed!</div>
                )}

                <div className="flex flex-col gap-3">
                  <form onSubmit={handleSubmit}>
                    <button type="submit" disabled={isProcessing}
                      className="w-full gradient-btn disabled:opacity-40 text-white py-3 rounded-xl font-medium cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:glow-orange flex items-center justify-center gap-2">
                      {isProcessing && (
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      )}
                      {paymentState === 'paying' ? t.register.paying :
                       paymentState === 'registering' ? t.register.confirming :
                       'Register API'}
                    </button>
                  </form>
                  <button type="button" onClick={() => { setError(null); setPaymentState('idle'); setWizardStep(2); }} disabled={isProcessing}
                    className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors duration-200 cursor-pointer bg-transparent border-none py-2">
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
              {[
                { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />, step: '1', text: t.register.nextStep1 },
                { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />, step: '2', text: t.register.nextStep2 },
                { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />, step: '3', text: t.register.nextStep3 },
              ].map((item) => (
                <div key={item.step} className="glass-card rounded-xl p-5 text-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 bg-[#FF9900]/10 border border-[#FF9900]/20">
                    <svg className="w-5 h-5 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">{item.icon}</svg>
                  </div>
                  <div className="text-xs text-[#FF9900] font-semibold mb-1">{item.step}</div>
                  <p className="text-white text-sm font-medium">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== FULL — Batch Success ===================== */}
      {mode === 'full' && batchResult && (
        <div className="animate-fade-in-up">
          <BackBar modeLabel="Full Registration" modeColor="#60A5FA" onBack={() => setMode('none')} />
          <div className="max-w-2xl mx-auto">
            <div className="glass glow-orange-lg rounded-2xl p-10 text-center relative overflow-hidden">
              <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,153,0,0.15) 0%, transparent 70%)' }} />
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-full bg-[#34D399]/10 border-2 border-[#34D399]/30 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-[#34D399]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                      <Link to={`/services/${svc.id}`} className="text-xs text-[#FF9900] no-underline hover:text-[#FEBD69]">View &rarr;</Link>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to="/services"
                    className="inline-flex items-center gap-2 gradient-btn text-white font-medium text-sm px-5 py-2.5 rounded-xl no-underline hover:brightness-110 transition-all">
                    {t.register.viewServices || 'View all services'} &rarr;
                  </Link>
                  <button onClick={() => { setBatchResult(null); setServices([]); setForm({ name: '', description: '', url: '', price: '', tags: '', category: 'utility', method: 'GET', requiredParams: '', freeCallsPerMonth: '' }); }}
                    className="inline-flex items-center gap-2 glass border border-white/15 text-gray-300 hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors cursor-pointer">
                    Register More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== PAYLINK MODE ===================== */}
      {mode === 'paylink' && (
        <div className="animate-fade-in-up">
          <BackBar modeLabel="Payment Link" modeColor="#A78BFA" onBack={() => setMode('none')} />

          {!paylinkResult ? (
            <div className="max-w-lg mx-auto">
              <h1 className="text-3xl font-bold text-white mb-2">
                {(t.paymentLinks as any)?.title || 'Create a Payment Link'}
              </h1>
              <p className="text-gray-400 mb-8">
                {(t.paymentLinks as any)?.description || 'Paywall any URL. Share a link, get paid in USDC. Recipients pay once to unlock the content.'}
              </p>

              <div className="glass-card rounded-xl p-8 space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="paylink-title" className="block text-sm text-gray-300 mb-1.5">
                    {(t.paymentLinks as any)?.titleLabel || 'Link Title'}
                    <span className="text-red-400 ml-1" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="paylink-title" type="text" required value={paylinkForm.title}
                    onChange={e => setPaylinkForm({ ...paylinkForm, title: e.target.value })}
                    placeholder="My Premium Report"
                    className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#A78BFA]/40 transition-all duration-300"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="paylink-desc" className="block text-sm text-gray-300 mb-1.5">
                    Description
                    <span className="text-gray-500 text-xs ml-2">(optional)</span>
                  </label>
                  <textarea
                    id="paylink-desc" rows={2} value={paylinkForm.description}
                    onChange={e => setPaylinkForm({ ...paylinkForm, description: e.target.value })}
                    placeholder="Access our Q4 analysis with exclusive data..."
                    className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#A78BFA]/40 transition-all duration-300 resize-none"
                  />
                </div>

                {/* Target URL */}
                <div>
                  <label htmlFor="paylink-url" className="block text-sm text-gray-300 mb-1.5">
                    {(t.paymentLinks as any)?.contentUrl || 'Content URL'}
                    <span className="text-red-400 ml-1" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="paylink-url" type="url" required value={paylinkForm.targetUrl}
                    onChange={e => setPaylinkForm({ ...paylinkForm, targetUrl: e.target.value })}
                    placeholder="https://example.com/my-premium-report"
                    className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#A78BFA]/40 transition-all duration-300"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">The URL that will be revealed after payment</p>
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="paylink-price" className="block text-sm text-gray-300 mb-1.5">
                    {(t.paymentLinks as any)?.price || 'Price (USDC)'}
                  </label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {PAYLINK_PRICE_PRESETS.map(p => (
                      <button key={p} type="button" onClick={() => setPaylinkForm({ ...paylinkForm, price: String(p) })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                          paylinkForm.price === String(p)
                            ? 'bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/30'
                            : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                        }`}>
                        ${p}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <input
                      id="paylink-price" type="number" step="0.001" min="0.001" required value={paylinkForm.price}
                      onChange={e => setPaylinkForm({ ...paylinkForm, price: e.target.value })}
                      placeholder="0.05"
                      className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg pl-4 pr-14 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#A78BFA]/40 transition-all duration-300"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none font-mono">USDC</span>
                  </div>
                </div>

                {/* Wallet */}
                <div>
                  <label htmlFor="paylink-wallet" className="block text-sm text-gray-300 mb-1.5">
                    Your Wallet (receives payments)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="paylink-wallet" type="text" required value={paylinkForm.wallet}
                      onChange={e => setPaylinkForm({ ...paylinkForm, wallet: e.target.value })}
                      placeholder="0x..."
                      className="flex-1 bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-[#A78BFA]/40 transition-all duration-300"
                    />
                    {isConnected && address && (
                      <button type="button" onClick={() => setPaylinkForm({ ...paylinkForm, wallet: address })}
                        className="px-3 py-2.5 rounded-lg text-xs bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/20 hover:bg-[#A78BFA]/20 transition-colors cursor-pointer whitespace-nowrap">
                        Use Connected
                      </button>
                    )}
                  </div>
                </div>

                {paylinkError && (
                  <div role="alert" className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-300 text-sm">
                    {paylinkError}
                  </div>
                )}

                <button
                  onClick={handleCreatePaylink}
                  disabled={paylinkLoading}
                  className="w-full py-3 rounded-xl font-medium text-white text-sm cursor-pointer transition-all duration-300 hover:scale-[1.02] disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{ background: paylinkLoading ? undefined : 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)', boxShadow: paylinkLoading ? undefined : '0 0 20px rgba(167,139,250,0.2)' }}
                >
                  {paylinkLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {(t.paymentLinks as any)?.creating || 'Creating...'}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      {(t.paymentLinks as any)?.create || 'Create Payment Link'}
                    </>
                  )}
                </button>

                {!isConnected && (
                  <p className="text-xs text-gray-500 text-center">
                    You'll need to connect your wallet to sign the request.
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Paylink Success */
            <div className="max-w-lg mx-auto animate-fade-in-up">
              <div className="glass rounded-2xl p-10 text-center relative overflow-hidden border border-[#A78BFA]/20"
                style={{ boxShadow: '0 0 40px rgba(167,139,250,0.1)' }}>
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(167,139,250,0.15) 0%, transparent 70%)' }} />
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-full bg-[#34D399]/10 border-2 border-[#34D399]/30 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-[#34D399]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-[#A78BFA] text-2xl font-bold mb-2">
                    {(t.paymentLinks as any)?.success || 'Payment Link Created!'}
                  </h2>
                  <p className="text-gray-400 text-sm mb-8">Share this link and get paid in USDC when anyone accesses your content.</p>

                  <div className="glass rounded-xl p-4 mb-6 text-left">
                    <p className="text-xs text-gray-400 mb-2">
                      {(t.paymentLinks as any)?.shareLink || 'Share this link'}
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm text-[#A78BFA] font-mono flex-1 truncate">{paylinkResult.payment_link?.paywall_url}</code>
                      <button
                        onClick={handleCopyPaylink}
                        className="px-3 py-1.5 rounded-lg text-xs bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/20 hover:bg-[#A78BFA]/20 transition-colors cursor-pointer whitespace-nowrap"
                        aria-label="Copy payment link"
                      >
                        {paylinkCopied ? 'Copied!' : (t.paymentLinks as any)?.copyLink || 'Copy Link'}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => { setPaylinkResult(null); setPaylinkForm({ title: '', description: '', targetUrl: '', price: '0.05', wallet: address || '' }); }}
                      className="inline-flex items-center gap-2 gradient-btn text-white font-medium text-sm px-5 py-2.5 rounded-xl cursor-pointer transition-all hover:brightness-110"
                    >
                      {(t.paymentLinks as any)?.createAnother || 'Create Another'}
                    </button>
                    <Link to="/my-apis"
                      className="inline-flex items-center gap-2 glass border border-white/15 text-gray-300 hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl no-underline transition-colors">
                      {(t.paymentLinks as any)?.viewMyLinks || 'View My Links'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
