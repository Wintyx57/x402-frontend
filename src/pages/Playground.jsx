import { useState, useCallback } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import useSEO from '../hooks/useSEO';
import CopyButton from '../components/CopyButton';
import { API_URL } from '../config';

const PLAYGROUND_APIS = [
  { id: 'weather', route: '/weather', method: 'GET', price: '0.02', category: 'Data', params: [{ name: 'city', defaultValue: 'Paris', required: true }] },
  { id: 'crypto', route: '/crypto', method: 'GET', price: '0.02', category: 'Finance', params: [{ name: 'symbol', defaultValue: 'bitcoin', required: true }] },
  { id: 'joke', route: '/joke', method: 'GET', price: '0.01', category: 'Fun', params: [] },
  { id: 'translate', route: '/translate', method: 'GET', price: '0.005', category: 'AI', params: [{ name: 'text', defaultValue: 'Hello world', required: true }, { name: 'to', defaultValue: 'fr', required: true }] },
  { id: 'sentiment', route: '/sentiment', method: 'GET', price: '0.005', category: 'AI', params: [{ name: 'text', defaultValue: 'I love this product!', required: true }] },
  { id: 'search', route: '/search', method: 'GET', price: '0.005', category: 'Data', params: [{ name: 'q', defaultValue: 'x402 protocol', required: true }] },
  { id: 'wikipedia', route: '/wikipedia', method: 'GET', price: '0.005', category: 'Data', params: [{ name: 'q', defaultValue: 'Bitcoin', required: true }] },
  { id: 'github', route: '/github', method: 'GET', price: '0.005', category: 'Developer', params: [{ name: 'username', defaultValue: 'Wintyx57', required: true }] },
  { id: 'countries', route: '/countries', method: 'GET', price: '0.005', category: 'Data', params: [{ name: 'name', defaultValue: 'France', required: true }] },
  { id: 'hash', route: '/hash', method: 'GET', price: '0.005', category: 'Developer', params: [{ name: 'text', defaultValue: 'hello', required: true }, { name: 'algo', defaultValue: 'sha256' }] },
  { id: 'currency', route: '/currency', method: 'GET', price: '0.005', category: 'Finance', params: [{ name: 'from', defaultValue: 'USD', required: true }, { name: 'to', defaultValue: 'EUR', required: true }] },
  { id: 'dns', route: '/dns', method: 'GET', price: '0.005', category: 'Developer', params: [{ name: 'domain', defaultValue: 'google.com', required: true }] },
];

function highlightJSON(json) {
  if (typeof json !== 'string') return '';
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*")\s*:/g, '<span style="color:#60A5FA">$1</span>:')
    .replace(/("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*")/g, '<span style="color:#34D399">$1</span>')
    .replace(/\b(-?\d+\.?\d*([eE][+-]?\d+)?)\b/g, '<span style="color:#FBBF24">$1</span>')
    .replace(/\b(true|false)\b/g, '<span style="color:#FF9900">$1</span>')
    .replace(/\bnull\b/g, '<span style="color:#6B7280">null</span>');
}

function generateCode(api, params, tab) {
  const qs = api.params.length > 0
    ? '?' + api.params.map(p => `${p.name}=${encodeURIComponent(params[p.name] || p.defaultValue)}`).join('&')
    : '';
  const url = `https://x402-api.onrender.com${api.route}${qs}`;

  if (tab === 'curl') {
    return `# Step 1: Call the API (returns 402 with payment details)
curl "${url}"

# Step 2: Pay USDC on Base to the recipient address
# (use your wallet to send the exact amount)

# Step 3: Retry with transaction hash
curl -H "X-Payment-TX: 0xYOUR_TX_HASH" \\
     "${url}"`;
  }

  if (tab === 'javascript') {
    return `// Step 1: Call the API
const res = await fetch("${url}");

if (res.status === 402) {
  const payment = await res.json();
  console.log("Payment required:", payment);

  // Step 2: Send USDC payment on Base
  // payment.address = recipient, payment.price = amount
  const txHash = await sendUSDCPayment(payment);

  // Step 3: Retry with tx hash
  const data = await fetch("${url}", {
    headers: { "X-Payment-TX": txHash }
  }).then(r => r.json());

  console.log("Result:", data);
}`;
  }

  if (tab === 'python') {
    return `import requests

# Step 1: Call the API
res = requests.get("${url}")

if res.status_code == 402:
    payment = res.json()
    print("Payment required:", payment)

    # Step 2: Send USDC payment on Base
    # payment["address"] = recipient, payment["price"] = amount
    tx_hash = send_usdc_payment(payment)

    # Step 3: Retry with tx hash
    data = requests.get("${url}",
        headers={"X-Payment-TX": tx_hash}
    ).json()

    print("Result:", data)`;
  }

  return '';
}

