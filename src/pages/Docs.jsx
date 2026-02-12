import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { API_URL } from '../config';
import DocsSidebar from '../components/DocsSidebar';
import SharedCopyButton from '../components/CopyButton';

const API_BASE = 'https://x402-api.onrender.com';

const SECTION_IDS = ['quickstart', 'protocol', 'api-reference', 'native-wrappers', 'mcp', 'integration', 'security'];

const MCP_TOOLS = [
  { name: 'discover_marketplace', cost: 'Free', desc_en: 'Discover endpoints and total services', desc_fr: 'Decouvrir les endpoints et le nombre de services' },
  { name: 'search_services', cost: '0.05 USDC', desc_en: 'Search APIs by keyword', desc_fr: 'Rechercher des APIs par mot-cle' },
  { name: 'list_services', cost: '0.05 USDC', desc_en: 'List all available services', desc_fr: 'Lister tous les services disponibles' },
  { name: 'find_tool_for_task', cost: '0.05 USDC', desc_en: 'Describe a task, get the best API', desc_fr: 'Decrivez un besoin, obtenez la meilleure API' },
  { name: 'call_api', cost: 'Free', desc_en: 'Call any external API URL', desc_fr: 'Appeler une API externe' },
  { name: 'get_wallet_balance', cost: 'Free', desc_en: 'Check USDC balance on Base', desc_fr: 'Verifier le solde USDC sur Base' },
  { name: 'get_budget_status', cost: 'Free', desc_en: 'Check spending and remaining budget', desc_fr: 'Verifier les depenses et le budget restant' },
];

const NATIVE_ENDPOINTS = [
  {
    id: 'search', route: '/api/search', method: 'GET', price: '0.005',
    titleKey: 'searchTitle', descKey: 'searchDesc',
    params: [{ name: 'q', type: 'string', required: true, descKey: 'searchParamQ' }],
    curl: `curl "${API_BASE}/api/search?q=bitcoin+price"`,
    response: `{
  "query": "bitcoin price",
  "results": [
    { "title": "Bitcoin Price Today", "url": "https://...", "snippet": "Current BTC price..." }
  ],
  "_payment": { "amount": 0.005, "txHash": "0x..." }
}`,
  },
  {
    id: 'scrape', route: '/api/scrape', method: 'GET', price: '0.005',
    titleKey: 'scrapeTitle', descKey: 'scrapeDesc',
    params: [{ name: 'url', type: 'string', required: true, descKey: 'scrapeParamUrl' }],
    curl: `curl "${API_BASE}/api/scrape?url=https://example.com"`,
    response: `{
  "url": "https://example.com",
  "title": "Example Domain",
  "markdown": "# Example Domain\\nThis domain is for use in examples...",
  "_payment": { "amount": 0.005, "txHash": "0x..." }
}`,
  },
  {
    id: 'twitter', route: '/api/twitter', method: 'GET', price: '0.005',
    titleKey: 'twitterTitle', descKey: 'twitterDesc',
    params: [
      { name: 'user', type: 'string', required: false, descKey: 'twitterParamUser' },
      { name: 'tweet', type: 'string', required: false, descKey: 'twitterParamTweet' },
      { name: 'search', type: 'string', required: false, descKey: 'twitterParamSearch' },
      { name: 'max', type: 'number', required: false, descKey: 'twitterParamMax' },
    ],
    curl: `curl "${API_BASE}/api/twitter?user=elonmusk"`,
    response: `{
  "user": { "name": "Elon Musk", "username": "elonmusk", "followers": 200000000 },
  "_payment": { "amount": 0.005, "txHash": "0x..." }
}`,
  },
  {
    id: 'weather', route: '/api/weather', method: 'GET', price: '0.02',
    titleKey: 'weatherTitle', descKey: 'weatherDesc',
    params: [{ name: 'city', type: 'string', required: true, descKey: 'weatherParamCity' }],
    curl: `curl "${API_BASE}/api/weather?city=Paris"`,
    response: `{
  "city": "Paris",
  "temperature": 12,
  "condition": "Partly cloudy",
  "humidity": 72,
  "_payment": { "amount": 0.02, "txHash": "0x..." }
}`,
  },
  {
    id: 'crypto', route: '/api/crypto', method: 'GET', price: '0.02',
    titleKey: 'cryptoTitle', descKey: 'cryptoDesc',
    params: [{ name: 'coin', type: 'string', required: true, descKey: 'cryptoParamCoin' }],
    curl: `curl "${API_BASE}/api/crypto?coin=bitcoin"`,
    response: `{
  "coin": "bitcoin",
  "price_usd": 97450.32,
  "change_24h": 2.4,
  "market_cap": 1920000000000,
  "_payment": { "amount": 0.02, "txHash": "0x..." }
}`,
  },
  {
    id: 'joke', route: '/api/joke', method: 'GET', price: '0.01',
    titleKey: 'jokeTitle', descKey: 'jokeDesc',
    params: [],
    curl: `curl "${API_BASE}/api/joke"`,
    response: `{
  "type": "twopart",
  "setup": "Why do programmers prefer dark mode?",
  "delivery": "Because light attracts bugs.",
  "_payment": { "amount": 0.01, "txHash": "0x..." }
}`,
  },
  {
    id: 'image', route: '/api/image', method: 'GET', price: '0.05',
    titleKey: 'imageTitle', descKey: 'imageDesc',
    params: [
      { name: 'prompt', type: 'string', required: true, descKey: 'imageParamPrompt' },
      { name: 'size', type: 'string', required: false, descKey: 'imageParamSize' },
      { name: 'quality', type: 'string', required: false, descKey: 'imageParamQuality' },
    ],
    curl: `curl "${API_BASE}/api/image?prompt=a+cat+in+space"`,
    response: `{
  "prompt": "a cat in space",
  "url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "size": "1024x1024",
  "_payment": { "amount": 0.05, "txHash": "0x..." }
}`,
  },
];

