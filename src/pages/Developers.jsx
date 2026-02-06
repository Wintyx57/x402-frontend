import { API_URL } from '../config';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';

export default function Developers() {
  const baseUrl = API_URL === 'http://localhost:3000' ? 'https://x402-api.onrender.com' : API_URL;
  const { t } = useTranslation();
  const protocolRef = useReveal();
  const endpointsRef = useReveal();
  const exampleRef = useReveal();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in-up">{t.developers.title}</h1>
      <p className="text-gray-500 mb-10 animate-fade-in-up delay-100">
        {t.developers.subtitle}
      </p>

      {/* Protocol */}
      <section ref={protocolRef} className="reveal mb-10">
        <h2 className="text-xl font-bold text-white mb-4">{t.developers.protocolTitle}</h2>
        <div className="glass rounded-2xl p-6 text-sm text-gray-300 space-y-3">
          <p><strong className="text-white">1.</strong> {t.developers.step1}</p>
          <p><strong className="text-white">2.</strong> {t.developers.step2pre} <code className="glass px-1.5 py-0.5 rounded text-orange-400">{t.developers.step2code}</code> {t.developers.step2post}</p>
          <p><strong className="text-white">3.</strong> {t.developers.step3}</p>
          <p><strong className="text-white">4.</strong> {t.developers.step4pre} <code className="glass px-1.5 py-0.5 rounded text-green-400">X-Payment-TxHash: 0x...</code></p>
          <p><strong className="text-white">5.</strong> {t.developers.step5}</p>
        </div>
      </section>

      {/* Endpoints */}
      <section ref={endpointsRef} className="reveal mb-10">
        <h2 className="text-xl font-bold text-white mb-4">{t.developers.endpointsTitle}</h2>
        <div className="overflow-x-auto glass rounded-2xl p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-white/10">
                <th className="pb-3 pr-4">{t.developers.thRoute}</th>
                <th className="pb-3 pr-4">{t.developers.thMethod}</th>
                <th className="pb-3 pr-4">{t.developers.thCost}</th>
                <th className="pb-3">{t.developers.thDescription}</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-white/5">
                <td className="py-3 pr-4 font-mono text-blue-400">/</td>
                <td className="py-3 pr-4">GET</td>
                <td className="py-3 pr-4 text-green-400">{t.developers.free}</td>
                <td className="py-3">{t.developers.discovery}</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 pr-4 font-mono text-blue-400">/services</td>
                <td className="py-3 pr-4">GET</td>
                <td className="py-3 pr-4 text-yellow-400">0.05 USDC</td>
                <td className="py-3">{t.developers.listAll}</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 pr-4 font-mono text-blue-400">/search?q=</td>
                <td className="py-3 pr-4">GET</td>
                <td className="py-3 pr-4 text-yellow-400">0.05 USDC</td>
                <td className="py-3">{t.developers.searchServices}</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-blue-400">/register</td>
                <td className="py-3 pr-4">POST</td>
                <td className="py-3 pr-4 text-yellow-400">1.00 USDC</td>
                <td className="py-3">{t.developers.registerService}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Example */}
      <section ref={exampleRef} className="reveal mb-10">
        <h2 className="text-xl font-bold text-white mb-4">{t.developers.exampleTitle}</h2>
        <pre className="glass rounded-2xl p-5 text-sm text-gray-300 overflow-x-auto">
{`# 1. Discover the marketplace
curl ${baseUrl}/

# 2. Try to search (will get 402)
curl ${baseUrl}/search?q=weather
# → HTTP 402 + payment_details

# 3. Pay USDC on Base (via your wallet/SDK)
# ... send 0.05 USDC to the recipient address

# 4. Retry with proof of payment
curl -H "X-Payment-TxHash: 0xabc123..." \\
  ${baseUrl}/search?q=weather
# → HTTP 200 + results`}
        </pre>
      </section>

      {/* Register body */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">{t.developers.registerBodyTitle}</h2>
        <pre className="glass rounded-2xl p-5 text-sm text-gray-300 overflow-x-auto">
{`{
  "name": "My AI Service",
  "description": "What my service does",
  "url": "https://api.myservice.com/v1",
  "price": 0.10,
  "tags": ["ai", "nlp"],
  "ownerAddress": "0xYourWalletAddress"
}`}
        </pre>
      </section>

      {/* 402 Response */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">{t.developers.responseTitle}</h2>
        <pre className="glass rounded-2xl p-5 text-sm text-gray-300 overflow-x-auto">
{`{
  "error": "Payment Required",
  "payment_details": {
    "amount": 0.05,
    "currency": "USDC",
    "network": "base",
    "chainId": 8453,
    "recipient": "0xServerWallet...",
    "action": "Search services"
  }
}`}
        </pre>
      </section>
    </div>
  );
}