export default function Playground() {
  const { t } = useTranslation();
  const pg = t.playground || {};
  useSEO({
    title: pg.title || 'API Playground',
    description: 'Test x402 Bazaar APIs live in the browser. See the HTTP 402 payment protocol in action and generate ready-to-use code.'
  });

  const heroRef = useReveal();
  const mainRef = useReveal();

  const [selectedApi, setSelectedApi] = useState(null);
  const [params, setParams] = useState({});
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('curl');

  const handleSelectApi = useCallback((api) => {
    setSelectedApi(api);
    const defaults = {};
    api.params.forEach(p => { defaults[p.name] = p.defaultValue; });
    setParams(defaults);
    setResponse(null);
  }, []);

  const handleSend = useCallback(async () => {
    if (!selectedApi || loading) return;
    setLoading(true);
    setResponse(null);

    const qs = selectedApi.params.length > 0
      ? '?' + selectedApi.params.map(p => `${p.name}=${encodeURIComponent(params[p.name] || '')}`).join('&')
      : '';
    const url = `${API_URL}${selectedApi.route}${qs}`;

    const start = performance.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      const duration = Math.round(performance.now() - start);
      let body;
      try { body = await res.json(); } catch { body = { error: 'Non-JSON response' }; }
      setResponse({ status: res.status, statusText: res.statusText, body, duration, url });
    } catch (err) {
      clearTimeout(timeout);
      const duration = Math.round(performance.now() - start);
      setResponse({
        status: 0, statusText: 'Network Error',
        body: { error: err.name === 'AbortError' ? 'Request timed out (15s)' : err.message },
        duration, url
      });
    } finally {
      setLoading(false);
    }
  }, [selectedApi, params, loading]);

  const statusColor = (status) => {
    if (status === 402) return 'bg-[#FF9900]/20 text-[#FF9900] border-[#FF9900]/30';
    if (status >= 200 && status < 300) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (status >= 400) return 'bg-red-500/20 text-red-400 border-red-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const jsonStr = response?.body ? JSON.stringify(response.body, null, 2) : '';

  const tabs = [
    { key: 'curl', label: pg.tabCurl || 'cURL' },
    { key: 'javascript', label: pg.tabJavascript || 'JavaScript' },
    { key: 'python', label: pg.tabPython || 'Python' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0e17] to-[#131921] pt-28 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div ref={heroRef} className="reveal-section text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20 mb-4">
            API Playground
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {pg.title || 'Test APIs Live'}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto mb-6">
            {pg.subtitle || 'Select an API, tweak the parameters, and see the x402 payment protocol in action.'}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF9900]/5 border border-[#FF9900]/15 text-sm text-[#FF9900]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {pg.protocolBanner || 'Paid APIs return HTTP 402 — this is the x402 protocol in action!'}
          </div>
        </div>

        {/* Main layout */}
        <div ref={mainRef} className="reveal-section grid lg:grid-cols-[340px_1fr] gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* API Selector */}
            <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">{pg.selectApi || 'Select an API'}</h3>
              <div className="grid grid-cols-2 gap-2">
                {PLAYGROUND_APIS.map(api => (
                  <button
                    key={api.id}
                    onClick={() => handleSelectApi(api)}
                    className={`text-left px-3 py-2.5 rounded-lg text-xs transition-all duration-200 cursor-pointer border ${
                      selectedApi?.id === api.id
                        ? 'bg-[#FF9900]/10 border-[#FF9900]/40 text-white'
                        : 'bg-white/[0.02] border-white/6 text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="font-medium capitalize truncate">{api.id}</div>
                    <span className={`text-[10px] mt-0.5 inline-block ${
                      selectedApi?.id === api.id ? 'text-[#FF9900]' : 'text-gray-500'
                    }`}>${api.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Param Form */}
            {selectedApi && (
              <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-3">{pg.parameters || 'Parameters'}</h3>
                <div className="space-y-3">
                  {selectedApi.params.map(p => (
                    <div key={p.name}>
                      <div className="flex items-center gap-2 mb-1">
                        <label className="text-xs text-gray-400 font-mono">{p.name}</label>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          p.required ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-500'
                        }`}>
                          {p.required ? (pg.required || 'required') : (pg.optional || 'optional')}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={params[p.name] || ''}
                        onChange={e => setParams(prev => ({ ...prev, [p.name]: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                                   placeholder-gray-600 focus:outline-none focus:border-[#FF9900]/50 transition-colors"
                        placeholder={p.defaultValue}
                      />
                    </div>
                  ))}
                  {selectedApi.params.length === 0 && (
                    <p className="text-xs text-gray-500 italic">{pg.noParams || 'No parameters needed'}</p>
                  )}
                </div>
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="w-full mt-4 py-2.5 rounded-lg text-sm font-medium text-white cursor-pointer border-none
                             bg-gradient-to-r from-[#FF9900] to-[#FF6600] hover:from-[#FFa500] hover:to-[#FF7700]
                             disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading
                    ? (pg.sending || 'Sending...')
                    : `${pg.sendRequest || 'Send Request'} — ${selectedApi.method} ${selectedApi.route}`
                  }
                </button>
                <p className="text-[11px] text-gray-500 mt-2 text-center">
                  {pg.paymentNote || 'No real payment will be made — you\'ll see the 402 response'}
                </p>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Response Viewer */}
            <div className="bg-white/[0.03] border border-white/8 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
                <h3 className="text-sm font-semibold text-white">{pg.responseTitle || 'Response'}</h3>
                {response && (
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-mono border ${statusColor(response.status)}`}>
                      {response.status} {response.statusText}
                    </span>
                    <span className="text-xs text-gray-500">{response.duration}ms</span>
                  </div>
                )}
              </div>
              <div className="relative">
                {response ? (
                  <>
                    <CopyButton text={jsonStr} label={pg.copy || 'Copy'} copiedLabel={pg.copied || 'Copied'} />
                    <pre
                      className="p-4 text-xs leading-relaxed overflow-x-auto max-h-[500px] overflow-y-auto font-mono"
                      dangerouslySetInnerHTML={{ __html: highlightJSON(jsonStr) }}
                    />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <svg className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">{pg.emptyState || 'Select an API and click Send to see the response'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Code Examples */}
            {selectedApi && (
              <div className="bg-white/[0.03] border border-white/8 rounded-xl overflow-hidden">
                <div className="flex items-center gap-1 px-4 py-2 border-b border-white/6">
                  <h3 className="text-sm font-semibold text-white mr-3">{pg.codeExamples || 'Code Examples'}</h3>
                  {tabs.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer border-none ${
                        activeTab === tab.key
                          ? 'bg-[#FF9900]/15 text-[#FF9900]'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <CopyButton
                    text={generateCode(selectedApi, params, activeTab)}
                    label={pg.copy || 'Copy'}
                    copiedLabel={pg.copied || 'Copied'}
                  />
                  <pre className="p-4 text-xs leading-relaxed overflow-x-auto max-h-[400px] overflow-y-auto font-mono text-gray-300">
                    {generateCode(selectedApi, params, activeTab)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
