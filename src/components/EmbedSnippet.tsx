import { useState } from 'react';
import CopyButton from './CopyButton';
import { API_URL } from '../config';

type Lang = 'curl' | 'javascript' | 'python';

interface EmbedSnippetProps {
  serviceId: string;
  serviceName?: string;
  chainKey?: string;
}

const PROXY_BASE = `${API_URL}/api/call`;

function getSnippet(serviceId: string, lang: Lang, chainKey: string): string {
  const url = `${PROXY_BASE}/${serviceId}`;

  if (lang === 'curl') {
    return `# Call via x402 Proxy — No SDK required
curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -H "X-Payment-TxHash: YOUR_TX_HASH" \\
  -H "X-Payment-Chain: ${chainKey}"`;
  }

  if (lang === 'javascript') {
    return `// Call via x402 Proxy — No SDK required
const res = await fetch("${url}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Payment-TxHash": txHash,
    "X-Payment-Chain": "${chainKey}"
  },
  body: JSON.stringify({ /* your params */ })
});
const data = await res.json();`;
  }

  return `# Call via x402 Proxy — No SDK required
import requests

res = requests.post(
    "${url}",
    headers={
        "X-Payment-TxHash": tx_hash,
        "X-Payment-Chain": "${chainKey}"
    },
    json={},  # your params
)
print(res.json())`;
}

export default function EmbedSnippet({ serviceId, serviceName, chainKey = 'skale' }: EmbedSnippetProps) {
  const [lang, setLang] = useState<Lang>('curl');
  const snippet = getSnippet(serviceId, lang, chainKey);
  const tabs: { key: Lang; label: string }[] = [
    { key: 'curl', label: 'cURL' },
    { key: 'javascript', label: 'JavaScript' },
    { key: 'python', label: 'Python' },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/8">
        <svg className="w-4 h-4 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        <span className="text-xs font-semibold text-white">
          {serviceName ? `Embed — ${serviceName}` : 'Embed this API'}
        </span>
        <div className="flex gap-1 ml-auto" role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              role="tab"
              aria-selected={lang === tab.key}
              aria-controls={`panel-${tab.key}`}
              onClick={() => setLang(tab.key)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer border-none ${
                lang === tab.key
                  ? 'bg-[#FF9900]/15 text-[#FF9900]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        <CopyButton text={snippet} label="Copy" copiedLabel="Copied!" />
        {tabs.map(tab => (
          <div
            key={tab.key}
            id={`panel-${tab.key}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.key}`}
            tabIndex={0}
            hidden={lang !== tab.key}
          >
            <pre className="p-4 text-xs leading-relaxed overflow-x-auto font-mono text-green-400 bg-black/30 max-h-[240px] overflow-y-auto">
              {snippet}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
