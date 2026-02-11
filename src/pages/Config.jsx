import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';

const environments = [
  { id: 'claude-desktop', name: 'Claude Desktop', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/></svg> },
  { id: 'cursor', name: 'Cursor', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 7.5L12.5 13l4 7.5-2.5 1-4-7.5L5 17V3z"/></svg> },
  { id: 'claude-code', name: 'Claude Code', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg> },
  { id: 'vscode-continue', name: 'VS Code + Continue', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
  { id: 'generic', name: 'Generic', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
];

function detectOS() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('win')) return 'windows';
  if (ua.includes('mac')) return 'macos';
  return 'linux';
}

function getInstallDir(os) {
  if (os === 'windows') return 'C:\\Users\\<you>\\x402-bazaar';
  return '~/.x402-bazaar';
}

function getConfigPath(env, os) {
  const paths = {
    'claude-desktop': {
      windows: '%APPDATA%\\Claude\\claude_desktop_config.json',
      macos: '~/Library/Application Support/Claude/claude_desktop_config.json',
      linux: '~/.config/Claude/claude_desktop_config.json',
    },
    'claude-code': {
      windows: '~/.claude.json',
      macos: '~/.claude.json',
      linux: '~/.claude.json',
    },
    cursor: {
      windows: '~/.cursor/mcp.json',
      macos: '~/.cursor/mcp.json',
      linux: '~/.cursor/mcp.json',
    },
    'vscode-continue': {
      windows: '~/.continue/config.json',
      macos: '~/.continue/config.json',
      linux: '~/.continue/config.json',
    },
    generic: {
      windows: 'mcp-config.json',
      macos: 'mcp-config.json',
      linux: 'mcp-config.json',
    },
  };
  return paths[env]?.[os] || 'mcp-config.json';
}

function generateConfig({ env, serverUrl, maxBudget, network, withWallet, apiKey, apiSecret, installDir }) {
  const mcpServerPath = installDir + (installDir.includes('\\') ? '\\mcp-server.mjs' : '/mcp-server.mjs');
  const seedPath = installDir + (installDir.includes('\\') ? '\\agent-seed.json' : '/agent-seed.json');

  const envVars = {
    X402_SERVER_URL: serverUrl,
    MAX_BUDGET_USDC: maxBudget,
    NETWORK: network,
  };

  if (withWallet) {
    envVars.COINBASE_API_KEY = apiKey || 'YOUR_COINBASE_API_KEY';
    envVars.COINBASE_API_SECRET = apiSecret || 'YOUR_COINBASE_API_SECRET';
    envVars.AGENT_SEED_PATH = seedPath;
  }

  const serverEntry = {
    command: 'node',
    args: [mcpServerPath],
    env: envVars,
  };

  if (env === 'vscode-continue') {
    return {
      models: [],
      mcpServers: [
        { name: 'x402-bazaar', ...serverEntry },
      ],
    };
  }

  return {
    mcpServers: {
      'x402-bazaar': serverEntry,
    },
  };
}

function ConfigCopyButton({ text, labels }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail in insecure contexts
    }
  };
  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 px-2.5 py-1 text-xs rounded-md bg-white/10 hover:bg-white/20
                 text-gray-400 hover:text-white transition-all duration-200 cursor-pointer border-none"
    >
      {copied ? labels.copied : labels.copyBtn}
    </button>
  );
}