const STATIC_ENDPOINTS = {
  marketplace: [
    { method: 'GET', route: '/', price: null, description: 'Discovery: marketplace info + endpoints' },
    { method: 'GET', route: '/services', price: '0.05', description: 'List all registered services' },
    { method: 'GET', route: '/search?q=', price: '0.05', description: 'Search services by keyword' },
    { method: 'POST', route: '/register', price: '1.00', description: 'Register a new service' },
  ],
  native: NATIVE_ENDPOINTS.map(ep => ({ method: ep.method, route: ep.route, price: ep.price, description: ep.id })),
};

function DocsCodeBlock({ code }) {
  return (
    <div className="relative group">
      <SharedCopyButton text={code} copiedLabel="Copied" />
      <pre className="bg-[#0d1117] border border-white/10 rounded-xl p-3 sm:p-5 pt-12 overflow-x-auto text-xs sm:text-sm leading-relaxed">
        <code className="text-gray-300 font-mono">{code}</code>
      </pre>
    </div>
  );
}

function parseEndpoints(raw) {
  const marketplace = [];
  const native = [];
  Object.entries(raw).forEach(([key, desc]) => {
    const match = key.match(/^(GET|POST)\s+(.+)$/);
    if (!match) return;
    const method = match[1];
    const route = match[2];
    const priceMatch = desc.match(/\((\d+(?:\.\d+)?)\s*USDC\)/);
    const price = priceMatch ? priceMatch[1] : null;
    const description = desc.replace(/\s*\(\d+(?:\.\d+)?\s*USDC\)/, '').trim();
    const entry = { method, route, price, description };
    if (route.startsWith('/api/')) native.push(entry);
    else marketplace.push(entry);
  });
  return { marketplace, native };
}

