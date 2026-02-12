import { useEffect } from 'react';
import { API_URL } from '../config';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import CodeBlock from '../components/CodeBlock';
import GitHubIcon from '../components/icons/GitHubIcon';

export default function Developers() {
  useEffect(() => { document.title = 'Developers | x402 Bazaar'; }, []);
  const baseUrl = API_URL === 'http://localhost:3000' ? 'https://x402-api.onrender.com' : API_URL;
  const { t } = useTranslation();
  const protocolRef = useReveal();
  const endpointsRef = useReveal();
  const exampleRef = useReveal();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 animate-fade-in-up">{t.developers.title}</h1>
      <p className="text-gray-500 mb-6 animate-fade-in-up delay-100">
        {t.developers.subtitle}
      </p>

      {/* CLI Quick Start Banner */}
      <div className="animate-fade-in-up delay-200 mb-10 rounded-xl bg-[#FF9900]/[0.06] border border-[#FF9900]/20 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-2 shrink-0">
          <svg className="w-5 h-5 text-[#FF9900]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 17 10 11 4 5"/>
            <line x1="12" y1="19" x2="20" y2="19"/>
          </svg>
          <span className="text-white font-medium text-sm">{t.developers.cliQuickStart}</span>
        </div>
        <code className="bg-[#0d1117] px-3 py-1.5 rounded-lg text-[#FF9900] text-sm font-mono">npx x402-bazaar init</code>
        <span className="text-gray-500 text-xs">{t.developers.cliQuickStartDesc}</span>
      </div>

      {/* Monetize Your API */}
      <section className="animate-fade-in-up delay-300 mb-10">
        <div className="glass rounded-xl p-6 sm:p-8 border border-[#FF9900]/10">
          <h2 className="text-2xl font-bold text-white mb-2">{t.developers.templateTitle}</h2>
          <p className="text-gray-400 text-sm mb-5 max-w-lg">
            {t.developers.templateDesc}
          </p>
          <div className="bg-[#1a1f2e] border border-white/10 rounded-xl overflow-hidden mb-5">
            <div className="flex items-center px-4 py-2 border-b border-white/10">
              <span className="text-xs font-medium text-[#FF9900]/80 bg-[#FF9900]/10 px-2 py-0.5 rounded">Python</span>
            </div>
            <pre className="px-4 py-3 text-sm text-gray-300 overflow-x-auto font-mono leading-relaxed">{t.developers.templateCode}</pre>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/Wintyx57/x402-fast-monetization-template"
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-btn text-white px-5 py-2.5 rounded-lg text-sm font-medium no-underline hover:brightness-110 transition-all inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {t.developers.templateLink}
            </a>
            <a
              href="https://github.com/Wintyx57/x402-fast-monetization-template"
              target="_blank"
              rel="noopener noreferrer"
              className="glass text-gray-300 px-5 py-2.5 rounded-lg text-sm font-medium no-underline hover:border-white/20 transition-all inline-flex items-center gap-2"
            >
              <GitHubIcon />
              {t.developers.templateGithub}
            </a>
          </div>
        </div>
      </section>

      {/* Protocol */}
      <section ref={protocolRef} className="reveal mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{t.developers.protocolTitle}</h2>
        <div className="glass rounded-xl p-6 text-sm text-gray-300 space-y-3">
          <p><strong className="text-white">1.</strong> {t.developers.step1}</p>
          <p><strong className="text-white">2.</strong> {t.developers.step2pre} <code className="glass px-1.5 py-0.5 rounded text-orange-400">{t.developers.step2code}</code> {t.developers.step2post}</p>
          <p><strong className="text-white">3.</strong> {t.developers.step3}</p>
          <p><strong className="text-white">4.</strong> {t.developers.step4pre} <code className="glass px-1.5 py-0.5 rounded text-green-400">X-Payment-TxHash: 0x...</code></p>
          <p><strong className="text-white">5.</strong> {t.developers.step5}</p>
        </div>
      </section>

      {/* Endpoints */}
      <section ref={endpointsRef} className="reveal mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{t.developers.endpointsTitle}</h2>
        <div className="overflow-x-auto glass rounded-xl p-4 sm:p-5">
          <table className="w-full text-xs sm:text-sm min-w-[360px] sm:min-w-[480px]">
            <thead>
              <tr className="text-left text-gray-500 border-b border-white/10">
                <th className="pb-3 pr-3 sm:pr-4">{t.developers.thRoute}</th>
                <th className="pb-3 pr-3 sm:pr-4">{t.developers.thMethod}</th>
                <th className="pb-3 pr-3 sm:pr-4">{t.developers.thCost}</th>
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
        <h2 className="text-2xl font-bold text-white mb-4">{t.developers.exampleTitle}</h2>
        <CodeBlock lang="Shell" code={`# 1. Discover the marketplace
curl ${baseUrl}/

# 2. Try to search (will get 402)
curl ${baseUrl}/search?q=weather
# → HTTP 402 + payment_details

# 3. Pay USDC on Base (via your wallet/SDK)
# ... send 0.05 USDC to the recipient address

# 4. Retry with proof of payment
curl -H "X-Payment-TxHash: 0xabc123..." \\
  ${baseUrl}/search?q=weather
# → HTTP 200 + results`} />
      </section>

      {/* Register body */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{t.developers.registerBodyTitle}</h2>
        <CodeBlock lang="JSON" code={`{
  "name": "My AI Service",
  "description": "What my service does",
  "url": "https://api.myservice.com/v1",
  "price": 0.10,
  "tags": ["ai", "nlp"],
  "ownerAddress": "0xYourWalletAddress"
}`} />
      </section>

      {/* 402 Response */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{t.developers.responseTitle}</h2>
        <CodeBlock lang="JSON" code={`{
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
    </div>
  );
}
