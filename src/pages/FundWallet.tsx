import { TrailsProvider } from '0xtrails';
import { useTranslation } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import { useReveal } from '../hooks/useReveal';
import BridgeCard from '../components/BridgeCard';

const TRAILS_API_KEY = import.meta.env.VITE_TRAILS_API_KEY || '';

export default function FundWallet() {
  const { t } = useTranslation();
  const f = t.fund || {} as Record<string, string>;

  useSEO({
    title: f.pageTitle || 'Fund Your Wallet — Bridge USDC Cross-Chain',
    description: f.pageDescription || 'Bridge USDC from any chain to Base, SKALE, or Polygon in 1 click.',
    keywords: 'bridge USDC, cross-chain, fund wallet, x402, SKALE, Base, Polygon',
  });

  const heroRef = useReveal();
  const widgetRef = useReveal();
  const howRef = useReveal();

  const steps = [
    { icon: '1', title: f.step1Title || 'Choose Any Token', desc: f.step1Desc || 'Use any token from any chain. Trails finds the best route to USDC automatically.' },
    { icon: '2', title: f.step2Title || 'One-Click Bridge', desc: f.step2Desc || 'Routes and bridges to your chosen destination — one transaction.' },
    { icon: '3', title: f.step3Title || 'USDC on Destination', desc: f.step3Desc || 'USDC arrives on your chain. Ready for API payments.' },
  ];

  const faqs = [
    { q: f.faqQ1 || 'How long does the bridge take?', a: f.faqA1 || 'Depends on destination: Base ~1-2 min, SKALE 5-15 min (IMA bridge), Polygon ~2-5 min.' },
    { q: f.faqQ2 || 'What tokens can I use?', a: f.faqA2 || 'Any token on Ethereum, Polygon, Optimism, Arbitrum, or Base. Trails finds the best route automatically.' },
    { q: f.faqQ3 || 'Is there a minimum amount?', a: f.faqA3 || 'No minimum. Very small amounts may not be cost-effective due to gas fees.' },
    { q: f.faqQ4 || 'What if the bridge fails?', a: f.faqA4 || 'Trails provides automatic refunds if the transaction fails on the source chain.' },
  ];

  return (
    <TrailsProvider config={{ trailsApiKey: TRAILS_API_KEY }}>
    <main className="min-h-screen animate-page-enter">
      {/* Hero */}
      <section ref={heroRef} className="reveal-section text-center py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-[#FF9900] mb-4">
            Powered by Trails + Multi-Chain
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {f.heroTitle || 'Fund Your Wallet'}
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto">
            {f.heroSubtitle || 'Bridge USDC to Base, SKALE, or Polygon in 1 click. Pay for APIs with ultra-low gas.'}
          </p>
        </div>
      </section>

      {/* Bridge Card */}
      <section ref={widgetRef} className="reveal-section px-4 pb-16">
        <BridgeCard />
      </section>

      {/* How it works */}
      <section ref={howRef} className="reveal-section px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">{f.howTitle || 'How It Works'}</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="glass-card rounded-xl p-6 text-center space-y-3">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#FF9900]/20 text-[#FF9900] flex items-center justify-center font-bold text-lg">
                  {s.icon}
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">{f.faqTitle || 'Frequently Asked Questions'}</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="glass-card rounded-xl p-4 group">
                <summary className="font-medium cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-sm text-gray-400">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
    </TrailsProvider>
  );
}