export default function Docs() {
  const { t, lang } = useTranslation();
  const d = t.docs || {};
  const [endpointsRaw, setEndpointsRaw] = useState(undefined);
  const activeSection = useScrollSpy(SECTION_IDS);

  useEffect(() => { document.title = 'Documentation | x402 Bazaar'; }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(API_URL + '/', { signal: controller.signal })
      .then(r => r.json())
      .then(data => setEndpointsRaw(data.endpoints || null))
      .catch(() => { if (!controller.signal.aborted) setEndpointsRaw(null); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      if (SECTION_IDS.includes(id)) {
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }, []);

  const handleNavigate = (id) => {
    if (!SECTION_IDS.includes(id)) return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  const sections = [
    { id: 'quickstart', label: d.sidebarQuickstart || 'Quickstart' },
    { id: 'protocol', label: d.sidebarProtocol || 'Protocol' },
    { id: 'api-reference', label: d.sidebarApiRef || 'API Reference' },
    { id: 'native-wrappers', label: d.sidebarNative || 'Native Wrappers' },
    { id: 'mcp', label: d.sidebarMcp || 'MCP Server' },
    { id: 'integration', label: d.sidebarIntegration || 'Integration' },
    { id: 'security', label: d.sidebarSecurity || 'Security' },
  ];

  const parsed = endpointsRaw ? parseEndpoints(endpointsRaw) : null;
  const apiData = parsed || STATIC_ENDPOINTS;

  const PriceBadge = ({ price }) => (
    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
      price ? 'bg-[#FF9900]/10 text-[#FF9900]' : 'bg-[#34D399]/10 text-[#34D399]'
    }`}>
      {price ? `${price} USDC` : (d.free || 'Free')}
    </span>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/20 text-[#FF9900] text-xs font-medium mb-4">
          Documentation
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{d.title || 'Documentation'}</h1>
        <p className="text-gray-400 text-lg max-w-2xl">{d.subtitle || ''}</p>
      </div>

      {/* Layout: Sidebar + Content */}
      <div className="flex gap-8">
        <DocsSidebar sections={sections} activeSection={activeSection} onNavigate={handleNavigate} />

        <main className="flex-1 min-w-0 space-y-16">

          {/* ========== QUICKSTART ========== */}
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

          {/* ========== PROTOCOL ========== */}
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

          {/* ========== API REFERENCE ========== */}
          <section id="api-reference">
            <h2 className="text-2xl font-bold text-white mb-6">{d.apiRefTitle || 'API Reference'}</h2>

            {endpointsRaw === undefined && (
              <p className="text-gray-500 text-sm mb-4 animate-pulse">{d.apiRefLoading || 'Loading endpoints...'}</p>
            )}
            {endpointsRaw === null && (
              <div className="text-yellow-400/80 text-sm mb-4 p-3 rounded-lg bg-yellow-400/5 border border-yellow-400/20">
                {d.apiRefError || 'Could not load live endpoints.'}
              </div>
            )}

            <h3 className="text-white font-semibold mb-3">{d.apiRefMarketplace || 'Marketplace'}</h3>
            <div className="overflow-x-auto glass-card rounded-xl p-4 mb-8">
              <table className="w-full text-sm min-w-[360px] sm:min-w-[480px]">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-white/10">
                    <th className="pb-3 pr-4">{d.thMethod || 'Method'}</th>
                    <th className="pb-3 pr-4">{d.thRoute || 'Route'}</th>
                    <th className="pb-3 pr-4">{d.thCost || 'Cost'}</th>
                    <th className="pb-3">{d.thDescription || 'Description'}</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {apiData.marketplace.map((ep, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3 pr-4 font-mono text-xs">{ep.method}</td>
                      <td className="py-3 pr-4 font-mono text-blue-400">{ep.route}</td>
                      <td className="py-3 pr-4"><PriceBadge price={ep.price} /></td>
                      <td className="py-3 text-sm">{ep.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-white font-semibold mb-3">{d.apiRefNative || 'Native Wrappers'}</h3>
            <div className="overflow-x-auto glass-card rounded-xl p-4">
              <table className="w-full text-sm min-w-[360px] sm:min-w-[480px]">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-white/10">
                    <th className="pb-3 pr-4">{d.thMethod || 'Method'}</th>
                    <th className="pb-3 pr-4">{d.thRoute || 'Route'}</th>
                    <th className="pb-3 pr-4">{d.thCost || 'Cost'}</th>
                    <th className="pb-3">{d.thDescription || 'Description'}</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {(parsed ? apiData.native : NATIVE_ENDPOINTS).map((ep, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3 pr-4 font-mono text-xs">{ep.method}</td>
                      <td className="py-3 pr-4 font-mono text-blue-400">{parsed ? ep.route : ep.route}</td>
                      <td className="py-3 pr-4"><PriceBadge price={ep.price} /></td>
                      <td className="py-3 text-sm">{parsed ? ep.description : (d[ep.titleKey] || ep.id)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ========== NATIVE WRAPPERS ========== */}
          <section id="native-wrappers">
            <h2 className="text-2xl font-bold text-white mb-2">{d.nativeTitle || 'Native Wrappers'}</h2>
            <p className="text-gray-400 text-sm mb-8">{(d.nativeSubtitle || '').replace('{count}', NATIVE_ENDPOINTS.length)}</p>

            <div className="space-y-8">
              {NATIVE_ENDPOINTS.map(ep => (
                <div key={ep.id} className="glass-card rounded-xl p-6">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-white font-bold text-lg">{d[ep.titleKey] || ep.id}</h3>
                    <PriceBadge price={ep.price} />
                    <code className="text-xs font-mono text-gray-500">{ep.method} {ep.route}</code>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{d[ep.descKey] || ''}</p>

                  {ep.params.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">{d.nativeParams || 'Parameters'}</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-500 border-b border-white/10">
                              <th className="text-left pb-2 pr-4">{d.nativeParamName || 'Name'}</th>
                              <th className="text-left pb-2 pr-4">{d.nativeParamType || 'Type'}</th>
                              <th className="text-left pb-2 pr-4">{d.nativeParamRequired || 'Required'}</th>
                              <th className="text-left pb-2">{d.nativeParamDesc || 'Description'}</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-300">
                            {ep.params.map(p => (
                              <tr key={p.name} className="border-b border-white/5">
                                <td className="py-2 pr-4 font-mono text-[#FF9900]">{p.name}</td>
                                <td className="py-2 pr-4">{p.type}</td>
                                <td className="py-2 pr-4">{p.required ? (d.nativeYes || 'Yes') : (d.nativeNo || 'No')}</td>
                                <td className="py-2">{d[p.descKey] || ''}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <h4 className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">{d.nativeExample || 'Example Request'}</h4>
                  <DocsCodeBlock code={ep.curl} />

                  <h4 className="text-gray-300 text-xs font-semibold uppercase tracking-wider mt-4 mb-2">{d.nativeResponse || 'Example Response'}</h4>
                  <DocsCodeBlock code={ep.response} />
                </div>
              ))}
            </div>
          </section>

          {/* ========== MCP SERVER ========== */}
          <section id="mcp">
            <h2 className="text-2xl font-bold text-white mb-3">{d.mcpTitle || 'MCP Server'}</h2>
            <p className="text-gray-400 text-sm mb-6">{d.mcpDesc || ''}</p>

            <h3 className="text-white font-semibold mb-3">{d.mcpToolsTitle || 'Available Tools'}</h3>
            <div className="space-y-2 mb-6">
              {MCP_TOOLS.map(tool => (
                <div key={tool.name} className="glass-card rounded-lg p-3 flex items-center gap-3">
                  <code className="text-[#FF9900] font-mono text-xs bg-[#FF9900]/10 px-2 py-1 rounded shrink-0">{tool.name}</code>
                  <span className="text-gray-400 text-sm flex-1">{lang === 'fr' ? tool.desc_fr : tool.desc_en}</span>
                  <span className={`shrink-0 text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    tool.cost === 'Free' ? 'bg-[#34D399]/10 text-[#34D399]' : 'bg-[#FF9900]/10 text-[#FF9900]'
                  }`}>
                    {tool.cost === 'Free' ? (lang === 'fr' ? 'Gratuit' : 'Free') : tool.cost}
                  </span>
                </div>
              ))}
            </div>

            <h3 className="text-white font-semibold mb-3">{d.mcpInstall || 'Install with one command:'}</h3>
            <DocsCodeBlock code="npx x402-bazaar init" />

            <div className="mt-4">
              <Link to="/mcp" className="text-[#FF9900] hover:text-[#FFB84D] text-sm font-medium no-underline inline-flex items-center gap-1">
                {d.mcpFullDoc || 'Full MCP documentation'} →
              </Link>
            </div>
          </section>

          {/* ========== INTEGRATION ========== */}
          <section id="integration">
            <h2 className="text-2xl font-bold text-white mb-3">{d.integrationTitle || 'Integration'}</h2>
            <p className="text-gray-400 text-sm mb-6">{d.integrationDesc || ''}</p>

            <h3 className="text-white font-semibold mb-3">{d.integrationJs || 'JavaScript (Node.js)'}</h3>
            <DocsCodeBlock code={`async function payAndRequest(url, wallet, options = {}) {
  const res = await fetch(url, options);
  const body = await res.json();
  if (res.status !== 402) return body;

  const { amount, recipient } = body.payment_details;
  const transfer = await wallet.createTransfer({
    amount, assetId: 'usdc', destination: recipient,
  });
  const confirmed = await transfer.wait();
  const txHash = confirmed.getTransactionHash();

  const retryRes = await fetch(url, {
    ...options,
    headers: { ...options.headers, 'X-Payment-TxHash': txHash },
  });
  return retryRes.json();
}`} />

            <h3 className="text-white font-semibold mt-6 mb-3">{d.integrationPy || 'Python (requests + web3)'}</h3>
            <DocsCodeBlock code={`import requests

BAZAAR = "https://x402-api.onrender.com"

def pay_and_request(url, wallet_key):
    res = requests.get(url)
    if res.status_code != 402:
        return res.json()

    details = res.json()["payment_details"]
    # Send USDC to details["recipient"] on Base
    tx_hash = send_usdc(details["recipient"], details["amount"], wallet_key)

    return requests.get(url, headers={
        "X-Payment-TxHash": tx_hash
    }).json()

# Usage
data = pay_and_request(f"{BAZAAR}/api/weather?city=Paris", KEY)`} />

            <div className="mt-4">
              <Link to="/integrate" className="text-[#FF9900] hover:text-[#FFB84D] text-sm font-medium no-underline inline-flex items-center gap-1">
                {d.integrationFullDoc || 'Full integration guide'} →
              </Link>
            </div>
          </section>

          {/* ========== SECURITY ========== */}
          <section id="security">
            <h2 className="text-2xl font-bold text-white mb-6">{d.securityTitle || 'Security'}</h2>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { title: d.securityBudgetTitle, desc: d.securityBudgetDesc },
                { title: d.securityReplayTitle, desc: d.securityReplayDesc },
                { title: d.securityOnchainTitle, desc: d.securityOnchainDesc },
                { title: d.securityRateTitle, desc: d.securityRateDesc },
                { title: d.securitySsrfTitle, desc: d.securitySsrfDesc },
              ].map((item, i) => (
                <div key={i} className="glass-card rounded-xl p-5">
                  <h3 className="text-white font-semibold text-sm mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3">{d.securityBestTitle || 'Best Practices'}</h3>
              <ul className="space-y-2">
                {[d.securityBest1, d.securityBest2, d.securityBest3].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                    <svg className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4"/>
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* ERC-8004 Agent Identity */}
            <div className="glass-card rounded-xl p-5 mt-6 border border-violet-500/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/30">
                  <svg className="w-4.5 h-4.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-sm">{d.erc8004Title || 'ERC-8004 Agent Identity'}</h3>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-4">{d.erc8004Desc || ''}</p>
              <p className="text-gray-500 text-xs mb-2">{d.erc8004Endpoint || 'Verify any agent identity for free:'}</p>
              <DocsCodeBlock code={`curl ${API_BASE}/api/agent/0xYourAgentAddress`} />
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
