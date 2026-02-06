import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { API_URL, USDC_ABI } from '../config';

// Resolved at runtime from the 402 response
const REGISTER_COST = 1; // 1 USDC

export default function Register() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [form, setForm] = useState({
    name: '', description: '', url: '', price: '', tags: ''
  });
  const [step, setStep] = useState('form'); // form | paying | registering | done | error
  const [txHash, setTxHash] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isConnected) {
      setError('Please connect your wallet first.');
      return;
    }

    try {
      // Step 1: Get payment details from 402
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

      // Step 2: Send USDC payment
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

      // Step 3: Wait for confirmation then register
      setStep('registering');

      // Poll for receipt (simpler than watching)
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

      // Step 4: Retry with payment proof
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
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Register a Service</h1>
      <p className="text-gray-500 mb-8">
        List your API on x402 Bazaar. Costs {REGISTER_COST} USDC, paid on-chain.
      </p>

      {step === 'done' ? (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
          <div className="text-green-400 text-xl font-bold mb-2">Service registered!</div>
          <p className="text-gray-400 text-sm mb-4">{result?.data?.name} is now live on x402 Bazaar.</p>
          {txHash && (
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              View transaction on BaseScan
            </a>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Service Name *</label>
            <input
              type="text" required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Weather API Pro"
              className="w-full bg-[#12121a] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              rows={3} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what your API does..."
              className="w-full bg-[#12121a] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">API URL *</label>
            <input
              type="url" required value={form.url}
              onChange={e => setForm({ ...form, url: e.target.value })}
              placeholder="https://api.example.com/v1"
              className="w-full bg-[#12121a] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Price (USDC) *</label>
              <input
                type="number" step="0.01" min="0.01" required value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="0.10"
                className="w-full bg-[#12121a] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tags (comma-separated)</label>
              <input
                type="text" value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
                placeholder="ai, weather, api"
                className="w-full bg-[#12121a] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={step === 'paying' || step === 'registering'}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white py-3 rounded-lg font-medium cursor-pointer transition-colors"
          >
            {step === 'paying' ? 'Sending USDC payment...' :
             step === 'registering' ? 'Confirming on-chain...' :
             `Register (${REGISTER_COST} USDC)`}
          </button>

          {!isConnected && (
            <p className="text-orange-400 text-sm text-center">Connect your wallet to register a service.</p>
          )}
        </form>
      )}
    </div>
  );
}
