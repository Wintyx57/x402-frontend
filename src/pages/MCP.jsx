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
        "X402_SERVER_URL": "https://x402-api.onrender.com"
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
        "X402_SERVER_URL": "https://x402-api.onrender.com"
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
];

const ides = [
  { id: 'claude-desktop', name: 'Claude Desktop', icon: '🟠' },
  { id: 'cursor', name: 'Cursor', icon: '⚡' },
  { id: 'vscode', name: 'VS Code', icon: '💻' },
  { id: 'claude-code', name: 'Claude Code CLI', icon: '⌨️' },
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
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🔌</div>
              <div className="text-white font-medium text-sm">{m.benefit1}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">💰</div>
              <div className="text-white font-medium text-sm">{m.benefit2}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🤖</div>
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
