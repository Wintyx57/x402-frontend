import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { API_URL, USDC_ABI, CHAIN_CONFIG } from '../config';
import { useTranslation } from '../i18n/LanguageContext';

const REGISTER_COST = 1;

export default function Register() {
  const { address, isConnected, chain } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { t } = useTranslation();

  const PAYMENT_STEPS = [
    '', // 0 = idle
    t.register.step1,
    t.register.step2,
    t.register.step3,
    t.register.step4,
  ];

  const [form, setForm] = useState({
    name: '', description: '', url: '', price: '', tags: ''
  });
  const [step, setStep] = useState('form');
  const [txHash, setTxHash] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [paymentStep, setPaymentStep] = useState(0);

  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const validateForm = () => {
    if (!form.name.trim() || form.name.length > 200) return 'Service name is required (max 200 chars)';
    if (form.description && form.description.length > 1000) return 'Description too long (max 1000 chars)';
    try {
      const parsed = new URL(form.url);
      if (!['http:', 'https:'].includes(parsed.protocol)) return 'Only HTTP/HTTPS URLs are allowed';
    } catch {
      return 'Invalid URL format';
    }
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0.01 || price > 1000) return 'Price must be between 0.01 and 1000 USDC';
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (tags.length > 10) return 'Maximum 10 tags allowed';
    if (tags.some(t => t.length > 50)) return 'Each tag max 50 chars';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isConnected) {
      setError(t.register.connectError);
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setStep('paying');
      setPaymentStep(1);
      const res402 = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          url: form.url,
          price: parseFloat(form.price),
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          ownerAddress: address,
        }),
      });

      if (res402.status !== 402) {
        throw new Error(`Unexpected response: ${res402.status}`);
      }

      const { payment_details } = await res402.json();

      // Resolve USDC contract and RPC from user's current chain
      const currentChainConfig = CHAIN_CONFIG[chain?.id] || CHAIN_CONFIG[8453];
      const usdcContract = currentChainConfig.usdcContract;

      setPaymentStep(2);
      const hash = await writeContractAsync({
        address: usdcContract,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [
          payment_details.recipient,
          parseUnits(String(payment_details.amount), 6),
        ],
      });

      setTxHash(hash);
      setStep('registering');
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
        } catch {}
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
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          url: form.url,
          price: parseFloat(form.price),
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          ownerAddress: address,
        }),
      });

      if (!resRegister.ok) {
        const err = await resRegister.json();
        throw new Error(err.message || err.error || 'Registration failed');
      }

      const data = await resRegister.json();
      setResult(data);
      setStep('done');
      setPaymentStep(0);
    } catch (err) {
      const safeMessages = ['Transaction not confirmed', 'User rejected', 'Unexpected response'];
      const isSafe = safeMessages.some(m => err.message?.includes(m));
      setError(isSafe ? err.message : 'Registration failed. Please try again.');
      setStep('error');
      setPaymentStep(0);
    }
  };

  const isProcessing = step === 'paying' || step === 'registering';

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 animate-fade-in-up">{t.register.title}</h1>
      <p className="text-gray-500 mb-8 animate-fade-in-up delay-100">
        {t.register.subtitle.replace('{cost}', REGISTER_COST)}
      </p>

      {step === 'done' ? (
        <div className="glass glow-orange rounded-xl p-8 text-center animate-fade-in-up">
          <div className="text-[#FF9900] text-2xl font-bold mb-3">{t.register.successTitle}</div>
          <p className="text-gray-400 text-sm mb-5">{result?.data?.name} {t.register.successDesc}</p>
          {txHash && (
            <a
              href={`${(CHAIN_CONFIG[chain?.id] || CHAIN_CONFIG[8453]).explorer}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-text font-medium text-sm no-underline"
            >
              {t.register.viewTx}
            </a>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up delay-200">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">{t.register.serviceName}</label>
            <input
              type="text" required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder={t.register.namePlaceholder}
              className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600
                         focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">{t.register.description}</label>
            <textarea
              rows={3} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder={t.register.descPlaceholder}
              className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600
                         focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">{t.register.apiUrl}</label>
            <input
              type="url" required value={form.url}
              onChange={e => setForm({ ...form, url: e.target.value })}
              placeholder={t.register.urlPlaceholder}
              className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600
                         focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t.register.priceLabel}</label>
              <input
                type="number" step="0.01" min="0.01" required value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder={t.register.pricePlaceholder}
                className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600
                           focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t.register.tagsLabel}</label>
              <input
                type="text" value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
                placeholder={t.register.tagsPlaceholder}
                className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600
                           focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-300 text-sm font-medium">
              {error}
            </div>
          )}

          {isProcessing && paymentStep > 0 && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-8 h-8 border-2 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-sm font-medium">{PAYMENT_STEPS[paymentStep]}</p>
              <p className="text-gray-500 text-xs">Step {paymentStep} of 4</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full gradient-btn disabled:opacity-40 text-white py-3 rounded-xl font-medium
                       cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:glow-orange"
          >
            {step === 'paying' ? t.register.paying :
             step === 'registering' ? t.register.confirming :
             `${t.register.submitButton} (${REGISTER_COST} USDC)`}
          </button>

          {!isConnected && (
            <p className="text-orange-400 text-sm text-center">{t.register.connectFirst}</p>
          )}
        </form>
      )}

      {/* What Happens Next */}
      <div className="mt-10 mb-2">
        <h2 className="text-lg font-bold text-white text-center mb-6">{t.register.whatHappensNext}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      </div>
    </div>
  );
}
