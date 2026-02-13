import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import useSEO from '../hooks/useSEO';
import ServiceCard from '../components/ServiceCard';
import CategoryIcon from '../components/CategoryIcon';
import GitHubIcon from '../components/icons/GitHubIcon';
import { VALID_CATEGORIES } from '../data/categories';

// Animated counter component (vanilla JS, no deps)
function CountUp({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = 0;
          const increment = end / (duration / 16);
          let current = start;

          const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, 16);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function Home() {
  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [activityMap, setActivityMap] = useState({});
  const [heroSearch, setHeroSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [avgLatency, setAvgLatency] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const valueProRef = useReveal();
  const compatibleRef = useReveal();
  const useCaseRef = useReveal();
  const catRef = useReveal();
  const howRef = useReveal();
  const freeRef = useReveal();
  const paidRef = useReveal();
  const statsRef = useReveal();

  useSEO({
    title: 'API Marketplace for AI Agents',
    description: 'The first API marketplace where AI agents pay per call with USDC. 70+ services, instant payments via x402 protocol on Base.'
  });

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    fetch(`${API_URL}/api/public-stats`, { signal }).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API_URL}/api/services`, { signal }).then(r => r.json()).then(data => {
      setServices(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => { if (!signal.aborted) setLoading(false); });
    fetch(`${API_URL}/api/services/activity`, { signal }).then(r => r.json()).then(data => setActivityMap(data || {})).catch(() => {});
    fetch(`${API_URL}/api/status`, { signal }).then(r => r.json()).then(data => {
      if (data?.endpoints?.length) {
        const latencies = data.endpoints.filter(e => e.latency > 0).map(e => e.latency);
        if (latencies.length) setAvgLatency(Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length));
      }
    }).catch(() => {});
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

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 animate-fade-in-up delay-250">
            <Link
              to="/services"
              className="gradient-btn text-white text-base font-semibold px-10 py-3.5 rounded-xl no-underline
                         transition-all duration-200 hover:brightness-110 hover:scale-[1.02] animate-pulse-glow"
            >
              {t.home.exploreCTA}
            </Link>
            <Link
              to="/services"
              className="glass-card text-gray-300 text-base font-medium px-8 py-3.5 rounded-xl no-underline
                         transition-all duration-200 hover:border-[#FF9900]/30 hover:text-white"
            >
              {t.home.browseApisCTA} →
            </Link>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs mt-4 animate-fade-in-up delay-300">
            <Link to="/register" className="text-gray-400 underline hover:text-white transition-colors">
              {t.home.listApiCTA}
            </Link>
            <Link to="/analytics" className="text-gray-400 underline hover:text-white transition-colors">
              {t.home.viewAnalyticsCTA || 'View Analytics'}
            </Link>
            <Link to="/developers" className="text-gray-400 underline hover:text-white transition-colors">
              {t.home.readDocsCTA}
            </Link>
          </div>

          {/* Quick stats with CountUp animation */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-6 mt-8 animate-fade-in-up delay-300">
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-white">
                {loading ? <span className="inline-block w-8 h-5 animate-shimmer rounded" /> : <CountUp end={services.length} />}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">{t.home.apis}</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-[#FF9900]">
                <CountUp end={services.filter(s => Number(s.price_usdc) === 0).length} />
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">{t.home.freeApis}</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-[#FF9900]">
                <CountUp end={nativeCount} />
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">{t.home.liveApis}</div>
            </div>
            {avgLatency && (
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-white">
                  <CountUp end={avgLatency} suffix="ms" />
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">{t.home.avgTransaction}</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-[#34D399]">$0 Gas</div>
              <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">{t.home.onSkale}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMPATIBLE WITH ===== */}
      <section ref={compatibleRef} className="reveal max-w-4xl mx-auto px-4 mb-16">
        <div className="text-center mb-6">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-4">{t.home.compatibleWith}</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            {/* Claude */}
            <div className="flex flex-col items-center gap-2 group animate-fade-in-up" style={{ animationDelay: '0ms' }}>
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center
                              group-hover:border-[#FF9900]/30 transition-all duration-300">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-[#FF9900] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
              <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">Claude</span>
            </div>

            {/* Cursor */}
            <div className="flex flex-col items-center gap-2 group animate-fade-in-up" style={{ animationDelay: '50ms' }}>
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center
                              group-hover:border-[#FF9900]/30 transition-all duration-300">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-[#FF9900] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">Cursor</span>
            </div>

            {/* VS Code */}
            <div className="flex flex-col items-center gap-2 group animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center
                              group-hover:border-[#FF9900]/30 transition-all duration-300">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-[#FF9900] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z"/>
                </svg>
              </div>
              <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">VS Code</span>
            </div>

            {/* LangChain */}
            <div className="flex flex-col items-center gap-2 group animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center
                              group-hover:border-[#FF9900]/30 transition-all duration-300">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-[#FF9900] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">LangChain</span>
            </div>

            {/* ChatGPT */}
            <div className="flex flex-col items-center gap-2 group animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center
                              group-hover:border-[#FF9900]/30 transition-all duration-300">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-[#FF9900] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
                </svg>
              </div>
              <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">ChatGPT</span>
            </div>

            {/* Auto-GPT */}
            <div className="flex flex-col items-center gap-2 group animate-fade-in-up" style={{ animationDelay: '250ms' }}>
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center
                              group-hover:border-[#FF9900]/30 transition-all duration-300">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-[#FF9900] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">Auto-GPT</span>
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

      {/* ===== USE CASES / SOCIAL PROOF ===== */}
      <section ref={useCaseRef} className="reveal max-w-4xl mx-auto px-4 mb-20">
        <h2 className="text-lg font-bold text-white text-center mb-6">{t.home.useCaseTitle}</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ),
              stat: t.home.useCase1,
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              stat: t.home.useCase2,
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
              stat: t.home.useCase3,
            },
          ].map((useCase, i) => (
            <div
              key={i}
              className="glass-card rounded-xl p-6 text-center animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3
                              text-[#FF9900] bg-[#FF9900]/5 border border-[#FF9900]/20">
                {useCase.icon}
              </div>
              <p className="text-white font-semibold text-sm">{useCase.stat}</p>
            </div>
          ))}
        </div>

        {/* ERC-8004 Verified Agent Badge */}
        <div className="flex justify-center mt-6">
          <a
            href="https://basescan.org/token/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline inline-flex items-center gap-2.5 bg-white/5 border border-violet-500/20
                       rounded-xl px-5 py-3 hover:border-violet-500/40 hover:bg-white/[0.07]
                       transition-all duration-300 group animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
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

      {/* ===== HOW IT WORKS (Horizontal with arrows) ===== */}
      <section ref={howRef} className="reveal max-w-5xl mx-auto px-4 mb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-10">{t.home.howItWorks}</h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
          {[
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              ),
              label: t.home.howStep1Icon,
              title: t.home.step1Title,
              desc: t.home.step1Desc,
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              label: t.home.howStep2Icon,
              title: t.home.step2Title,
              desc: t.home.step2Desc,
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              ),
              label: t.home.howStep3Icon,
              title: t.home.step3Title,
              desc: t.home.step3Desc,
            },
          ].map((step, i) => (
            <div key={i} className="flex flex-col md:flex-row items-center gap-4 md:gap-6 flex-1">
              <div className="glass-card rounded-xl p-6 w-full max-w-xs text-center animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
                                text-[#FF9900] bg-[#FF9900]/5 border-2 border-[#FF9900]/30">
                  {step.icon}
                </div>
                <div className="text-[#FF9900] text-xs font-semibold uppercase tracking-wider mb-2">{step.label}</div>
                <h3 className="text-white font-semibold text-sm mb-2">{step.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
              </div>
              {/* Arrow between steps (hidden on last step) */}
              {i < 2 && (
                <div className="hidden md:block animate-fade-in-up" style={{ animationDelay: `${i * 100 + 50}ms` }}>
                  <svg className="w-6 h-6 text-[#FF9900]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
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
              <div className="text-xl sm:text-3xl font-bold text-white">
                <CountUp end={stats.services || 0} />
              </div>
              <div className="text-xs text-gray-500 mt-1">{t.home.servicesListed}</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold text-[#FF9900]">
                <CountUp end={stats.nativeEndpoints || 41} />
              </div>
              <div className="text-xs text-gray-500 mt-1">Native APIs</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold gradient-text">{t.home.network}</div>
              <div className="text-xs text-gray-500 mt-1">Blockchain</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold text-white">
                <CountUp end={categories.length} />
              </div>
              <div className="text-xs text-gray-500 mt-1">{t.home.categoriesCount}</div>
            </div>
            {avgLatency && (
              <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-white">
                  <CountUp end={avgLatency} suffix="ms" />
                </div>
                <div className="text-xs text-gray-500 mt-1">{t.home.avgTransaction}</div>
              </div>
            )}
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
