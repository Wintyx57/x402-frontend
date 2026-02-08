import { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';

const CLAUDE_CONFIG = `{
  "mcpServers": {
    "x402-bazaar": {
      "command": "node",
      "args": ["/path/to/x402-bazaar/mcp-server.mjs"],
      "env": {
        "COINBASE_API_KEY": "your-cdp-api-key",
        "COINBASE_API_SECRET": "your-cdp-api-secret",
        "AGENT_SEED_PATH": "/path/to/agent-seed.json",
        "X402_SERVER_URL": "https://x402-api.onrender.com",
        "MAX_BUDGET_USDC": "1.00",
        "NETWORK": "mainnet"
      }
    }
  }
}`;

const CURSOR_CONFIG = `{
  "mcpServers": {
    "x402-bazaar": {
      "command": "node",
      "args": ["/path/to/x402-bazaar/mcp-server.mjs"],
      "env": {
        "COINBASE_API_KEY": "your-cdp-api-key",
        "COINBASE_API_SECRET": "your-cdp-api-secret",
        "AGENT_SEED_PATH": "/path/to/agent-seed.json",
        "X402_SERVER_URL": "https://x402-api.onrender.com",
        "MAX_BUDGET_USDC": "1.00",
        "NETWORK": "mainnet"
      }
    }
  }
}`;

const CLAUDE_CODE_CMD = `claude mcp add x402-bazaar -- node /path/to/x402-bazaar/mcp-server.mjs`;

const tools = [
  { name: 'discover_marketplace', cost: 'Free', desc_en: 'Discover the marketplace, available endpoints and total services', desc_fr: 'Decouvrir la marketplace, endpoints et nombre de services' },
  { name: 'search_services', cost: '0.05 USDC', desc_en: 'Search APIs by keyword (weather, crypto, ai...)', desc_fr: 'Rechercher des APIs par mot-cle (meteo, crypto, ia...)' },
  { name: 'list_services', cost: '0.05 USDC', desc_en: 'List the full catalog of available services', desc_fr: 'Lister le catalogue complet des services' },
  { name: 'call_api', cost: 'Free', desc_en: 'Call any external API URL and return the response', desc_fr: 'Appeler une API externe et retourner la reponse' },
  { name: 'get_wallet_balance', cost: 'Free', desc_en: 'Check agent USDC balance on Base', desc_fr: 'Verifier le solde USDC de l\'agent sur Base' },
  { name: 'get_budget_status', cost: 'Free', desc_en: 'Check session spending, remaining budget and payment history', desc_fr: 'Verifier les depenses de session, budget restant et historique' },
];

const ClaudeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/>
  </svg>
);
const CursorIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 3l14 7.5L12.5 13l4 7.5-2.5 1-4-7.5L5 17V3z"/>
  </svg>
);
const VsCodeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>
);
const TerminalIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5"/>
    <line x1="12" y1="19" x2="20" y2="19"/>
  </svg>
);

