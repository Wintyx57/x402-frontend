import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import useSEO from '../hooks/useSEO';
import { API_URL, CHAIN_CONFIG } from '../config';
import GitHubIcon from '../components/icons/GitHubIcon';

export default function About() {
  const { t } = useTranslation();
  const [serviceCount, setServiceCount] = useState('...');
  const [catCount, setCatCount] = useState('...');

  useSEO({
    title: 'About',
    description: 'Learn about x402 Bazaar — the first API marketplace powered by the x402 payment protocol. Our mission, security and team.'
  });

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/api/services`, { signal: controller.signal }).then(r => r.json()).then(data => {
      const list = Array.isArray(data) ? data : [];
      setServiceCount(list.length);
      const cats = new Set();
      list.forEach(s => (s.tags || []).forEach(tag => { if (tag !== 'x402-native' && tag !== 'live') cats.add(tag); }));
      setCatCount(cats.size);
    }).catch(() => {});
    return () => controller.abort();
  }, []);
  const whatIsRef = useReveal();
  const howItWorksRef = useReveal();
  const protocolRef = useReveal();
  const blockchainRef = useReveal();
  const openSourceRef = useReveal();
  const securityRef = useReveal();
  const identityRef = useReveal();
  const teamRef = useReveal();
  const contactRef = useReveal();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Hero */}
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 animate-fade-in-up">
        {t.about.title}
      </h1>
      <p className="text-gray-500 mb-8 animate-fade-in-up delay-100">
        {t.about.subtitle}
      </p>

      {/* What is x402 Bazaar */}
      <section ref={whatIsRef} className="reveal mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{t.about.whatIsTitle}</h2>
        <div className="glass rounded-xl p-6 space-y-4 text-gray-300 text-sm leading-relaxed">
          <p>{t.about.whatIsPara1}</p>
          <p>{t.about.whatIsPara2}</p>
          <p>{t.about.whatIsPara3}</p>
        </div>
      </section>

      {/* How It Works */}
      <section ref={howItWorksRef} className="reveal mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{t.about.howItWorksTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { num: '1', title: t.about.step1Title, desc: t.about.step1Desc.replace('{count}', serviceCount).replace('{catCount}', catCount), icon: 'search' },
            { num: '2', title: t.about.step2Title, desc: t.about.step2Desc, icon: 'payment' },
            { num: '3', title: t.about.step3Title, desc: t.about.step3Desc, icon: 'check' },
            { num: '4', title: t.about.step4Title, desc: t.about.step4Desc, icon: 'earn' },
          ].map(step => (
            <div key={step.num} className="glass-card rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold
                                border-2 border-[#FF9900]/30 text-[#FF9900] bg-[#FF9900]/5 shrink-0">
                  {step.num}
                </div>
                <h3 className="text-white font-semibold text-sm">{step.title}</h3>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The x402 Protocol */}
      <section ref={protocolRef} className="reveal mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{t.about.protocolTitle}</h2>
        <div className="glass rounded-xl p-6 space-y-4 text-gray-300 text-sm leading-relaxed">
          <p>{t.about.protocolDesc}</p>
          <div className="glass-card rounded-lg p-4 border border-[#FF9900]/10">
            <h3 className="text-white font-semibold text-sm mb-2">{t.about.protocolLearnMore}</h3>
            <a
              href="https://x402.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF9900] text-xs hover:text-[#FEBD69] transition-colors inline-flex items-center gap-1"
            >
              {t.about.protocolVisit}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Built On */}
      <section ref={blockchainRef} className="reveal mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{t.about.builtOnTitle}</h2>
        <div className="space-y-4">
          {/* Base */}
          <div className="glass-card rounded-lg p-6 border border-blue-500/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-lg">
                B
              </div>
              <div>
                <h3 className="text-white font-semibold text-base">Base</h3>
                <p className="text-gray-500 text-xs">{t.about.baseChainId}: {CHAIN_CONFIG[8453].key}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-3">{t.about.baseDesc}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="glass px-3 py-1 rounded-full text-gray-400">{t.about.baseFeature1}</span>
              <span className="glass px-3 py-1 rounded-full text-gray-400">{t.about.baseFeature2}</span>
              <span className="glass px-3 py-1 rounded-full text-gray-400">{t.about.baseFeature3}</span>
            </div>
          </div>

          {/* SKALE */}
          <div className="glass-card rounded-lg p-6 border border-green-500/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 font-bold text-lg">
                S
              </div>
              <div>
                <h3 className="text-white font-semibold text-base">SKALE Europa</h3>
                <p className="text-gray-500 text-xs">{t.about.skaleChainId}: {CHAIN_CONFIG[2046399126].key}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-3">{t.about.skaleDesc}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="glass px-3 py-1 rounded-full text-green-400">{t.about.skaleFeature1}</span>
              <span className="glass px-3 py-1 rounded-full text-gray-400">{t.about.skaleFeature2}</span>
              <span className="glass px-3 py-1 rounded-full text-gray-400">{t.about.skaleFeature3}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source */}
      <section ref={openSourceRef} className="reveal mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{t.about.openSourceTitle}</h2>
        <div className="glass rounded-xl p-6 space-y-4 text-gray-300 text-sm leading-relaxed">
          <p>{t.about.openSourceDesc}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <a
              href="https://github.com/Wintyx57/x402-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-lg p-4 hover:border-white/20 transition-all no-underline group"
            >
              <div className="flex items-center gap-2 mb-2">
                <GitHubIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                <h3 className="text-white font-semibold text-sm">{t.about.frontendRepo}</h3>
              </div>
              <p className="text-gray-500 text-xs">{t.about.frontendRepoDesc}</p>
            </a>
            <a
              href="https://github.com/Wintyx57/x402-backend"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-lg p-4 hover:border-white/20 transition-all no-underline group"
            >
              <div className="flex items-center gap-2 mb-2">
                <GitHubIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                <h3 className="text-white font-semibold text-sm">{t.about.backendRepo}</h3>
              </div>
              <p className="text-gray-500 text-xs">{t.about.backendRepoDesc}</p>
            </a>
          </div>
          <div className="glass-card rounded-lg p-4 border border-[#FF9900]/10">
            <p className="text-gray-400 text-xs mb-2">
              <span className="text-[#FF9900] font-medium">{t.about.licenseLabel}</span> {t.about.licenseDesc}
            </p>
            <p className="text-gray-400 text-xs">
              <span className="text-[#FF9900] font-medium">{t.about.contributionsLabel}</span> {t.about.contributionsDesc}
            </p>
          </div>
        </div>
      </section>

      {/* Security */}
      <section ref={securityRef} className="reveal mb-10">
        <h2 className="text-2xl font-bold text-white mb-2">{t.about.securityTitle}</h2>
        <p className="text-gray-400 text-sm mb-5">{t.about.securityDesc}</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            {
              title: t.about.security1Title,
              desc: t.about.security1Desc,
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
            },
            {
              title: t.about.security2Title,
              desc: t.about.security2Desc,
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
            },
            {
              title: t.about.security3Title,
              desc: t.about.security3Desc,
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                </svg>
              ),
            },
            {
              title: t.about.security4Title,
              desc: t.about.security4Desc,
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              title: t.about.security5Title,
              desc: t.about.security5Desc,
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
            },
            {
              title: t.about.security6Title,
              desc: t.about.security6Desc,
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
          ].map((feat) => (
            <div key={feat.title} className="glass-card rounded-lg p-4 flex gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0
                              text-[#FF9900] bg-[#FF9900]/5 border border-[#FF9900]/20">
                {feat.icon}
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">{feat.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* On-Chain Identity (ERC-8004) */}
      <section ref={identityRef} className="reveal mb-10">
        <h2 className="text-2xl font-bold text-white mb-2">{t.about.onChainIdentityTitle}</h2>
        <p className="text-gray-400 text-sm mb-5">{t.about.onChainIdentityDesc}</p>
        <div className="glass rounded-xl p-6 space-y-4 text-gray-300 text-sm leading-relaxed">
          <p>{t.about.erc8004What}</p>
          <p>{t.about.erc8004Bazaar}</p>

          <div className="grid sm:grid-cols-2 gap-3">
            <a
              href="https://basescan.org/token/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-lg p-4 hover:border-violet-500/30 transition-all no-underline group"
            >
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-white font-semibold text-sm group-hover:text-violet-300 transition-colors">{t.about.erc8004Registry}</h3>
              </div>
              <p className="text-gray-500 text-xs font-mono">0x8004...a432</p>
            </a>
            <a
              href="https://x402-api.onrender.com/.well-known/agent-registration.json"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-lg p-4 hover:border-blue-500/30 transition-all no-underline group"
            >
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-white font-semibold text-sm group-hover:text-blue-300 transition-colors">{t.about.erc8004Registration}</h3>
              </div>
              <p className="text-gray-500 text-xs font-mono">/.well-known/agent-registration.json</p>
            </a>
          </div>
        </div>
      </section>

      {/* The Team */}
      <section ref={teamRef} className="reveal mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{t.about.teamTitle}</h2>
        <div className="glass rounded-xl p-6 space-y-4 text-gray-300 text-sm leading-relaxed">
          <p>{t.about.teamDesc}</p>
          <div className="glass-card rounded-lg p-4 border border-[#FF9900]/10 flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h3 className="text-white font-semibold text-sm">{t.about.teamHackathon}</h3>
              <p className="text-gray-500 text-xs">{t.about.teamHackathonDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section ref={contactRef} className="reveal mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{t.about.contactTitle}</h2>
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <svg className="w-5 h-5 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a href="mailto:x402bazaar@gmail.com" className="text-gray-300 hover:text-white transition-colors">
              x402bazaar@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <svg className="w-5 h-5 text-[#FF9900]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <a href="https://x.com/x402bazaar" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
              @x402bazaar
            </a>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <GitHubIcon className="w-5 h-5 text-[#FF9900]" />
            <a href="https://github.com/Wintyx57" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="glass-card rounded-xl p-8 text-center border border-[#FF9900]/10">
        <h2 className="text-xl font-bold text-white mb-3">{t.about.ctaTitle}</h2>
        <p className="text-gray-400 text-sm mb-6">{t.about.ctaDesc}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/services" className="gradient-btn text-white px-6 py-2.5 rounded-lg text-sm font-medium no-underline hover:brightness-110 transition-all">
            {t.about.ctaBrowse}
          </Link>
          <Link to="/developers" className="glass text-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium no-underline hover:border-white/20 transition-all">
            {t.about.ctaDocs}
          </Link>
        </div>
        <div className="mt-6 pt-6 border-t border-white/5">
          <code className="bg-[#0d1117] px-4 py-2 rounded-lg text-[#FF9900] text-sm font-mono inline-block">
            npx x402-bazaar init
          </code>
        </div>
      </div>
    </div>
  );
}
