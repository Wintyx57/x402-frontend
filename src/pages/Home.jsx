import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import ServiceCard from '../components/ServiceCard';

const CATEGORIES = [
  { key: 'ai',            emoji: '\u{1F916}', color: 'from-purple-500/20 to-purple-500/5',  ring: 'ring-purple-500/20' },
  { key: 'finance',       emoji: '\u{1F4B0}', color: 'from-yellow-500/20 to-yellow-500/5',  ring: 'ring-yellow-500/20' },
  { key: 'data',          emoji: '\u{1F4CA}', color: 'from-blue-500/20 to-blue-500/5',      ring: 'ring-blue-500/20' },
  { key: 'developer',     emoji: '\u{1F4BB}', color: 'from-emerald-500/20 to-emerald-500/5',ring: 'ring-emerald-500/20' },
  { key: 'media',         emoji: '\u{1F3A8}', color: 'from-pink-500/20 to-pink-500/5',      ring: 'ring-pink-500/20' },
  { key: 'security',      emoji: '\u{1F512}', color: 'from-red-500/20 to-red-500/5',        ring: 'ring-red-500/20' },
  { key: 'location',      emoji: '\u{1F4CD}', color: 'from-sky-500/20 to-sky-500/5',        ring: 'ring-sky-500/20' },
  { key: 'communication', emoji: '\u{1F4AC}', color: 'from-orange-500/20 to-orange-500/5',  ring: 'ring-orange-500/20' },
  { key: 'seo',           emoji: '\u{1F50D}', color: 'from-lime-500/20 to-lime-500/5',      ring: 'ring-lime-500/20' },
  { key: 'scraping',      emoji: '\u{1F578}\u{FE0F}', color: 'from-violet-500/20 to-violet-500/5', ring: 'ring-violet-500/20' },
  { key: 'fun',           emoji: '\u{1F3AE}', color: 'from-amber-500/20 to-amber-500/5',    ring: 'ring-amber-500/20' },
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
                        bg-blue-500/8 rounded-full blur-[120px] animate-glow-pulse pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[200px]
                        bg-purple-500/6 rounded-full blur-[100px] animate-glow-pulse pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 animate-fade-in-up">
            {t.home.heroTitle} <span className="gradient-text">{t.home.heroTitleHighlight}</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mb-8 animate-fade-in-up delay-100">
            {t.home.heroSubtitle}
          </p>

          {/* Hero search bar */}
          <form onSubmit={handleHeroSearch} className="animate-fade-in-up delay-200">
            <div className="flex items-center max-w-xl mx-auto bg-white/5 border border-white/10 rounded-2xl
                            focus-within:border-blue-500/40 focus-within:bg-white/8 transition-all duration-300">
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
                className="gradient-btn text-white text-sm font-medium px-6 py-2 rounded-xl mr-1.5
                           transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                {t.home.searchBtn}
              </button>
            </div>
          </form>

          {/* Quick stats under search */}
          <div className="flex items-center justify-center gap-6 mt-6 animate-fade-in-up delay-300">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{services.length}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">{t.home.apis}</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{freeServices.length > 0 ? services.filter(s => Number(s.price_usdc) === 0).length : 0}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">{t.home.freeApis}</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{stats?.totalPayments || 0}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">{t.home.payments}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES GRID ===== */}
      <section ref={catRef} className="reveal max-w-7xl mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white">{t.home.browseByCategory}</h2>
          <Link to="/services" className="text-xs text-blue-400 no-underline hover:text-blue-300">
            {t.home.viewAll} &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat.key}
              to={`/services?cat=${cat.key}`}
              className={`no-underline bg-gradient-to-br ${cat.color} rounded-xl p-3 text-center
                         ring-1 ${cat.ring} transition-all duration-300 hover:scale-105 hover:ring-2
                         animate-fade-in-up`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="text-2xl mb-1">{cat.emoji}</div>
              <div className="text-white text-xs font-medium">{t.home.categories[cat.key]}</div>
              <div className="text-gray-500 text-[10px] mt-0.5">{categoryCounts[cat.key] || 0} APIs</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section ref={howRef} className="reveal max-w-5xl mx-auto px-4 mb-16">
        <h2 className="text-lg sm:text-xl font-bold text-white text-center mb-8">{t.home.howItWorks}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { num: '1', color: 'text-orange-400 ring-orange-400/30', title: t.home.step1Title, desc: t.home.step1Desc },
            { num: '2', color: 'text-green-400 ring-green-400/30', title: t.home.step2Title, desc: t.home.step2Desc },
            { num: '3', color: 'text-blue-400 ring-blue-400/30', title: t.home.step3Title, desc: t.home.step3Desc },
          ].map(step => (
            <div key={step.num} className="glass-card rounded-xl p-5 text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                              mx-auto mb-3 ring-2 ${step.color} bg-white/5`}>
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
            <div className="flex items-center gap-3">
              <span className="bg-blue-500/15 text-blue-400 text-xs font-bold px-3 py-1 rounded-full ring-1 ring-blue-500/20">
                {t.serviceCard.free}
              </span>
              <h2 className="text-lg font-bold text-white">{t.home.freeApisTitle}</h2>
            </div>
            <Link to="/services?price=free" className="text-xs text-blue-400 no-underline hover:text-blue-300">
              {t.home.viewAll} &rarr;
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {freeServices.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        </section>
      )}

      {/* ===== PREMIUM APIs ===== */}
      {paidServices.length > 0 && (
        <section ref={paidRef} className="reveal max-w-7xl mx-auto px-4 mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="bg-green-500/15 text-green-400 text-xs font-bold px-3 py-1 rounded-full ring-1 ring-green-500/20">
                Premium
              </span>
              <h2 className="text-lg font-bold text-white">{t.home.premiumApisTitle}</h2>
            </div>
            <Link to="/services?price=paid" className="text-xs text-blue-400 no-underline hover:text-blue-300">
              {t.home.viewAll} &rarr;
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {paidServices.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        </section>
      )}

      {/* ===== STATS BAR ===== */}
      {stats && (
        <section ref={statsRef} className="reveal max-w-5xl mx-auto px-4 mb-16">
          <div className="glass-card rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalServices}</div>
              <div className="text-xs text-gray-500 mt-1">{t.home.servicesListed}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.totalPayments}</div>
              <div className="text-xs text-gray-500 mt-1">{t.home.paymentsVerified}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">{stats.totalRevenue} USDC</div>
              <div className="text-xs text-gray-500 mt-1">{t.home.totalVolume}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">11</div>
              <div className="text-xs text-gray-500 mt-1">{t.home.categoriesCount}</div>
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className="max-w-3xl mx-auto px-4 mb-16">
        <div className="glass-card rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-3">{t.home.ctaTitle}</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">{t.home.ctaDesc}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/register" className="gradient-btn text-white px-6 py-2.5 rounded-xl text-sm font-medium no-underline hover:scale-105 transition-all">
              {t.home.listYourApi}
            </Link>
            <Link to="/integrate" className="glass text-gray-300 px-6 py-2.5 rounded-xl text-sm font-medium no-underline hover:border-white/20 transition-all">
              {t.home.integrateAgent}
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-7 h-7 rounded-md gradient-btn flex items-center justify-center text-white font-bold text-xs">x4</div>
                <span className="text-sm font-bold text-white">x402 Bazaar</span>
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
            <p className="text-[10px] text-gray-600">
              Built for the <span className="gradient-text font-medium">x402 Hackathon</span> &middot; Powered by <span className="text-blue-400">Base</span>
            </p>
            <p className="text-[10px] text-gray-600">&copy; 2026 x402 Bazaar</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
