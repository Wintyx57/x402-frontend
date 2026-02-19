import { DocsCodeBlock } from './shared';

export default function Protocol({ d }) {
  return (
    <section id="protocol">
      <h2 className="text-2xl font-bold text-white mb-6">{d.protocolTitle || 'The x402 Protocol'}</h2>
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="space-y-4">
          {[d.protocolStep1, d.protocolStep2, d.protocolStep3, d.protocolStep4, d.protocolStep5].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FF9900]/15 text-[#FF9900] flex items-center justify-center text-sm font-bold shrink-0">
                {i + 1}
              </div>
              <p className="text-gray-300 text-sm pt-1.5">{step}</p>
            </div>
          ))}
        </div>
      </div>
      <h3 className="text-white font-semibold mb-3">{d.protocolResponseTitle || '402 Response Format'}</h3>
      <DocsCodeBlock code={`{
  "error": "Payment Required",
  "payment_details": {
    "amount": 0.05,
    "currency": "USDC",
    "network": "base",
    "chainId": 8453,
    "recipient": "0xServerWallet...",
    "action": "Search services"
  }
}`} />
    </section>
  );
}
