import { useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import useSEO from '../hooks/useSEO';
import { Link } from 'react-router-dom';
import { Coins, Globe, Wrench, Zap, TrendingUp, Link2 } from 'lucide-react';
import CopyButton from '../components/CopyButton';

const SPEC_EXAMPLE = `{
  "name": "My Weather API",
  "description": "Real-time weather data for any city",
  "url": "https://api.example.com/weather",
  "method": "GET",
  "params": [
    { "name": "city", "type": "string", "required": true }
  ],
  "price_usdc": 0.01,
  "category": "weather",
  "wallet_address": "0xYourWalletAddress"
}`;

export default function ForProviders() {
  const { t } = useTranslation();
  const p = t.forProviders || {};
  useSEO({
    title: p.title || 'Monetize Your API — List on x402 Bazaar',
    description: 'Publish your API on x402 Bazaar and earn USDC from AI agents worldwide. Keep 95% of every payment. No subscription model, no infrastructure overhead. Instant on-chain payouts on Base or SKALE.',
    keywords: 'monetize API, earn USDC from API, list API marketplace, API provider x402, HTTP 402 monetization, AI agent revenue, 95% revenue share API',
  });

  const ref1 = useReveal();
  const ref2 = useReveal();
  const ref3 = useReveal();
  const ref4 = useReveal();

  // Service JSON-LD for API monetization page
  useEffect(() => {
    const serviceSchema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'x402 Bazaar API Listing Service',
      description: 'List your API on x402 Bazaar and earn USDC from AI agents worldwide. Keep 95% of every payment. Instant on-chain payouts on Base or SKALE.',
      url: 'https://x402bazaar.org/for-providers',
      provider: {
        '@type': 'Organization',
        name: 'x402 Bazaar',
        url: 'https://x402bazaar.org',
      },
      serviceType: 'API Marketplace',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free registration. Keep 95% of all revenue.',
      },
      areaServed: 'Worldwide',
      audience: {
        '@type': 'Audience',
        audienceType: 'API developers, SaaS providers, data providers',
      },
    };

    let script = document.getElementById('service-provider-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'service-provider-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(serviceSchema);

    return () => {
      const s = document.getElementById('service-provider-jsonld');
      if (s) s.remove();
    };
  }, []);

  const steps = [
    { num: '1', title: 'Paste Your URL', desc: 'Enter your API endpoint URL. Any publicly reachable HTTP endpoint works — no code changes needed.' },
    { num: '2', title: 'Set Your Price', desc: 'Choose how much to charge per call in USDC. Start from $0.001. Change anytime.' },
    { num: '3', title: 'Earn USDC', desc: 'AI agents discover your API, pay automatically via HTTP 402, and 95% goes to your wallet.' },
  ];

  const benefits = [
    { icon: <Coins className="w-5 h-5" />, title: p.benefit1Title || '95% Revenue Share', desc: p.benefit1Desc || 'Keep 95% of every payment. Only 5% platform fee — far less than RapidAPI\'s 25%.' },
    { icon: <Globe className="w-5 h-5" />, title: p.benefit2Title || 'Global AI Audience', desc: p.benefit2Desc || 'Reach thousands of AI agents using Claude, ChatGPT, LangChain, Auto-GPT and more.' },
    { icon: <Wrench className="w-5 h-5" />, title: p.benefit3Title || 'Zero Infrastructure', desc: p.benefit3Desc || 'We handle hosting, payment processing, monitoring, and documentation. You just keep your API running.' },
    { icon: <Zap className="w-5 h-5" />, title: p.benefit4Title || 'Instant Payments', desc: p.benefit4Desc || 'Get paid in USDC on Base mainnet. No invoicing, no net-30. Payments are instant and on-chain.' },
    { icon: <TrendingUp className="w-5 h-5" />, title: p.benefit5Title || 'Analytics & Monitoring', desc: p.benefit5Desc || 'Real-time monitoring (5-min checks), uptime tracking, and Telegram alerts for your API.' },
    { icon: <Link2 className="w-5 h-5" />, title: p.benefit6Title || '6 Platform Integrations', desc: p.benefit6Desc || 'Your API is accessible from MCP (Claude), ChatGPT Actions, CLI, LangChain, Telegram, and Auto-GPT.' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="animate-fade-in-up text-center mb-12">
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20 mb-4 inline-block">
          {p.badge || 'For Providers'}
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3">
          {p.title || 'Monetize Your API with x402'}
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          {p.subtitle || 'List your API, reach AI agents worldwide, and earn 95% of revenue. No setup fees, no monthly charges.'}
        </p>
      </div>

      {/* Benefits grid */}
      <div ref={ref1} className="reveal grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {benefits.map((b, i) => (
          <div key={i} className="glass-card rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-[#FF9900]/10 flex items-center justify-center text-[#FF9900] mb-2">
              {b.icon}
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">{b.title}</h3>
            <p className="text-gray-400 text-xs leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>

      {/* 5-step process */}
      <div ref={ref2} className="reveal mb-12">
        <h2 className="text-xl font-bold text-white mb-6 text-center">{p.howItWorks || 'How It Works'}</h2>
        <div className="space-y-4">
          {steps.map((s, i) => (
            <div key={i} className="glass-card rounded-xl p-5 flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/20 flex items-center justify-center text-[#FF9900] font-bold text-sm shrink-0">
                {s.num}
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">{s.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Import CTA */}
      <div className="glass-card rounded-xl p-6 mb-12 border border-[#FF9900]/20">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FF9900]/10 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-white font-semibold text-sm mb-1">
              {(((t as unknown) as Record<string, Record<string, string>>).importOpenAPI || {}).importTitle || 'Have an OpenAPI spec?'}
            </h3>
            <p className="text-gray-400 text-xs">
              {(((t as unknown) as Record<string, Record<string, string>>).importOpenAPI || {}).importDesc || 'Import all your endpoints at once. Upload your OpenAPI/Swagger spec and list 100+ APIs in 2 minutes.'}
            </p>
          </div>
          <Link to="/import" className="gradient-btn px-5 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity no-underline whitespace-nowrap">
            {(((t as unknown) as Record<string, Record<string, string>>).importOpenAPI || {}).importCta || 'Import Spec'}
          </Link>
        </div>
      </div>

      {/* Proxy diagram */}
      <div className="glass-card rounded-xl p-6 mb-12">
        <h3 className="text-sm font-semibold text-white mb-4 text-center">Zero Integration Required</h3>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="px-4 py-2 rounded-lg font-medium bg-[#60A5FA]/15 text-[#60A5FA] border border-[#60A5FA]/30">
            AI Agent
          </span>
          <svg className="w-5 h-5 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="px-4 py-2 rounded-lg font-medium bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/30">
            x402 Proxy
          </span>
          <svg className="w-5 h-5 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="px-4 py-2 rounded-lg font-medium bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30">
            Your API
          </span>
        </div>
        <p className="text-xs text-gray-500 text-center mt-3">
          Your API stays untouched. No SDK. No code changes. Just paste your URL.
        </p>
      </div>

      {/* API Spec template */}
      <div ref={ref3} className="reveal mb-12">
        <h2 className="text-xl font-bold text-white mb-4 text-center">{p.specTitle || 'API Specification Template'}</h2>
        <p className="text-gray-400 text-sm text-center mb-6 max-w-lg mx-auto">
          {p.specDesc || 'Send us this JSON with your API details. We handle the rest.'}
        </p>
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
            <span className="text-xs text-gray-400 font-mono">api-spec.json</span>
            <CopyButton text={SPEC_EXAMPLE} />
          </div>
          <pre className="p-4 text-sm text-gray-300 font-mono overflow-x-auto leading-relaxed">
            {SPEC_EXAMPLE}
          </pre>
        </div>
      </div>

      {/* Flow diagram */}
      <div className="glass-card rounded-xl p-6 mb-12">
        <h3 className="text-sm font-semibold text-white mb-4 text-center">{p.flowTitle || 'Payment Flow'}</h3>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          {[
            { label: p.flowAgent || 'AI Agent', color: '#60A5FA' },
            { label: null, arrow: true },
            { label: p.flowPays || 'Pays USDC', color: '#FBBF24' },
            { label: null, arrow: true },
            { label: 'x402 Bazaar', color: '#FF9900' },
            { label: null, arrow: true },
            { label: p.flowCalls || 'Calls Your API', color: '#34D399' },
            { label: null, arrow: true },
            { label: p.flowEarns || '95% to You', color: '#A78BFA' },
          ].map((item, i) =>
            item.arrow ? (
              <svg key={i} className="w-4 h-4 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <span
                key={i}
                className="px-3 py-1.5 rounded-lg font-medium"
                style={{ backgroundColor: `${item.color}15`, color: item.color, border: `1px solid ${item.color}30` }}
              >
                {item.label}
              </span>
            )
          )}
        </div>
      </div>

      {/* CTA */}
      <div ref={ref4} className="reveal text-center">
        <h2 className="text-xl font-bold text-white mb-3">{p.ctaTitle || 'Ready to monetize?'}</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
          {p.ctaDesc || 'Register your API in 2 minutes. Start earning from AI agent traffic today.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/register?mode=quick" className="gradient-btn px-6 py-2.5 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity no-underline">
            {p.ctaRegister || 'Monetize Your API'}
          </Link>
          <a href="https://github.com/Wintyx57/x402-backend" target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 rounded-lg text-sm font-medium border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all no-underline">
            {p.ctaGithub || 'View on GitHub'}
          </a>
        </div>
      </div>
    </div>
  );
}
