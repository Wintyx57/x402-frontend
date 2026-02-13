import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import useSEO from '../hooks/useSEO';
import { Link } from 'react-router-dom';

const FEATURES = [
  { key: 'agentSupport', x402: true, rapidapi: false },
  { key: 'payPerCall', x402: true, rapidapi: false },
  { key: 'noSubscription', x402: true, rapidapi: false },
  { key: 'transparentPricing', x402: true, rapidapi: false },
  { key: 'creatorRevenue', x402: '95%', rapidapi: '75%' },
  { key: 'onboarding', x402: '2 min', rapidapi: '30 min' },
  { key: 'paymentMethod', x402: 'USDC (wallet)', rapidapi: 'Credit card' },
  { key: 'auditTrail', x402: true, rapidapi: false },
  { key: 'multiChain', x402: true, rapidapi: false },
  { key: 'mcpSupport', x402: true, rapidapi: false },
  { key: 'listingFee', x402: '1 USDC', rapidapi: 'Free' },
  { key: 'minSpend', x402: '$0.003', rapidapi: '$5/mo' },
];

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-[#34D399]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg className="w-5 h-5 text-red-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function renderValue(val) {
  if (val === true) return <CheckIcon />;
  if (val === false) return <CrossIcon />;
  return <span className="text-sm text-white font-medium">{val}</span>;
}

export default function Compare() {
  const { t } = useTranslation();
  const c = t.compare || {};
  useSEO({
    title: c.title || 'x402 Bazaar vs RapidAPI',
    description: 'Compare x402 Bazaar and RapidAPI — pricing, agent support, revenue share, onboarding time. See why x402 is built for AI agents.',
  });

  const ref1 = useReveal();
  const ref2 = useReveal();
  const ref3 = useReveal();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="animate-fade-in-up text-center mb-12">
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20 mb-4 inline-block">
          {c.badge || 'Comparison'}
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3">
          x402 Bazaar <span className="text-gray-500">vs</span> <span className="text-blue-400">RapidAPI</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">{c.subtitle || 'Built for AI agents, not adapted for them. See the difference.'}</p>
      </div>

      {/* Comparison table */}
      <div ref={ref1} className="reveal glass-card rounded-xl overflow-hidden mb-10">
        <div className="grid grid-cols-3 bg-white/5 px-5 py-3 border-b border-white/5">
          <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">{c.featureCol || 'Feature'}</div>
          <div className="text-center">
            <span className="text-[#FF9900] font-bold text-sm">x402 Bazaar</span>
          </div>
          <div className="text-center">
            <span className="text-blue-400 font-bold text-sm">RapidAPI</span>
          </div>
        </div>
        {FEATURES.map(({ key, x402, rapidapi }, i) => (
          <div
            key={key}
            className={`grid grid-cols-3 px-5 py-3.5 items-center ${i % 2 === 0 ? 'bg-white/[0.02]' : ''} ${i < FEATURES.length - 1 ? 'border-b border-white/5' : ''}`}
          >
            <div className="text-sm text-gray-300">{c[`feature_${key}`] || key}</div>
            <div className="flex justify-center">{renderValue(x402)}</div>
            <div className="flex justify-center">{renderValue(rapidapi)}</div>
          </div>
        ))}
      </div>

      {/* Why x402 wins */}
      <div ref={ref2} className="reveal grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {[
          { icon: '&#128640;', title: c.win1Title || 'Agent-First', desc: c.win1Desc || 'The only marketplace designed for autonomous AI agents. No credit card needed — agents pay with USDC wallets.' },
          { icon: '&#128176;', title: c.win2Title || 'Pay Per Call', desc: c.win2Desc || 'No subscriptions, no minimums. Your agent pays exactly what it uses — $0.003 to $0.05 per call.' },
          { icon: '&#128274;', title: c.win3Title || 'Transparent', desc: c.win3Desc || 'Every payment is on-chain, verifiable, auditable. No hidden fees, no surprise bills.' },
          { icon: '&#9889;', title: c.win4Title || 'Fast Onboarding', desc: c.win4Desc || '2 minutes to start. One CLI command: npx x402-bazaar init. No account creation needed.' },
          { icon: '&#128181;', title: c.win5Title || '95% Revenue', desc: c.win5Desc || 'API creators keep 95% of revenue vs 75% on RapidAPI. Better economics for everyone.' },
          { icon: '&#127760;', title: c.win6Title || 'Multi-Chain', desc: c.win6Desc || 'Base mainnet + SKALE (zero gas). Choose the network that fits your needs.' },
        ].map((item, i) => (
          <div key={i} className="glass-card rounded-xl p-5">
            <div className="text-2xl mb-2" dangerouslySetInnerHTML={{ __html: item.icon }} />
            <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
            <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div ref={ref3} className="reveal text-center">
        <h2 className="text-xl font-bold text-white mb-3">{c.ctaTitle || 'Ready to switch?'}</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">{c.ctaDesc || 'Join the marketplace built for the future of AI agent commerce.'}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/services" className="gradient-btn px-6 py-2.5 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity no-underline">
            {c.ctaExplore || 'Explore APIs'}
          </Link>
          <Link to="/integrate" className="px-6 py-2.5 rounded-lg text-sm font-medium border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all no-underline">
            {c.ctaIntegrate || 'Start Integrating'}
          </Link>
        </div>
      </div>
    </div>
  );
}
