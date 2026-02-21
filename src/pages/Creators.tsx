import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import useSEO from '../hooks/useSEO';
import { API_URL } from '../config';

export default function Creators() {
  const { t } = useTranslation();
  const c = t.creators || {};
  useSEO({
    title: c.title || 'Creator Portal',
    description: 'Become an API provider on x402 Bazaar. Earn 95% revenue, reach AI agents worldwide, and get paid in USDC instantly.',
  });

  const ref1 = useReveal();
  const ref2 = useReveal();
  const ref3 = useReveal();
  const ref4 = useReveal();

  const [serviceCount, setServiceCount] = useState(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(`${API_URL}/`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          setServiceCount(data.total_services || data.services || 61);
        }
      } catch { /* ignore */ }
    };
    fetchCount();
  }, []);

  const valuePropIcons = [
    // 95% Revenue
    <svg key="rev" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>,
    // 2-min onboarding
    <svg key="fast" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>,
    // Blockchain audit
    <svg key="chain" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>,
    // Global reach
    <svg key="globe" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>,
    // 6 integrations
    <svg key="plug" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>,
    // Zero infrastructure
    <svg key="infra" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>,
  ];

  const valueProps = [
    {
      icon: valuePropIcons[0],
      title: c.vp1Title || '95% Revenue Share',
      desc: c.vp1Desc || 'Keep 95% of every payment. Only 5% platform fee — far less than RapidAPI\'s 25%.',
      color: '#34D399',
    },
    {
      icon: valuePropIcons[1],
      title: c.vp2Title || '2-Minute Onboarding',
      desc: c.vp2Desc || 'Register your API in under 2 minutes. No paperwork, no approval process, no setup fees.',
      color: '#FF9900',
    },
    {
      icon: valuePropIcons[2],
      title: c.vp3Title || 'Blockchain Audit Trail',
      desc: c.vp3Desc || 'Every payment is verifiable on-chain. Complete transparency, zero disputes.',
      color: '#60A5FA',
    },
    {
      icon: valuePropIcons[3],
      title: c.vp4Title || 'Global AI Reach',
      desc: c.vp4Desc || 'Your API is discoverable by thousands of AI agents on Claude, ChatGPT, LangChain, and more.',
      color: '#A78BFA',
    },
    {
      icon: valuePropIcons[4],
      title: c.vp5Title || '6 Platform Integrations',
      desc: c.vp5Desc || 'Auto-distributed to MCP, ChatGPT, CLI, LangChain, Telegram, and Auto-GPT.',
      color: '#FBBF24',
    },
    {
      icon: valuePropIcons[5],
      title: c.vp6Title || 'Zero Infrastructure',
      desc: c.vp6Desc || 'We handle monitoring, documentation, payment processing. You just keep your API running.',
      color: '#F87171',
    },
  ];

  const stats = [
    { value: serviceCount !== null ? serviceCount : '61+', label: c.statApis || 'Live APIs', color: '#FF9900' },
    { value: '95%', label: c.statRevenue || 'Creator Revenue', color: '#34D399' },
    { value: '6', label: c.statIntegrations || 'Integrations', color: '#60A5FA' },
    { value: '$0.001', label: c.statGas || 'Gas Cost', color: '#A78BFA' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="animate-fade-in-up text-center mb-14">
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20 mb-4 inline-block">
          {c.badge || 'Creator Portal'}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
          {c.title || 'Monetize Your API,'}{' '}
          <span className="gradient-text">{c.titleHighlight || 'Reach AI Agents'}</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mb-8">
          {c.subtitle || 'Join the first autonomous API marketplace. List your API, set your price in USDC, and earn 95% revenue from AI agent traffic worldwide.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="gradient-btn px-6 py-3 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity no-underline inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {c.ctaRegister || 'Become a Provider'}
          </Link>
          <Link
            to="/creators/dashboard"
            className="px-6 py-3 rounded-xl text-sm font-medium border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all no-underline"
          >
            {c.ctaDashboard || 'View Dashboard'}
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div ref={ref1} className="reveal grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {stats.map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-5 text-center">
            <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Value Props Grid */}
      <div ref={ref2} className="reveal mb-14">
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-8">
          {c.whyTitle || 'Why List on x402 Bazaar?'}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {valueProps.map((vp, i) => (
            <div key={i} className="glass-card rounded-xl p-6 group hover:border-white/20 transition-all">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${vp.color}15`, color: vp.color }}
              >
                {vp.icon}
              </div>
              <h3 className="text-white font-semibold text-sm mb-2">{vp.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{vp.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works - simplified */}
      <div ref={ref3} className="reveal mb-14">
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-8">
          {c.howTitle || 'How It Works'}
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              num: '1',
              title: c.howStep1Title || 'Register Your API',
              desc: c.howStep1Desc || 'Fill in your API details, set your price, and pay a one-time 1 USDC listing fee on-chain.',
              icon: (
                <svg className="w-5 h-5 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ),
            },
            {
              num: '2',
              title: c.howStep2Title || 'Get Discovered',
              desc: c.howStep2Desc || 'Your API appears on the marketplace and is auto-distributed to 6 platforms (MCP, ChatGPT, CLI...).',
              icon: (
                <svg className="w-5 h-5 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              ),
            },
            {
              num: '3',
              title: c.howStep3Title || 'Get Paid in USDC',
              desc: c.howStep3Desc || 'AI agents call your API and pay USDC directly to your wallet. 95% goes to you, instantly on-chain.',
              icon: (
                <svg className="w-5 h-5 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
          ].map((step, i) => (
            <div key={i} className="glass-card rounded-xl p-6 text-center relative">
              <div className="w-10 h-10 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/20 flex items-center justify-center mx-auto mb-4">
                {step.icon}
              </div>
              <div className="text-xs text-[#FF9900] font-bold mb-2">{c.stepLabel || 'Step'} {step.num}</div>
              <h3 className="text-white font-semibold text-sm mb-2">{step.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue comparison */}
      <div className="glass-card rounded-xl p-6 mb-14">
        <h3 className="text-sm font-semibold text-white mb-4 text-center">{c.compareTitle || 'Revenue Comparison'}</h3>
        <div className="space-y-3">
          {[
            { name: 'x402 Bazaar', pct: 95, color: '#34D399' },
            { name: 'RapidAPI', pct: 75, color: '#6B7280' },
            { name: 'AWS Marketplace', pct: 70, color: '#6B7280' },
          ].map((p, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-300 font-medium">{p.name}</span>
                <span className="text-xs font-bold" style={{ color: p.color }}>{p.pct}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${p.pct}%`, backgroundColor: p.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div ref={ref4} className="reveal text-center">
        <div className="gradient-cta rounded-2xl p-8 sm:p-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
            {c.ctaBottomTitle || 'Ready to monetize your API?'}
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            {c.ctaBottomDesc || 'Join the first marketplace built for AI agents. Register in 2 minutes, start earning today.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="gradient-btn px-8 py-3 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity no-underline"
            >
              {c.ctaRegister || 'Become a Provider'}
            </Link>
            <Link
              to="/creators/onboarding"
              className="px-8 py-3 rounded-xl text-sm font-medium border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all no-underline"
            >
              {c.ctaOnboarding || 'Read the Guide'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
