import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Code, CircleDollarSign, Package, BookOpen, Plug } from 'lucide-react';
import useSEO from '../hooks/useSEO';

interface PathItem {
  icon: ReactNode;
  title: string;
  description: string;
  steps: { code: boolean; text: string; suffix?: string }[];
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

const paths: PathItem[] = [
  {
    icon: <Bot className="w-7 h-7" />,
    title: 'I have an AI Agent',
    description: 'Connect your agent to 60+ APIs. Pay per call with USDC, no API keys needed.',
    steps: [
      { code: true, text: 'npx x402-bazaar init', suffix: '— auto-configure wallet + MCP' },
      { code: false, text: 'Fund your wallet with USDC on Base' },
      { code: false, text: 'Start calling APIs — payments are automatic' },
    ],
    primaryLabel: 'Setup MCP Server',
    primaryHref: '/mcp',
    secondaryLabel: 'View API catalog',
    secondaryHref: '/services',
  },
  {
    icon: <Code className="w-7 h-7" />,
    title: "I'm a Developer",
    description: 'Integrate x402 protocol in your app. Call paid APIs or build your own payment layer.',
    steps: [
      { code: false, text: 'Read the API docs — 69 endpoints documented' },
      { code: true, text: 'npm install x402-bazaar', suffix: '' },
      { code: false, text: 'Make your first paid API call' },
    ],
    primaryLabel: 'Read the Docs',
    primaryHref: '/developers',
    secondaryLabel: 'Try the Playground',
    secondaryHref: '/playground',
  },
  {
    icon: <CircleDollarSign className="w-7 h-7" />,
    title: 'I have an API to monetize',
    description: 'List your API and earn USDC from AI agents. 95% revenue, instant on-chain settlement.',
    steps: [
      { code: false, text: 'Register your endpoint on x402 Bazaar' },
      { code: false, text: 'Set your price in USDC (from $0.001/call)' },
      { code: false, text: 'Get discovered and paid automatically' },
    ],
    primaryLabel: 'List My API',
    primaryHref: '/register',
    secondaryLabel: 'View all services',
    secondaryHref: '/services',
  },
];

interface QuickLink {
  icon: ReactNode;
  label: string;
  text: string;
  isCode: boolean;
  href: string | null;
}

const quickLinks: QuickLink[] = [
  { icon: <Package className="w-4 h-4" />, label: 'Install CLI', text: 'npx x402-bazaar init', isCode: true, href: null },
  { icon: <BookOpen className="w-4 h-4" />, label: 'API Reference', text: 'API Reference', isCode: false, href: '/developers' },
  { icon: <Plug className="w-4 h-4" />, label: 'MCP Setup', text: 'MCP Setup', isCode: false, href: '/mcp' },
];

export default function Quickstart() {
  useSEO({
    title: 'Quickstart — Get Started in 5 Minutes',
    description:
      'Choose your path on x402 Bazaar: connect an AI agent, integrate as a developer, or monetize your API. Up and running in 5 minutes.',
    keywords:
      'x402 quickstart, npx x402-bazaar init, HTTP 402 setup, AI agent payment tutorial, USDC wallet Base, MCP quickstart',
  });

  // HowTo JSON-LD structured data
  useEffect(() => {
    const howToSchema = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'Get Started with x402 Bazaar in 5 Minutes',
      description: 'Connect your AI agent or application to 70+ paid APIs using USDC micropayments on Base or SKALE via the HTTP 402 protocol.',
      totalTime: 'PT5M',
      tool: [
        { '@type': 'HowToTool', name: 'Node.js' },
        { '@type': 'HowToTool', name: 'npm or npx' },
        { '@type': 'HowToTool', name: 'USDC wallet on Base' },
      ],
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Run the initializer',
          text: 'Run npx x402-bazaar init in your terminal. This automatically configures your wallet and MCP server.',
          url: 'https://x402bazaar.org/quickstart',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Fund your wallet with USDC on Base',
          text: 'Send USDC to your agent wallet address on Base mainnet. A few dollars is enough to start.',
          url: 'https://x402bazaar.org/quickstart',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Start calling APIs — payments are automatic',
          text: 'Your agent calls any x402 Bazaar API. When a 402 is returned, the wallet pays automatically and the request is retried.',
          url: 'https://x402bazaar.org/quickstart',
        },
      ],
    };

    let script = document.getElementById('howto-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'howto-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(howToSchema);

    return () => {
      const s = document.getElementById('howto-jsonld');
      if (s) s.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">

        {/* Section 1 — Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
            Get Started with{' '}
            <span className="text-[#FF9900]">x402 Bazaar</span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-xl mx-auto">
            Choose your path and be up and running in 5 minutes.
          </p>
        </div>

        {/* Section 2 — 3 parcours */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {paths.map((path) => (
            <div
              key={path.title}
              className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-5 hover:border-white/20 transition-colors"
            >
              {/* Header */}
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FF9900]/10 flex items-center justify-center text-[#FF9900] mb-3">
                  {path.icon}
                </div>
                <h2 className="text-xl font-semibold mb-2">{path.title}</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{path.description}</p>
              </div>

              {/* Steps */}
              <ol className="flex flex-col gap-3">
                {path.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#FF9900]/20 text-[#FF9900] flex items-center justify-center text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-gray-300 leading-snug">
                      {step.code ? (
                        <>
                          <code className="bg-white/10 text-[#FF9900] px-1.5 py-0.5 rounded text-xs font-mono">
                            {step.text}
                          </code>
                          {step.suffix && (
                            <span className="text-gray-400"> {step.suffix}</span>
                          )}
                        </>
                      ) : (
                        step.text
                      )}
                    </span>
                  </li>
                ))}
              </ol>

              {/* CTAs */}
              <div className="flex flex-col gap-3 mt-auto pt-2">
                <Link
                  to={path.primaryHref}
                  className="bg-[#FF9900] text-black font-semibold rounded-lg px-6 py-3 hover:bg-[#FF9900]/90 transition-colors text-center text-sm"
                >
                  {path.primaryLabel}
                </Link>
                <Link
                  to={path.secondaryHref}
                  className="border border-white/20 text-white rounded-lg px-6 py-3 hover:bg-white/5 transition-colors text-center text-sm"
                >
                  {path.secondaryLabel}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Section 3 — Common first steps */}
        <div className="border-t border-white/10 pt-10">
          <h3 className="text-center text-gray-400 text-sm font-medium uppercase tracking-wider mb-6">
            Common first steps
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {quickLinks.map((item) => (
              item.href ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 hover:bg-white/10 hover:border-white/20 transition-colors text-sm text-white"
                >
                  <span className="text-gray-400">{item.icon}</span>
                  <span>{item.text}</span>
                </Link>
              ) : (
                <div
                  key={item.label}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 text-sm"
                >
                  <span className="text-gray-400">{item.icon}</span>
                  <code className="text-[#FF9900] font-mono">{item.text}</code>
                </div>
              )
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
