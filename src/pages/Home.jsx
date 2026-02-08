import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import ServiceCard from '../components/ServiceCard';
import CategoryIcon from '../components/CategoryIcon';

const CATEGORIES = [
  'ai', 'finance', 'data', 'developer', 'media', 'security',
  'location', 'communication', 'seo', 'scraping', 'fun',
];

export default function Home() {
  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [heroSearch, setHeroSearch] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const catRef = useReveal();
  const statsRef = useReveal();
  const howRef = useReveal();
  const freeRef = useReveal();
  const paidRef = useReveal();

  useEffect(() => {
    fetch(`${API_URL}/api/stats`).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API_URL}/api/services`).then(r => r.json()).then(data => {
      setServices(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/services?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  const categoryCounts = {};
  services.forEach(s => {
    const cat = s.tags?.[0];
    if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const freeServices = services.filter(s => Number(s.price_usdc) === 0).slice(0, 4);
  const paidServices = services.filter(s => Number(s.price_usdc) > 0)
    .sort((a, b) => Number(b.price_usdc) - Number(a.price_usdc)).slice(0, 4);

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative py-16 sm:py-24 px-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px]
                        bg-[#FF9900]/8 rounded-full blur-[120px] animate-glow-pulse pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 animate-fade-in-up">
            {t.home.heroTitle}{' '}
            <span className="gradient-text">{t.home.heroTitleHighlight}</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mb-8 animate-fade-in-up delay-100">
            {t.home.heroSubtitle}
          </p>

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

          {/* Quick stats */}
          <div className="flex items-center justify-center gap-6 mt-6 animate-fade-in-up delay-300">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{services.length}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{t.home.apis}</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-xl font-bold text-[#FF9900]">
                {services.filter(s => Number(s.price_usdc) === 0).length}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{t.home.freeApis}</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-xl font-bold text-[#FF9900]">11</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{t.home.categoriesCount}</div>
            </div>
          </div>
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
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat}
              to={`/services?cat=${cat}`}
              className="no-underline glass-card rounded-lg p-3 text-center
                         transition-all duration-200 hover:bg-white/[0.04] hover:border-[#FF9900]/20
                         animate-fade-in-up"
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
                <ServiceCard service={s} />
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
                <ServiceCard service={s} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== STATS BAR ===== */}
      {stats && (
        <section ref={statsRef} className="reveal max-w-5xl mx-auto px-4 mb-20">
          <div className="glass-card rounded-xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{stats.totalServices}</div>
              <div className="text-xs text-gray-500 mt-1">{t.home.servicesListed}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FF9900]">{stats.walletBalance}</div>
              <div className="text-xs text-gray-500 mt-1">USDC Balance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">{t.home.network || 'Base'}</div>
              <div className="text-xs text-gray-500 mt-1">Blockchain</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">11</div>
              <div className="text-xs text-gray-500 mt-1">{t.home.categoriesCount}</div>
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className="max-w-3xl mx-auto px-4 mb-20">
        <div className="gradient-cta glow-orange rounded-xl p-10 sm:p-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t.home.ctaTitle}</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">{t.home.ctaDesc}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/register" className="gradient-btn text-white px-6 py-2.5 rounded-lg text-sm font-medium no-underline hover:brightness-110 transition-all">
              {t.home.listYourApi}
            </Link>
            <Link to="/integrate" className="glass text-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium no-underline hover:border-white/20 transition-all">
              {t.home.integrateAgent}
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 bg-[#131921]">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[#FF9900] font-bold text-lg">x402</span>
                <span className="text-white text-sm font-light">Bazaar</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{t.home.footerDesc}</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t.home.footerProduct}</h4>
              <div className="flex flex-col gap-2">
                <Link to="/services" className="text-xs text-gray-500 hover:text-white no-underline transition-colors">{t.nav.services}</Link>
                <Link to="/register" className="text-xs text-gray-500 hover:text-white no-underline transition-colors">{t.nav.register}</Link>
                <Link to="/developers" className="text-xs text-gray-500 hover:text-white no-underline transition-colors">{t.nav.developers}</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t.home.footerResources}</h4>
              <div className="flex flex-col gap-2">
                <Link to="/integrate" className="text-xs text-gray-500 hover:text-white no-underline transition-colors">{t.nav.integrate}</Link>
                <a href="https://github.com/Wintyx57/x402-frontend" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-white no-underline transition-colors">GitHub Frontend</a>
                <a href="https://github.com/Wintyx57/x402-backend" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-white no-underline transition-colors">GitHub Backend</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              Built for the <span className="text-[#FF9900] font-medium">x402 Hackathon</span> &middot; Powered by Base
            </p>
            <p className="text-xs text-gray-600">&copy; 2025 x402 Bazaar</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
