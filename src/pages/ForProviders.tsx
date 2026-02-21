import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import useSEO from '../hooks/useSEO';
import { Link } from 'react-router-dom';
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
    title: p.title || 'For API Providers',
    description: 'List your API on x402 Bazaar. Keep 95% revenue, reach AI agents worldwide. No infrastructure needed.',
  });

  const ref1 = useReveal();
  const ref2 = useReveal();
  const ref3 = useReveal();
  const ref4 = useReveal();

  const steps = [
    { num: '1', title: p.step1Title || 'Submit Your API Spec', desc: p.step1Desc || 'Provide your API endpoint URL, parameters, and desired price in USDC. Use our JSON template below.' },
    { num: '2', title: p.step2Title || 'Verification', desc: p.step2Desc || 'We test your API for latency, error rates, and reliability. You approve the listing before it goes live.' },
    { num: '3', title: p.step3Title || 'Payment Setup', desc: p.step3Desc || 'Provide your wallet address to receive USDC payments. We configure the 95/5 revenue split automatically.' },
    { num: '4', title: p.step4Title || 'Go Live', desc: p.step4Desc || 'Your API appears on x402bazaar.org. AI agents can discover and pay for it immediately.' },
    { num: '5', title: p.step5Title || 'Earn Revenue', desc: p.step5Desc || 'Agents call your API, pay in USDC, and 95% goes directly to your wallet. Track earnings in real-time.' },
  ];

  const benefits = [
    { icon: '&#128176;', title: p.benefit1Title || '95% Revenue Share', desc: p.benefit1Desc || 'Keep 95% of every payment. Only 5% platform fee — far less than RapidAPI\'s 25%.' },
    { icon: '&#127760;', title: p.benefit2Title || 'Global AI Audience', desc: p.benefit2Desc || 'Reach thousands of AI agents using Claude, ChatGPT, LangChain, Auto-GPT and more.' },
    { icon: '&#128736;', title: p.benefit3Title || 'Zero Infrastructure', desc: p.benefit3Desc || 'We handle hosting, payment processing, monitoring, and documentation. You just keep your API running.' },
    { icon: '&#9889;', title: p.benefit4Title || 'Instant Payments', desc: p.benefit4Desc || 'Get paid in USDC on Base mainnet. No invoicing, no net-30. Payments are instant and on-chain.' },
    { icon: '&#128200;', title: p.benefit5Title || 'Analytics & Monitoring', desc: p.benefit5Desc || 'Real-time monitoring (5-min checks), uptime tracking, and Telegram alerts for your API.' },
    { icon: '&#128279;', title: p.benefit6Title || '6 Platform Integrations', desc: p.benefit6Desc || 'Your API is accessible from MCP (Claude), ChatGPT Actions, CLI, LangChain, Telegram, and Auto-GPT.' },
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
            <div className="text-2xl mb-2" dangerouslySetInnerHTML={{ __html: b.icon }} />
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
          <Link to="/register" className="gradient-btn px-6 py-2.5 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity no-underline">
            {p.ctaRegister || 'Register Your API'}
          </Link>
          <a href="https://github.com/Wintyx57/x402-backend" target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 rounded-lg text-sm font-medium border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all no-underline">
            {p.ctaGithub || 'View on GitHub'}
          </a>
        </div>
      </div>
    </div>
  );
}
