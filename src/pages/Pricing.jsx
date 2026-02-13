import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import useSEO from '../hooks/useSEO';
import { CHAIN_CONFIG } from '../config';
import GitHubIcon from '../components/icons/GitHubIcon';

export default function Pricing() {
  const { t } = useTranslation();
  useSEO({
    title: 'Pricing',
    description: 'x402 Bazaar pricing — pay per API call with USDC stablecoins. No subscriptions, no minimums. From $0.001 to $0.05 per call.'
  });
  const [selectedTier, setSelectedTier] = useState(3);
  const [callCount, setCallCount] = useState(100);
  const [useSkale, setUseSkale] = useState(false);
  const howRef = useReveal();
  const pricingRef = useReveal();
  const marketplaceRef = useReveal();
  const networkRef = useReveal();
  const calculatorRef = useReveal();
  const providerRef = useReveal();
  const faqRef = useReveal();

  // All 61 native API endpoints grouped by price tier
  const pricingTiers = [
    {
      name: 'tierPremium',
      price: '$0.05',
      color: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-500/20',
      bgColor: 'bg-purple-500/5',
      endpoints: [
        'Image Generation (DALL-E 3)',
      ]
    },
    {
      name: 'tierStandardPlus',
      price: '$0.02',
      color: 'from-orange-500 to-red-500',
      borderColor: 'border-orange-500/20',
      bgColor: 'bg-orange-500/5',
      endpoints: [
        'Weather',
        'Crypto Prices',
      ]
    },
    {
      name: 'tierStandard',
      price: '$0.01',
      color: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-500/20',
      bgColor: 'bg-blue-500/5',
      endpoints: [
        'Random Joke',
        'Text Summarization',
      ]
    },
    {
      name: 'tierBase',
      price: '$0.005',
      color: 'from-green-500 to-emerald-500',
      borderColor: 'border-green-500/20',
      bgColor: 'bg-green-500/5',
      endpoints: [
        'Web Search',
        'Web Scraper',
        'Twitter/X',
        'Wikipedia',
        'Dictionary',
        'Countries',
        'GitHub',
        'NPM Registry',
        'IP Geolocation',
        'QR Code',
        'World Time',
        'Public Holidays',
        'Geocoding',
        'Air Quality',
        'Random Quote',
        'Random Facts',
        'Dog Images',
        'Translation',
        'Code Execution',
        'Readability',
        'Sentiment Analysis',
        'Currency Converter',
        'News Feed',
        'Stock Price',
        'Reddit Data',
        'YouTube Info',
        'WHOIS Lookup',
      ]
    },
    {
      name: 'tierUtility',
      price: '$0.003',
      color: 'from-teal-500 to-cyan-500',
      borderColor: 'border-teal-500/20',
      bgColor: 'bg-teal-500/5',
      endpoints: [
        'DNS Lookup',
        'QR Code Generator',
        'Email Validation',
        'HTTP Headers',
        'Hacker News',
        'SSL Certificate Check',
        'URL Shortener',
      ]
    },
    {
      name: 'tierMicro',
      price: '$0.001',
      color: 'from-gray-500 to-slate-500',
      borderColor: 'border-gray-500/20',
      bgColor: 'bg-gray-500/5',
      endpoints: [
        'Hash Generator',
        'UUID Generator',
        'Base64',
        'Password Generator',
        'Timestamp Converter',
        'Lorem Ipsum',
        'Markdown to HTML',
        'Color Converter',
        'JSON Validator',
        'User Agent Parser',
        'Regex Tester',
        'Text Diff',
        'Math Expression',
        'Unit Converter',
        'CSV to JSON',
        'JWT Decoder',
        'Cron Parser',
        'Password Strength',
        'Phone Validator',
        'URL Parser',
        'HTML to Text',
        'HTTP Status Codes',
      ]
    },
  ];

  const marketplaceFees = [
    { name: 'marketplaceFeesList', price: '$0.05' },
    { name: 'marketplaceFeesSearch', price: '$0.05' },
    { name: 'marketplaceFeesRegister', price: '$1.00' },
  ];

  const faqs = [
    { q: t.pricing.faqQ1, a: t.pricing.faqA1 },
    { q: t.pricing.faqQ2, a: t.pricing.faqA2 },
    { q: t.pricing.faqQ3, a: t.pricing.faqA3 },
    { q: t.pricing.faqQ4, a: t.pricing.faqA4 },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Hero */}
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 animate-fade-in-up">
        {t.pricing.title}
      </h1>
      <p className="text-gray-400 text-lg mb-8 animate-fade-in-up delay-100">
        {t.pricing.subtitle}
      </p>

      {/* How Pricing Works */}
      <section ref={howRef} className="reveal mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{t.pricing.howItWorksTitle}</h2>
        <div className="glass rounded-xl p-6 space-y-4 text-gray-300 text-sm leading-relaxed">
          <p>{t.pricing.howItWorksPara1}</p>
          <p>{t.pricing.howItWorksPara2}</p>
          <div className="glass-card rounded-lg p-4 border border-[#FF9900]/10">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-white font-semibold text-sm">{t.pricing.keyBenefit}</h3>
            </div>
            <p className="text-gray-400 text-xs">{t.pricing.keyBenefitDesc}</p>
          </div>
        </div>
      </section>

      {/* Pricing Table - All 41 Endpoints */}
      <section ref={pricingRef} className="reveal mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{t.pricing.nativeEndpointsTitle}</h2>
        <div className="glass rounded-xl overflow-hidden">
          <div className="space-y-0">
            {pricingTiers.map((tier, idx) => (
              <div key={idx} className={`border-b border-white/5 last:border-b-0`}>
                {/* Tier Header */}
                <div className={`flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-r ${tier.color} bg-opacity-10`}>
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-bold text-sm sm:text-base">{t.pricing[tier.name]}</h3>
                    <span className="text-gray-400 text-xs">
                      {tier.endpoints.length} {tier.endpoints.length === 1 ? 'endpoint' : 'endpoints'}
                    </span>
                  </div>
                  <div className="text-[#FF9900] font-bold text-base sm:text-lg">{tier.price}</div>
                </div>

                {/* Endpoints - Compact layout for large tiers */}
                {tier.endpoints.length > 10 ? (
                  // Compact pill layout for Base (22) and Micro (10) tiers
                  <div className={`px-4 sm:px-6 py-4 ${tier.bgColor}`}>
                    <div className="flex flex-wrap gap-2">
                      {tier.endpoints.map((endpoint, i) => (
                        <span
                          key={i}
                          className="glass px-3 py-1.5 rounded-full text-gray-300 text-xs font-medium hover:border-[#FF9900]/30 transition-colors"
                        >
                          {endpoint}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Row layout for smaller tiers
                  <div className={tier.bgColor}>
                    {tier.endpoints.map((endpoint, i) => (
                      <div
                        key={i}
                        className={`flex items-center px-4 sm:px-6 py-3 ${i !== tier.endpoints.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/5 transition-colors`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">{endpoint}</span>
                          <span className="glass px-2 py-0.5 rounded text-[#FF9900] text-xs">x402</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="px-4 sm:px-6 py-4 bg-white/5 border-t border-white/10">
            <p className="text-gray-500 text-xs">
              {t.pricing.tableNote} {t.pricing.allEndpointsNote}
            </p>
          </div>
        </div>
      </section>

      {/* Marketplace Fees */}
      <section ref={marketplaceRef} className="reveal mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{t.pricing.marketplaceFeesTitle}</h2>
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-white/10 bg-white/5">
                  <th className="px-4 sm:px-6 py-3 text-gray-400 font-semibold text-xs">{t.pricing.thService}</th>
                  <th className="px-4 sm:px-6 py-3 text-gray-400 font-semibold text-xs text-right">{t.pricing.thPrice}</th>
                </tr>
              </thead>
              <tbody>
                {marketplaceFees.map((fee, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <span className="text-white font-medium">{t.pricing[fee.name]}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <span className="text-[#FF9900] font-semibold">{fee.price}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Network Fees */}
      <section ref={networkRef} className="reveal mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{t.pricing.networkFeesTitle}</h2>
        <div className="space-y-4">
          {/* Base */}
          <div className="glass-card rounded-lg p-4 sm:p-5 border border-blue-500/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-base shrink-0">
                  B
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base">Base</h3>
                  <p className="text-gray-500 text-xs">{t.pricing.baseChainId}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-blue-400 font-bold text-lg">{CHAIN_CONFIG[8453].gas}</div>
                <p className="text-gray-500 text-xs">{t.pricing.perTx}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{t.pricing.baseDesc}</p>
          </div>

          {/* SKALE */}
          <div className="glass-card rounded-lg p-4 sm:p-5 border border-green-500/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 font-bold text-base shrink-0">
                  S
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base">SKALE Europa</h3>
                  <p className="text-gray-500 text-xs">{t.pricing.skaleChainId}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-green-400 font-bold text-lg">{CHAIN_CONFIG[2046399126].gas}</div>
                <p className="text-green-400 text-xs">{t.pricing.zeroGas}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{t.pricing.skaleDesc}</p>
          </div>
        </div>
      </section>

      {/* Cost Calculator */}
      <section ref={calculatorRef} className="reveal mb-10">
        <h2 className="text-2xl font-bold text-white mb-2">{t.pricing.calculatorTitle}</h2>
        <p className="text-gray-400 text-sm mb-5">{t.pricing.calculatorDesc}</p>
        <div className="glass rounded-xl p-6 space-y-5">
          {/* Tier Select */}
          <div>
            <label className="text-xs text-gray-400 font-medium mb-2 block">{t.pricing.calcTierLabel}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {pricingTiers.map((tier, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTier(idx)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                    selectedTier === idx
                      ? 'border-[#FF9900] bg-[#FF9900]/10 text-[#FF9900]'
                      : 'border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {t.pricing[tier.name]} ({tier.price})
                </button>
              ))}
            </div>
          </div>

          {/* Call Count */}
          <div>
            <label className="text-xs text-gray-400 font-medium mb-2 block">{t.pricing.calcCallsLabel}</label>
            <div className="flex gap-2 mb-3">
              {[10, 100, 1000, 10000].map(n => (
                <button
                  key={n}
                  onClick={() => setCallCount(n)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    callCount === n
                      ? 'border-[#FF9900] bg-[#FF9900]/10 text-[#FF9900]'
                      : 'border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {n.toLocaleString()}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              max="1000000"
              value={callCount}
              onChange={e => setCallCount(Math.max(1, Math.min(1000000, parseInt(e.target.value) || 1)))}
              className="w-full glass px-4 py-2 rounded-lg text-white text-sm bg-transparent border border-white/10 focus:border-[#FF9900]/50 focus:outline-none"
            />
          </div>

          {/* Network Toggle */}
          <div>
            <label className="text-xs text-gray-400 font-medium mb-2 block">{t.pricing.calcNetworkLabel}</label>
            <div className="flex gap-2">
              <button
                onClick={() => setUseSkale(false)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  !useSkale
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                Base (~$0.001/tx)
              </button>
              <button
                onClick={() => setUseSkale(true)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  useSkale
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                SKALE ($0/tx)
              </button>
            </div>
          </div>

          {/* Results */}
          {(() => {
            const tierPrice = parseFloat(pricingTiers[selectedTier].price.replace('$', ''));
            const apiCost = tierPrice * callCount;
            const gasCost = useSkale ? 0 : 0.001 * callCount;
            const total = apiCost + gasCost;
            const tierName = t.pricing[pricingTiers[selectedTier].name];
            const exampleEndpoint = pricingTiers[selectedTier].endpoints[0];

            return (
              <div className="glass-card rounded-lg p-5 border border-[#FF9900]/10">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">{t.pricing.calcApiCost}</p>
                    <p className="text-lg font-bold text-white">${apiCost.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">{t.pricing.calcGasCost}</p>
                    <p className={`text-lg font-bold ${useSkale ? 'text-green-400' : 'text-blue-400'}`}>
                      ${gasCost.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">{t.pricing.calcTotal}</p>
                    <p className="text-lg font-bold text-[#FF9900]">${total.toFixed(2)}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  {callCount.toLocaleString()} {t.pricing.calcCalls} {exampleEndpoint} @ {pricingTiers[selectedTier].price} = ${apiCost.toFixed(2)} API
                  {!useSkale && ` + $${gasCost.toFixed(2)} gas`} = ${total.toFixed(2)}
                </p>
                {!useSkale && (
                  <div className="mt-3 text-center">
                    <button
                      onClick={() => setUseSkale(true)}
                      className="text-xs text-green-400 font-medium hover:underline"
                    >
                      {t.pricing.calcSkaleSave}
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </section>

      {/* For API Providers */}
      <section ref={providerRef} className="reveal mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{t.pricing.providerTitle}</h2>
        <div className="glass rounded-xl p-6 space-y-4 text-gray-300 text-sm leading-relaxed">
          <p>{t.pricing.providerDesc}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="glass-card rounded-lg p-4 border border-[#FF9900]/10">
              <h3 className="text-white font-semibold text-sm mb-2">{t.pricing.providerFeature1Title}</h3>
              <p className="text-gray-400 text-xs">{t.pricing.providerFeature1Desc}</p>
            </div>
            <div className="glass-card rounded-lg p-4 border border-[#FF9900]/10">
              <h3 className="text-white font-semibold text-sm mb-2">{t.pricing.providerFeature2Title}</h3>
              <p className="text-gray-400 text-xs">{t.pricing.providerFeature2Desc}</p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Link to="/register" className="gradient-btn text-white px-6 py-2.5 rounded-lg text-sm font-medium no-underline hover:brightness-110 transition-all">
              {t.pricing.providerCTA}
            </Link>
            <a
              href="https://github.com/Wintyx57/x402-fast-monetization-template"
              target="_blank"
              rel="noopener noreferrer"
              className="glass text-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium no-underline hover:border-white/20 transition-all inline-flex items-center gap-2"
            >
              <GitHubIcon />
              {t.pricing.providerTemplate}
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section ref={faqRef} className="reveal mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{t.pricing.faqTitle}</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card rounded-lg p-5">
              <h3 className="text-white font-semibold text-sm mb-2">{faq.q}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="glass-card rounded-xl p-8 text-center border border-[#FF9900]/10">
        <h2 className="text-xl font-bold text-white mb-3">{t.pricing.ctaTitle}</h2>
        <p className="text-gray-400 text-sm mb-6">{t.pricing.ctaDesc}</p>
        <Link
          to="/services"
          className="gradient-btn text-white px-8 py-3 rounded-lg text-base font-semibold no-underline hover:brightness-110 hover:scale-[1.02] transition-all inline-block"
        >
          {t.pricing.ctaButton}
        </Link>
      </div>
    </div>
  );
}
