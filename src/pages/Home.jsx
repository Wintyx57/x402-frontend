import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import useSEO from '../hooks/useSEO';
import ServiceCard from '../components/ServiceCard';
import CategoryIcon from '../components/CategoryIcon';
import GitHubIcon from '../components/icons/GitHubIcon';
import { VALID_CATEGORIES } from '../data/categories';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [activityMap, setActivityMap] = useState({});
  const [heroSearch, setHeroSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const valueProRef = useReveal();
  const socialProofRef = useReveal();
  const catRef = useReveal();
  const statsRef = useReveal();
  const howRef = useReveal();
  const freeRef = useReveal();
  const paidRef = useReveal();

  useSEO({
    title: 'API Marketplace for AI Agents',
    description: 'The first API marketplace where AI agents pay per call with USDC. 70+ services, instant payments via x402 protocol on Base.'
  });

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    fetch(`${API_URL}/api/stats`, { signal }).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API_URL}/api/services`, { signal }).then(r => r.json()).then(data => {
      setServices(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => { if (!signal.aborted) setLoading(false); });
    fetch(`${API_URL}/api/services/activity`, { signal }).then(r => r.json()).then(data => setActivityMap(data || {})).catch(() => {});
    return () => controller.abort();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/services?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  // Build category counts from service tags (only standard categories with icons)
  const categoryCounts = {};
  services.forEach(s => {
    (s.tags || []).forEach(tag => {
      if (VALID_CATEGORIES.includes(tag)) {
        categoryCounts[tag] = (categoryCounts[tag] || 0) + 1;
      }
    });
  });

  // Show only categories that have at least 1 service, sorted by count
  const categories = services.length > 0
    ? VALID_CATEGORIES.filter(cat => categoryCounts[cat] > 0)
        .sort((a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0))
    : VALID_CATEGORIES;

  const freeServices = services.filter(s => Number(s.price_usdc) === 0).slice(0, 4);
  const paidServices = services.filter(s => Number(s.price_usdc) > 0)
    .sort((a, b) => Number(b.price_usdc) - Number(a.price_usdc)).slice(0, 4);
  const nativeCount = services.filter(s => s.url?.startsWith('https://x402-api.onrender.com')).length;

  // Helper to interpolate dynamic values into translation strings
  const interp = (str, vars) => {
    let result = str;
    Object.entries(vars).forEach(([key, val]) => {
      result = result.replace(`{${key}}`, val);
    });
    return result;
  };

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative py-16 sm:py-24 px-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px]
                        bg-[#FF9900]/8 rounded-full blur-[120px] animate-glow-pulse pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 animate-fade-in-up">
            {t.home.heroTitle}{' '}
            <span className="gradient-text">{t.home.heroTitleHighlight}</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mb-6 animate-fade-in-up delay-100">
            {interp(t.home.heroSubtitle, { count: services.length || '...' })}
          </p>

          {/* CLI One-liner */}
          <div className="animate-fade-in-up delay-150 mb-8">
            <div className="inline-flex items-center gap-3 bg-[#0d1117] border border-[#FF9900]/20 rounded-xl px-5 py-3 font-mono text-sm
                            hover:border-[#FF9900]/40 transition-all duration-300 group cursor-pointer"
                 onClick={() => { try { navigator.clipboard.writeText('npx x402-bazaar init'); } catch {} }}
            >
              <span className="text-gray-500">$</span>
              <span className="text-[#FF9900] font-medium">npx x402-bazaar init</span>
              <svg className="w-4 h-4 text-gray-500 group-hover:text-[#FF9900] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            </div>
            <p className="text-gray-500 text-xs mt-2">{t.home.cliHint}</p>
          </div>

          {/* Hero search bar */}
          <form onSubmit={handleHeroSearch} className="animate-fade-in-up delay-200">
            <div className="flex items-center max-w-xl mx-auto bg-white/5 border border-white/10 rounded-xl
                            focus-within:border-[#FF9900]/40 transition-all duration-300">
              <svg className="w-5 h-5 text-gray-500 ml-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={heroSearch}
                onChange={e => setHeroSearch(e.target.value)}
                placeholder={t.home.searchPlaceholder}
                className="flex-1 bg-transparent px-4 py-3.5 text-white text-sm placeholder-gray-500 focus:outline-none"
              />
              <button
                type="submit"
                className="gradient-btn text-white text-sm font-medium px-6 py-2 rounded-lg mr-1.5
                           transition-all duration-200 hover:brightness-110 cursor-pointer"
              >
                {t.home.searchBtn}
              </button>
            </div>
          </form>

          {/* Primary CTA */}
          <div className="flex flex-col items-center gap-3 mt-6 animate-fade-in-up delay-250">
            <Link
              to="/services"
              className="gradient-btn text-white text-base font-semibold px-10 py-3.5 rounded-xl no-underline
                         transition-all duration-200 hover:brightness-110 hover:scale-[1.02] hover:glow-orange"
            >
              {t.home.exploreCTA}
            </Link>
            <div className="flex items-center gap-4 text-xs">
              <Link to="/register" className="text-gray-400 underline hover:text-white transition-colors">
                {t.home.listApiCTA}
              </Link>
              <Link to="/developers" className="text-gray-400 underline hover:text-white transition-colors">
                {t.home.readDocsCTA}
              </Link>
            </div>
          </div>

          {/* Trust logo bar */}
          <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-4 md:gap-6 text-gray-500 text-sm mt-8 mb-2 animate-fade-in-up delay-300">
            <span className="text-gray-600 text-xs uppercase tracking-wider">{t.home.trustBarLabel}</span>
            <span className="font-semibold text-gray-400 hover:text-white transition-colors">Coinbase</span>
            <span className="text-gray-700 hidden sm:inline">|</span>
            <span className="font-semibold text-gray-400 hover:text-white transition-colors">Base</span>
            <span className="text-gray-700 hidden sm:inline">|</span>
            <span className="font-semibold text-gray-400 hover:text-white transition-colors">SKALE</span>
            <span className="text-gray-700 hidden sm:inline">|</span>
            <span className="font-semibold text-gray-400 hover:text-white transition-colors">x402 Protocol</span>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-6 mt-4 animate-fade-in-up delay-300">
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-white">{loading ? <span className="inline-block w-8 h-5 animate-shimmer rounded" /> : services.length}</div>
              <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">{t.home.apis}</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-[#FF9900]">
                {services.filter(s => Number(s.price_usdc) === 0).length}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">{t.home.freeApis}</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-[#FF9900]">{nativeCount}</div>
              <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">{t.home.liveApis}</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-white">200ms</div>
              <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">{t.home.avgTransaction}</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-[#34D399]">$0 Gas</div>
              <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">{t.home.onSkale}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== VALUE PROPOSITION ===== */}
      <section ref={valueProRef} className="reveal max-w-5xl mx-auto px-4 mb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-8">{t.home.valueProTitle}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: t.home.valuePro1Title,
              desc: t.home.valuePro1Desc,
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              ),
            },
            {
              title: t.home.valuePro2Title,
              desc: t.home.valuePro2Desc,
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              title: t.home.valuePro3Title,
              desc: t.home.valuePro3Desc,
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
            },
            {
              title: t.home.valuePro4Title,
              desc: t.home.valuePro4Desc,
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
            },
          ].map((card, i) => (
            <div
              key={card.title}
              className="glass-card rounded-xl p-5 text-center animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3
                              text-[#FF9900] bg-[#FF9900]/5 border border-[#FF9900]/20">
                {card.icon}
              </div>
              <h3 className="text-white font-semibold text-sm mb-2">{card.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SOCIAL PROOF ===== */}
      <section ref={socialProofRef} className="reveal max-w-3xl mx-auto px-4 mb-20">
        <h2 className="text-lg font-bold text-white text-center mb-5">{t.home.socialProofTitle}</h2>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {[t.home.socialProof1, t.home.socialProof2, t.home.socialProof3].map((text, i) => (
            <div
              key={i}
              className="glass-card rounded-full px-5 py-2 text-xs text-gray-400 font-medium
                         animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="text-[#FF9900] mr-1.5">&#10003;</span>
              {text}
            </div>
          ))}
        </div>

        {/* ERC-8004 Verified Agent Badge */}
        <div className="flex justify-center mt-5">
          <a
            href="https://basescan.org/token/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline inline-flex items-center gap-2.5 bg-white/5 border border-violet-500/20
                       rounded-xl px-5 py-3 hover:border-violet-500/40 hover:bg-white/[0.07]
                       transition-all duration-300 group animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/30">
              <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-sm font-semibold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              {t.home.erc8004Badge}
            </span>
            <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </section>

      {/* ===== CATEGORIES GRID ===== */}
      <section ref={catRef} className="reveal max-w-7xl mx-auto px-4 mb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{t.home.browseByCategory}</h2>
          <Link to="/services" className="text-xs text-[#FF9900] no-underline hover:text-[#FEBD69]">
            {t.home.viewAll} &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
          {categories.map((cat, i) => (
            <Link
              key={cat}
              to={`/services?cat=${cat}`}
              className="no-underline glass-card rounded-lg p-3 text-center
                         transition-all duration-200 hover:bg-white/[0.07] hover:border-[#FF9900]/30
                         hover:shadow-[0_0_15px_rgba(255,153,0,0.06)] animate-fade-in-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <CategoryIcon category={cat} className="w-5 h-5 mx-auto mb-1.5" />
              <div className="text-white text-sm font-medium">{t.home.categories[cat]}</div>
              <div className="text-gray-500 text-xs mt-1">{categoryCounts[cat] || 0} APIs</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section ref={howRef} className="reveal max-w-5xl mx-auto px-4 mb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-8">{t.home.howItWorks}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { num: '1', title: t.home.step1Title, desc: t.home.step1Desc },
            { num: '2', title: t.home.step2Title, desc: t.home.step2Desc },
            { num: '3', title: t.home.step3Title, desc: t.home.step3Desc },
          ].map(step => (
            <div key={step.num} className="glass-card rounded-lg p-5 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                              mx-auto mb-3 border-2 border-[#FF9900]/30 text-[#FF9900] bg-[#FF9900]/5">
                {step.num}
              </div>
              <h3 className="text-white font-semibold text-sm mb-2">{step.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FREE APIs ===== */}
      {freeServices.length > 0 && (
        <section ref={freeRef} className="reveal max-w-7xl mx-auto px-4 mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">{t.home.freeApisTitle}</h2>
            <Link to="/services?price=free" className="text-xs text-[#FF9900] no-underline hover:text-[#FEBD69]">
              {t.home.viewAll} &rarr;
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {freeServices.map((s, i) => (
              <div key={s.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 75}ms` }}>
                <ServiceCard service={s} lastActivity={activityMap[s.url]} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== PREMIUM APIs ===== */}
      {paidServices.length > 0 && (
        <section ref={paidRef} className="reveal max-w-7xl mx-auto px-4 mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">{t.home.premiumApisTitle}</h2>
            <Link to="/services?price=paid" className="text-xs text-[#FF9900] no-underline hover:text-[#FEBD69]">
              {t.home.viewAll} &rarr;
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {paidServices.map((s, i) => (
              <div key={s.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 75}ms` }}>
                <ServiceCard service={s} lastActivity={activityMap[s.url]} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== STATS BAR ===== */}
      {stats && (
        <section ref={statsRef} className="reveal max-w-5xl mx-auto px-4 mb-20">
          <div className="glass-card rounded-xl p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold text-white">{stats.totalServices}</div>
              <div className="text-xs text-gray-500 mt-1">{t.home.servicesListed}</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold text-[#FF9900]">{stats.walletBalance}</div>
              <div className="text-xs text-gray-500 mt-1">USDC Balance</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold gradient-text">{t.home.network}</div>
              <div className="text-xs text-gray-500 mt-1">Blockchain</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold text-white">{categories.length}</div>
              <div className="text-xs text-gray-500 mt-1">{t.home.categoriesCount}</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold text-white">200ms</div>
              <div className="text-xs text-gray-500 mt-1">{t.home.avgTransaction}</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold text-[#34D399]">$0 Gas</div>
              <div className="text-xs text-gray-500 mt-1">{t.home.onSkale}</div>
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className="max-w-5xl mx-auto px-4 mb-20">
        <div className="grid md:grid-cols-2 gap-5">
          {/* Existing CTA: List your API */}
          <div className="gradient-cta glow-orange rounded-xl p-8 sm:p-10 text-center flex flex-col justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{t.home.ctaTitle}</h2>
              <p className="text-gray-400 text-sm mb-6">{t.home.ctaDesc}</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/register" className="gradient-btn text-white px-6 py-2.5 rounded-lg text-sm font-medium no-underline hover:brightness-110 transition-all">
                {t.home.listYourApi}
              </Link>
              <Link to="/integrate" className="glass text-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium no-underline hover:border-white/20 transition-all">
                {t.home.integrateAgent}
              </Link>
            </div>
          </div>

          {/* New CTA: Monetize with template */}
          <div className="glass-card glow-orange rounded-xl p-8 sm:p-10 text-center flex flex-col justify-between border border-[#FF9900]/10">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{t.home.providerTitle}</h2>
              <p className="text-gray-400 text-sm mb-6">{t.home.providerDesc}</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="https://github.com/Wintyx57/x402-fast-monetization-template"
                target="_blank"
                rel="noopener noreferrer"
                className="gradient-btn text-white px-6 py-2.5 rounded-lg text-sm font-medium no-underline hover:brightness-110 transition-all inline-flex items-center gap-2"
              >
                <GitHubIcon />
                {t.home.providerBtn}
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
