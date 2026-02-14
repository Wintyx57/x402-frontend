import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import useSEO from '../hooks/useSEO';

function StepCard({ step, isOpen, onToggle }) {
  return (
    <div className="glass-card rounded-xl overflow-hidden transition-all">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left bg-transparent border-none cursor-pointer group"
        aria-expanded={isOpen}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${step.color}15`, border: `1px solid ${step.color}30` }}>
          <span style={{ color: step.color }}>{step.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold" style={{ color: step.color }}>{step.label}</span>
          </div>
          <h3 className="text-white font-semibold text-sm">{step.title}</h3>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-5 pb-5 pt-0">
          <div className="ml-14">
            <p className="text-gray-400 text-xs leading-relaxed mb-3">{step.desc}</p>
            {step.details && (
              <ul className="space-y-2">
                {step.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                    <svg className="w-3.5 h-3.5 text-[#34D399] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            )}
            {step.link && (
              <Link
                to={step.link.to}
                className="inline-flex items-center gap-1 text-xs text-[#FF9900] no-underline hover:text-[#FEBD69] transition-colors font-medium mt-3"
              >
                {step.link.label} &rarr;
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatorOnboarding() {
  const { t } = useTranslation();
  const co = t.creatorOnboarding || {};
  useSEO({
    title: co.title || 'Creator Onboarding Guide',
    description: 'Step-by-step guide to listing your API on x402 Bazaar. From creation to first revenue.',
  });

  const ref1 = useReveal();
  const ref2 = useReveal();

  const [openStep, setOpenStep] = useState(0);

  const steps = [
    {
      label: co.step1Label || 'Step 1',
      title: co.step1Title || 'Create Your API',
      desc: co.step1Desc || 'Build an API endpoint that returns data over HTTP. Any language, any framework. Here are the requirements:',
      color: '#FF9900',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      details: [
        co.step1d1 || 'Must respond to HTTP GET or POST requests',
        co.step1d2 || 'Must return JSON data',
        co.step1d3 || 'Should have latency under 5 seconds',
        co.step1d4 || 'Must be publicly accessible (no authentication required)',
        co.step1d5 || 'HTTPS strongly recommended for production',
      ],
    },
    {
      label: co.step2Label || 'Step 2',
      title: co.step2Title || 'Register on x402 Bazaar',
      desc: co.step2Desc || 'Use the registration form to list your API. You will need:',
      color: '#34D399',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      details: [
        co.step2d1 || 'API name and description',
        co.step2d2 || 'Endpoint URL (must be publicly accessible)',
        co.step2d3 || 'Price per call in USDC (e.g., $0.01)',
        co.step2d4 || 'Category and tags for discoverability',
        co.step2d5 || 'A wallet with at least 1 USDC for the listing fee',
        co.step2d6 || 'Connected wallet (MetaMask, Coinbase, etc.)',
      ],
      link: { to: '/register', label: co.step2Link || 'Go to Registration' },
    },
    {
      label: co.step3Label || 'Step 3',
      title: co.step3Title || 'Get Discovered by AI Agents',
      desc: co.step3Desc || 'Once listed, your API is automatically distributed to 6 platforms:',
      color: '#60A5FA',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      details: [
        co.step3d1 || 'MCP Server (Claude, Cursor, Windsurf)',
        co.step3d2 || 'ChatGPT Custom GPT Actions',
        co.step3d3 || 'CLI (npm x402-bazaar)',
        co.step3d4 || 'LangChain Python integration',
        co.step3d5 || 'Telegram Bot (@x402_monitoradmin_bot)',
        co.step3d6 || 'Auto-GPT Plugin',
      ],
    },
    {
      label: co.step4Label || 'Step 4',
      title: co.step4Title || 'Get Paid',
      desc: co.step4Desc || 'The x402 payment flow works as follows:',
      color: '#A78BFA',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      details: [
        co.step4d1 || 'Agent calls your API endpoint',
        co.step4d2 || 'x402 responds HTTP 402 with price in USDC',
        co.step4d3 || 'Agent pays USDC on Base (or SKALE for zero gas)',
        co.step4d4 || 'Agent resends request with tx hash in header',
        co.step4d5 || 'x402 verifies payment on-chain',
        co.step4d6 || '95% of the payment goes directly to your wallet',
        co.step4d7 || 'All transactions visible on BaseScan',
      ],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="animate-fade-in-up mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Link to="/creators" className="text-gray-500 hover:text-white text-xs no-underline transition-colors">
            {co.backToPortal || 'Creator Portal'}
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-xs text-gray-400">{co.breadcrumb || 'Onboarding Guide'}</span>
        </div>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#60A5FA]/10 text-[#60A5FA] border border-[#60A5FA]/20 mb-4 inline-block">
          {co.badge || 'Step-by-Step Guide'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{co.title || 'Creator Onboarding Guide'}</h1>
        <p className="text-gray-400 text-sm max-w-xl">
          {co.subtitle || 'Everything you need to know to list your API and start earning from AI agent traffic.'}
        </p>
      </div>

      {/* Steps */}
      <div ref={ref1} className="reveal space-y-3 mb-10">
        {steps.map((step, i) => (
          <StepCard
            key={i}
            step={step}
            isOpen={openStep === i}
            onToggle={() => setOpenStep(openStep === i ? -1 : i)}
          />
        ))}
      </div>

      {/* Tips */}
      <div ref={ref2} className="reveal mb-10">
        <h2 className="text-lg font-bold text-white mb-4">{co.tipsTitle || 'Best Practices'}</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            {
              title: co.tip1Title || 'Choose clear naming',
              desc: co.tip1Desc || 'Use descriptive names like "Weather Forecast" rather than "API v2". Agents search by name.',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              ),
            },
            {
              title: co.tip2Title || 'Set competitive pricing',
              desc: co.tip2Desc || 'Most APIs charge $0.005-$0.05 per call. Start lower to attract early users.',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ),
            },
            {
              title: co.tip3Title || 'Use relevant tags',
              desc: co.tip3Desc || 'Add category + specific tags (e.g., "ai, sentiment-analysis"). This improves discoverability.',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              ),
            },
            {
              title: co.tip4Title || 'Keep latency low',
              desc: co.tip4Desc || 'Agents time out after 10-15 seconds. Optimize your API for fast responses.',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
            },
          ].map((tip, i) => (
            <div key={i} className="glass-card rounded-xl p-4 flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF9900]/10 flex items-center justify-center shrink-0 text-[#FF9900]">
                {tip.icon}
              </div>
              <div>
                <h4 className="text-white text-xs font-semibold mb-1">{tip.title}</h4>
                <p className="text-gray-400 text-xs leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="gradient-cta rounded-2xl p-8 text-center">
        <h2 className="text-lg font-bold text-white mb-2">{co.ctaTitle || 'Ready to get started?'}</h2>
        <p className="text-gray-400 text-xs mb-5 max-w-md mx-auto">
          {co.ctaDesc || 'Register your API in 2 minutes and start earning from AI agent traffic worldwide.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="gradient-btn px-6 py-2.5 rounded-xl text-white text-sm font-medium no-underline hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {co.ctaRegister || 'Register Your API'}
          </Link>
          <Link
            to="/creators/dashboard"
            className="px-6 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all no-underline"
          >
            {co.ctaDashboard || 'View Dashboard'}
          </Link>
        </div>
      </div>
    </div>
  );
}
