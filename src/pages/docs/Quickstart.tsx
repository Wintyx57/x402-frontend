interface Props { d: Record<string, string>; }

import { DocsCodeBlock } from './shared';

const API_BASE = 'https://x402-api.onrender.com';

export default function Quickstart({ d }: Props) {
  return (
    <section id="quickstart">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-white">{d.quickstartTitle || 'Quickstart'}</h2>
        <span className="text-xs font-medium text-[#34D399] bg-[#34D399]/10 px-2.5 py-0.5 rounded-full">{d.quickstartBadge || '5 min'}</span>
      </div>
      <div className="space-y-6">
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-white font-semibold mb-2">{d.quickstartStep1Title || 'Step 1 — Install the CLI'}</h3>
          <p className="text-gray-400 text-sm mb-4">{d.quickstartStep1Desc || ''}</p>
          <DocsCodeBlock code="npx x402-bazaar init" />
        </div>
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-white font-semibold mb-2">{d.quickstartStep2Title || 'Step 2 — Make your first call'}</h3>
          <p className="text-gray-400 text-sm mb-4">{d.quickstartStep2Desc || ''}</p>
          <DocsCodeBlock code={`curl ${API_BASE}/api/joke`} />
        </div>
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-white font-semibold mb-2">{d.quickstartStep3Title || 'Step 3 — Handle the 402 response'}</h3>
          <p className="text-gray-400 text-sm mb-4">{d.quickstartStep3Desc || ''}</p>
          <DocsCodeBlock code={`{
  "error": "Payment Required",
  "payment_details": {
    "amount": 0.01,
    "currency": "USDC",
    "network": "base",
    "chainId": 8453,
    "recipient": "0xfb1c...2430",
    "action": "Random Joke API"
  }
}`} />
        </div>
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-white font-semibold mb-2">{d.quickstartStep4Title || 'Step 4 — Pay & retry'}</h3>
          <p className="text-gray-400 text-sm mb-4">{d.quickstartStep4Desc || ''}</p>
          <DocsCodeBlock code={`# Pay 0.01 USDC to the recipient address on Base
# Then retry with the transaction hash:

curl -H "X-Payment-TxHash: 0xabc123..." \\
  ${API_BASE}/api/joke`} />
        </div>
        <div className="rounded-xl p-5 bg-[#34D399]/5 border border-[#34D399]/20">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-[#34D399] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p className="text-[#34D399] text-sm font-medium">{d.quickstartSuccess || 'You just made your first x402 payment!'}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