const ides = [
  { id: 'claude-desktop', name: 'Claude Desktop', icon: <ClaudeIcon /> },
  { id: 'cursor', name: 'Cursor', icon: <CursorIcon /> },
  { id: 'vscode', name: 'VS Code', icon: <VsCodeIcon /> },
  { id: 'claude-code', name: 'Claude Code CLI', icon: <TerminalIcon /> },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 px-2.5 py-1 text-xs rounded-md bg-white/10 hover:bg-white/20
                 text-gray-400 hover:text-white transition-all duration-200 cursor-pointer border-none"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

function CodeBlock({ code, language }) {
  return (
    <div className="relative group">
      <CopyButton text={code} />
      <pre className="bg-[#0d1117] border border-white/10 rounded-xl p-5 pt-12 overflow-x-auto text-sm leading-relaxed">
        <code className="text-gray-300 font-mono">{code}</code>
      </pre>
    </div>
  );
}

export default function MCP() {
  const { t, lang } = useTranslation();
  const m = t.mcp;
  const [selectedIde, setSelectedIde] = useState('claude-desktop');
  const reveal = useReveal();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="mb-12" ref={reveal}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/20 text-[#FF9900] text-xs font-medium mb-4">
          MCP Server
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{m.title}</h1>
        <p className="text-gray-400 text-lg max-w-2xl">{m.subtitle}</p>
      </div>

      {/* What is MCP */}
      <section className="mb-12" ref={reveal}>
        <h2 className="text-2xl font-bold text-white mb-4">{m.whatTitle}</h2>
        <div className="glass-card rounded-xl p-6">
          <p className="text-gray-400 leading-relaxed mb-4">{m.whatDesc}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4 flex flex-col items-center text-center">
              <svg className="w-8 h-8 text-[#FF9900] mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v6m-4-4v4m8-4v4M8 8h8v4a4 4 0 01-4 4 4 4 0 01-4-4V8zm4 8v6"/>
              </svg>
              <div className="text-white font-medium text-sm">{m.benefit1}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 flex flex-col items-center text-center">
              <svg className="w-8 h-8 text-[#FF9900] mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.66 0-3 1-3 2.5S10.34 13 12 13c1.66 0 3 1 3 2.5S13.66 18 12 18c-1 0-2-.5-2.5-1.5M12 6v2m0 8v2"/>
              </svg>
              <div className="text-white font-medium text-sm">{m.benefit2}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 flex flex-col items-center text-center">
              <svg className="w-8 h-8 text-[#FF9900] mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
                <path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
              <div className="text-white font-medium text-sm">{m.benefit3}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Tools */}
      <section className="mb-12" ref={reveal}>
        <h2 className="text-2xl font-bold text-white mb-4">{m.toolsTitle}</h2>
        <div className="space-y-3">
          {tools.map(tool => (
            <div key={tool.name} className="glass-card rounded-xl p-4 flex items-start gap-4">
              <code className="text-[#FF9900] font-mono text-sm font-medium shrink-0 bg-[#FF9900]/10 px-2 py-1 rounded">
                {tool.name}
              </code>
              <div className="flex-1 min-w-0">
                <p className="text-gray-300 text-sm">{lang === 'fr' ? tool.desc_fr : tool.desc_en}</p>
              </div>
              <span className={`shrink-0 text-xs font-mono font-bold px-2 py-1 rounded ${
                tool.cost === 'Free'
                  ? 'bg-[#34D399]/10 text-[#34D399]'
                  : 'bg-[#FF9900]/10 text-[#FF9900]'
              }`}>
                {tool.cost === 'Free' ? (lang === 'fr' ? 'Gratuit' : 'Free') : tool.cost}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works (flow) */}
      <section className="mb-12" ref={reveal}>
        <h2 className="text-2xl font-bold text-white mb-4">{m.flowTitle}</h2>
        <div className="glass-card rounded-xl p-6">
          <div className="space-y-4">
            {[m.flow1, m.flow2, m.flow3, m.flow4].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF9900]/15 text-[#FF9900] flex items-center justify-center text-sm font-bold shrink-0">
                  {i + 1}
                </div>
                <p className="text-gray-300 text-sm pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wallet Setup */}
      <section className="mb-12" ref={reveal}>
        <h2 className="text-2xl font-bold text-white mb-4">{m.walletTitle}</h2>
        <div className="glass-card rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-5">{m.walletDesc}</p>
          <div className="space-y-4">
            {[m.walletStep1, m.walletStep2, m.walletStep3, m.walletStep4].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <p className="text-gray-300 text-sm pt-0.5">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 p-4 rounded-lg bg-[#34D399]/5 border border-[#34D399]/20">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <p className="text-[#34D399] text-sm">{m.walletTestnetTip}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Budget */}
      <section className="mb-12" ref={reveal}>
        <h2 className="text-2xl font-bold text-white mb-4">{m.securityTitle}</h2>
        <div className="glass-card rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-5">{m.securityDesc}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-[#FF9900]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span className="text-white font-medium text-sm">{m.securityFeature1}</span>
              </div>
              <p className="text-gray-400 text-xs">{m.securityFeature1Desc}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-[#FF9900]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span className="text-white font-medium text-sm">{m.securityFeature2}</span>
              </div>
              <p className="text-gray-400 text-xs">{m.securityFeature2Desc}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-[#FF9900]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <span className="text-white font-medium text-sm">{m.securityFeature3}</span>
              </div>
              <p className="text-gray-400 text-xs">{m.securityFeature3Desc}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-[#FF9900]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span className="text-white font-medium text-sm">{m.securityFeature4}</span>
              </div>
              <p className="text-gray-400 text-xs">{m.securityFeature4Desc}</p>
            </div>
          </div>
          <div className="bg-[#0d1117] border border-white/10 rounded-xl p-4">
            <p className="text-gray-500 text-xs font-mono mb-2">{m.securityConfigLabel}</p>
            <code className="text-[#FF9900] text-sm font-mono">MAX_BUDGET_USDC=1.00</code>
            <p className="text-gray-500 text-xs mt-2">{m.securityConfigDesc}</p>
          </div>
        </div>
      </section>

      {/* Installation by IDE */}
      <section className="mb-12" ref={reveal}>
        <h2 className="text-2xl font-bold text-white mb-4">{m.installTitle}</h2>

        {/* Prerequisites */}
        <div className="glass-card rounded-xl p-5 mb-6">
          <h3 className="text-white font-semibold mb-3">{m.prereqTitle}</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-400 text-sm">
            <li>{m.prereq1}</li>
            <li>{m.prereq2}</li>
            <li>{m.prereq3}</li>
          </ol>
          <CodeBlock code={`git clone https://github.com/Wintyx57/x402-backend.git
cd x402-backend
npm install`} />
        </div>

        {/* IDE Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {ides.map(ide => (
            <button
              key={ide.id}
              onClick={() => setSelectedIde(ide.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                         cursor-pointer border-none transition-all duration-200 ${
                selectedIde === ide.id
                  ? 'bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{ide.icon}</span>
              {ide.name}
            </button>
          ))}
        </div>

        {/* Config panels */}
        <div className="glass-card rounded-xl p-5">
          {selectedIde === 'claude-desktop' && (
            <div>
              <h3 className="text-white font-semibold mb-2">Claude Desktop</h3>
              <p className="text-gray-400 text-sm mb-4">{m.claudeDesktopDesc}</p>
              <p className="text-gray-500 text-xs mb-2 font-mono">
                {m.claudeDesktopPath}
              </p>
              <CodeBlock code={CLAUDE_CONFIG} language="json" />
            </div>
          )}

          {selectedIde === 'cursor' && (
            <div>
              <h3 className="text-white font-semibold mb-2">Cursor</h3>
              <p className="text-gray-400 text-sm mb-4">{m.cursorDesc}</p>
              <p className="text-gray-500 text-xs mb-2 font-mono">
                {m.cursorPath}
              </p>
              <CodeBlock code={CURSOR_CONFIG} language="json" />
            </div>
          )}

          {selectedIde === 'vscode' && (
            <div>
              <h3 className="text-white font-semibold mb-2">VS Code</h3>
              <p className="text-gray-400 text-sm mb-4">{m.vscodeDesc}</p>
              <p className="text-gray-500 text-xs mb-2 font-mono">
                {m.vscodePath}
              </p>
              <CodeBlock code={CLAUDE_CONFIG} language="json" />
            </div>
          )}

          {selectedIde === 'claude-code' && (
            <div>
              <h3 className="text-white font-semibold mb-2">Claude Code CLI</h3>
              <p className="text-gray-400 text-sm mb-4">{m.claudeCodeDesc}</p>
              <CodeBlock code={CLAUDE_CODE_CMD} language="bash" />
              <p className="text-gray-500 text-xs mt-3">{m.claudeCodeNote}</p>
            </div>
          )}
        </div>
      </section>

      {/* Try it */}
      <section className="mb-12" ref={reveal}>
        <h2 className="text-2xl font-bold text-white mb-4">{m.tryTitle}</h2>
        <div className="glass-card rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-4">{m.tryDesc}</p>
          <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
            <p className="text-gray-500 text-xs font-mono mb-3">{m.tryPromptLabel}</p>
            <p className="text-white font-medium italic">"{m.tryPrompt}"</p>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{m.tryResultLabel}</p>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[#FF9900]">1.</span>
              <span className="text-gray-300">{m.tryStep1}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[#FF9900]">2.</span>
              <span className="text-gray-300">{m.tryStep2}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[#FF9900]">3.</span>
              <span className="text-gray-300">{m.tryStep3}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[#FF9900]">4.</span>
              <span className="text-gray-300">{m.tryStep4}</span>
            </div>
          </div>
        </div>
      </section>

      {/* GitHub CTA */}
      <section ref={reveal}>
        <div className="rounded-xl border border-[#FF9900]/30 bg-gradient-to-br from-[#FF9900]/[0.08] to-transparent p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">{m.ctaTitle}</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">{m.ctaDesc}</p>
          <a
            href="https://github.com/Wintyx57/x402-backend"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF9900] text-[#0a0a0f] font-semibold
                       hover:bg-[#FFB033] transition-colors duration-200 no-underline"
          >
            GitHub Repository
          </a>
        </div>
      </section>
    </div>
  );
}