export default function Config() {
  const { t } = useTranslation();
  const c = t.config;
  const reveal = useReveal();

  useEffect(() => { document.title = 'Config Generator | x402 Bazaar'; }, []);

  const detectedOs = useMemo(() => detectOS(), []);

  const [selectedEnv, setSelectedEnv] = useState('claude-desktop');
  const [serverUrl, setServerUrl] = useState('https://x402-api.onrender.com');
  const [maxBudget, setMaxBudget] = useState('1.00');
  const [network, setNetwork] = useState('mainnet');
  const [withWallet, setWithWallet] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  const installDir = useMemo(() => getInstallDir(detectedOs), [detectedOs]);
  const configPath = useMemo(() => getConfigPath(selectedEnv, detectedOs), [selectedEnv, detectedOs]);

  const configJson = useMemo(() => {
    return JSON.stringify(
      generateConfig({ env: selectedEnv, serverUrl, maxBudget, network, withWallet, apiKey, apiSecret, installDir }),
      null,
      2
    );
  }, [selectedEnv, serverUrl, maxBudget, network, withWallet, apiKey, apiSecret, installDir]);

  // Masked version for display (hide credentials)
  const configJsonMasked = useMemo(() => {
    return configJson
      .replace(/"COINBASE_API_KEY":\s*"[^"]*"/g, '"COINBASE_API_KEY": "***"')
      .replace(/"COINBASE_API_SECRET":\s*"[^"]*"/g, '"COINBASE_API_SECRET": "***"');
  }, [configJson]);

  const osLabel = detectedOs === 'windows' ? 'Windows' : detectedOs === 'macos' ? 'macOS' : 'Linux';

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="mb-12" ref={reveal}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/20 text-[#FF9900] text-xs font-medium mb-4">
          Config Generator
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{c.title}</h1>
        <p className="text-gray-400 text-lg max-w-2xl">{c.subtitle}</p>
      </div>

      {/* Form */}
      <section className="mb-12" ref={useReveal()}>
        <div className="glass-card rounded-xl p-6 space-y-6">

          {/* Environment selector */}
          <div>
            <label className="text-white font-medium text-sm block mb-3">{c.envLabel}</label>
            <div className="flex gap-2 flex-wrap">
              {environments.map(env => (
                <button
                  key={env.id}
                  onClick={() => setSelectedEnv(env.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                             cursor-pointer border-none transition-all duration-200 ${
                    selectedEnv === env.id
                      ? 'bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/30'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{env.icon}</span>
                  {env.name}
                </button>
              ))}
            </div>
          </div>

          {/* Server URL */}
          <div>
            <label className="text-white font-medium text-sm block mb-2">{c.serverUrlLabel}</label>
            <input
              type="text"
              value={serverUrl}
              onChange={e => setServerUrl(e.target.value)}
              className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white
                         font-mono placeholder-gray-500 focus:outline-none focus:border-[#FF9900]/50 transition-colors"
            />
          </div>

          {/* Budget + Network row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-white font-medium text-sm block mb-2">{c.budgetLabel}</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={maxBudget}
                  onChange={e => setMaxBudget(e.target.value)}
                  className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-2.5 pr-16 text-sm text-white
                             font-mono placeholder-gray-500 focus:outline-none focus:border-[#FF9900]/50 transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">USDC</span>
              </div>
            </div>
            <div>
              <label className="text-white font-medium text-sm block mb-2">{c.networkLabel}</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNetwork('mainnet')}
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer border-none transition-all duration-200 ${
                    network === 'mainnet'
                      ? 'bg-[#FF9900]/15 text-[#FF9900]'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {c.mainnet}
                </button>
                <button
                  onClick={() => setNetwork('testnet')}
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer border-none transition-all duration-200 ${
                    network === 'testnet'
                      ? 'bg-[#34D399]/15 text-[#34D399]'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {c.testnet}
                </button>
              </div>
            </div>
          </div>

          {/* Wallet mode toggle */}
          <div>
            <label className="text-white font-medium text-sm block mb-2">{c.walletMode}</label>
            <div className="flex gap-2">
              <button
                onClick={() => setWithWallet(false)}
                className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer border-none transition-all duration-200 ${
                  !withWallet
                    ? 'bg-[#FF9900]/15 text-[#FF9900]'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {c.readOnly}
              </button>
              <button
                onClick={() => setWithWallet(true)}
                className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer border-none transition-all duration-200 ${
                  withWallet
                    ? 'bg-[#FF9900]/15 text-[#FF9900]'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {c.withWallet}
              </button>
            </div>
          </div>

          {/* Wallet credentials (conditional) */}
          {withWallet && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/5">
              <div>
                <label className="text-white font-medium text-sm block mb-2">{c.apiKeyLabel}</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="organizations/..."
                  className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white
                             font-mono placeholder-gray-500 focus:outline-none focus:border-[#FF9900]/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-white font-medium text-sm block mb-2">{c.apiSecretLabel}</label>
                <input
                  type="password"
                  value={apiSecret}
                  onChange={e => setApiSecret(e.target.value)}
                  placeholder="-----BEGIN EC PRIVATE KEY-----"
                  className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white
                             font-mono placeholder-gray-500 focus:outline-none focus:border-[#FF9900]/50 transition-colors"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* JSON Preview */}
      <section className="mb-12" ref={useReveal()}>
        <h2 className="text-2xl font-bold text-white mb-4">{c.previewTitle}</h2>
        {withWallet && (apiKey || apiSecret) && (
          <div className="mb-4 p-3 rounded-lg bg-[#FF9900]/5 border border-[#FF9900]/20 flex items-start gap-2">
            <svg className="w-4 h-4 text-[#FF9900] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p className="text-[#FF9900] text-xs">Credentials are masked in preview. The full JSON with real values is copied to your clipboard when you click Copy.</p>
          </div>
        )}
        <div className="relative group">
          <ConfigCopyButton text={configJson} labels={{ copied: c.copied, copyBtn: c.copyBtn }} />
          <pre className="bg-[#0d1117] border border-white/10 rounded-xl p-5 pt-12 overflow-x-auto text-sm leading-relaxed">
            <code className="text-gray-300 font-mono">{configJsonMasked}</code>
          </pre>
        </div>
      </section>

      {/* Where to paste */}
      <section className="mb-12" ref={useReveal()}>
        <h2 className="text-2xl font-bold text-white mb-4">{c.pathTitle}</h2>
        <div className="glass-card rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-4">{c.pathDesc}</p>
          <div className="bg-[#0d1117] border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-xs font-medium uppercase tracking-wider shrink-0">{c.detectedOs}</span>
              <span className="text-[#34D399] text-sm font-medium">{osLabel}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-gray-500 text-xs font-medium uppercase tracking-wider shrink-0 pt-0.5">{c.envLabel}</span>
              <span className="text-white text-sm font-medium">{environments.find(e => e.id === selectedEnv)?.name}</span>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-[#FF9900] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                <polyline points="13 2 13 9 20 9"/>
              </svg>
              <code className="text-[#FF9900] text-sm font-mono break-all">{configPath}</code>
            </div>
          </div>

          {/* Install dir info */}
          <div className="mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>{c.installDirLabel}: <code className="text-gray-400">{installDir}</code></span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — CLI */}
      <section ref={useReveal()}>
        <div className="rounded-xl border border-[#FF9900]/30 bg-gradient-to-br from-[#FF9900]/[0.08] to-transparent p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">{c.ctaTitle}</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">{c.ctaDesc}</p>
          <div className="inline-flex items-center gap-2 bg-[#0d1117] border border-[#FF9900]/30 rounded-xl px-5 py-3 font-mono text-sm">
            <span className="text-gray-500">$</span>
            <span className="text-[#FF9900] font-medium">npx x402-bazaar init</span>
          </div>
        </div>
      </section>
    </div>
  );
}
