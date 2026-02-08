import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { API_URL, USDC_ABI } from '../config';
import { useTranslation } from '../i18n/LanguageContext';

const REGISTER_COST = 1;

export default function Register() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    name: '', description: '', url: '', price: '', tags: ''
  });
  const [step, setStep] = useState('form');
  const [txHash, setTxHash] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isConnected) {
      setError(t.register.connectError);
      return;
    }

    try {
      setStep('paying');
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

      const usdcContract = payment_details.chainId === 8453
        ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
        : '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

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

      let confirmed = false;
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000));
        try {
          const receiptRes = await fetch(payment_details.chainId === 8453
            ? 'https://mainnet.base.org'
            : 'https://sepolia.base.org', {
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

      const resRegister = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Payment-TxHash': hash,
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
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setStep('error');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in-up">{t.register.title}</h1>
      <p className="text-gray-500 mb-8 animate-fade-in-up delay-100">
        {t.register.subtitle.replace('{cost}', REGISTER_COST)}
      </p>

      {step === 'done' ? (
        <div className="glass glow-green rounded-2xl p-8 text-center animate-fade-in-up">
          <div className="text-green-400 text-2xl font-bold mb-3">{t.register.successTitle}</div>
          <p className="text-gray-400 text-sm mb-5">{result?.data?.name} {t.register.successDesc}</p>
          {txHash && (
            <a
              href={`https://basescan.org/tx/${txHash}`}
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
              className="w-full glass rounded-xl px-4 py-2.5 text-white placeholder-gray-600
                         focus:outline-none focus:glow-blue focus:border-blue-500/50 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">{t.register.description}</label>
            <textarea
              rows={3} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder={t.register.descPlaceholder}
              className="w-full glass rounded-xl px-4 py-2.5 text-white placeholder-gray-600
                         focus:outline-none focus:glow-blue focus:border-blue-500/50 transition-all duration-300 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">{t.register.apiUrl}</label>
            <input
              type="url" required value={form.url}
              onChange={e => setForm({ ...form, url: e.target.value })}
              placeholder={t.register.urlPlaceholder}
              className="w-full glass rounded-xl px-4 py-2.5 text-white placeholder-gray-600
                         focus:outline-none focus:glow-blue focus:border-blue-500/50 transition-all duration-300"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t.register.priceLabel}</label>
              <input
                type="number" step="0.01" min="0.01" required value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder={t.register.pricePlaceholder}
                className="w-full glass rounded-xl px-4 py-2.5 text-white placeholder-gray-600
                           focus:outline-none focus:glow-blue focus:border-blue-500/50 transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t.register.tagsLabel}</label>
              <input
                type="text" value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
                placeholder={t.register.tagsPlaceholder}
                className="w-full glass rounded-xl px-4 py-2.5 text-white placeholder-gray-600
                           focus:outline-none focus:glow-blue focus:border-blue-500/50 transition-all duration-300"
              />
            </div>
          </div>

          {error && (
            <div className="glass rounded-xl p-3 text-red-400 text-sm border-red-500/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={step === 'paying' || step === 'registering'}
            className="w-full gradient-btn disabled:opacity-40 text-white py-3 rounded-xl font-medium
                       cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:glow-blue"
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
    </div>
  );
}
