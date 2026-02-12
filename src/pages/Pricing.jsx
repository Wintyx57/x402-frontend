import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import { CHAIN_CONFIG } from '../config';
import GitHubIcon from '../components/icons/GitHubIcon';

export default function Pricing() {
  const { t } = useTranslation();
  useEffect(() => { document.title = 'Pricing | x402 Bazaar'; }, []);
  const howRef = useReveal();
  const pricingRef = useReveal();
  const networkRef = useReveal();
  const providerRef = useReveal();
  const faqRef = useReveal();

  const nativeEndpoints = [
    { name: t.pricing.serviceWebSearch, price: '$0.005', desc: t.pricing.serviceWebSearchDesc },
    { name: t.pricing.serviceWebScraper, price: '$0.005', desc: t.pricing.serviceWebScraperDesc },
    { name: t.pricing.serviceTwitter, price: '$0.005', desc: t.pricing.serviceTwitterDesc },
    { name: t.pricing.serviceWeather, price: '$0.02', desc: t.pricing.serviceWeatherDesc },
    { name: t.pricing.serviceCrypto, price: '$0.02', desc: t.pricing.serviceCryptoDesc },
    { name: t.pricing.serviceJoke, price: '$0.01', desc: t.pricing.serviceJokeDesc },
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

      {/* Pricing Table */}
      <section ref={pricingRef} className="reveal mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{t.pricing.nativeEndpointsTitle}</h2>
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-white/10 bg-white/5">
                  <th className="px-4 sm:px-6 py-3 text-gray-400 font-semibold text-xs">{t.pricing.thService}</th>
                  <th className="px-4 sm:px-6 py-3 text-gray-400 font-semibold text-xs text-right">{t.pricing.thPrice}</th>
                  <th className="px-4 sm:px-6 py-3 text-gray-400 font-semibold text-xs hidden sm:table-cell">{t.pricing.thDescription}</th>
                </tr>
              </thead>
              <tbody>
                {nativeEndpoints.map((endpoint, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{endpoint.name}</span>
                        <span className="glass px-2 py-0.5 rounded text-[#FF9900] text-xs">x402</span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1 sm:hidden">{endpoint.desc}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <span className="text-[#FF9900] font-semibold">{endpoint.price}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-gray-400 text-xs hidden sm:table-cell">
                      {endpoint.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 sm:px-6 py-4 bg-white/5 border-t border-white/10">
            <p className="text-gray-500 text-xs">
              {t.pricing.tableNote}
            </p>
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
