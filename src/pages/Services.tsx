import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_URL } from '../config';
import { useTranslation } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import { useServices } from '../hooks/useServices';
import { useAllReviewStats } from '../hooks/useReviews';
import CategoryIcon from '../components/CategoryIcon';
import { CATEGORIES, CATEGORY_LABELS } from '../data/categories';
import type { Service } from '../types/service';

// ---- Floating Background ----
function FloatingBackground() {
  return (
    <>
      {/* Orbs */}
      <div
        aria-hidden="true"
        className="fixed pointer-events-none z-0"
        style={{
          width: 800, height: 800, borderRadius: '50%', filter: 'blur(100px)',
          background: 'radial-gradient(circle, rgba(255,153,0,0.18) 0%, rgba(255,153,0,0.05) 40%, transparent 70%)',
          top: '-20%', left: '-10%', animation: 'orb-float-1 25s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden="true"
        className="fixed pointer-events-none z-0"
        style={{
          width: 700, height: 700, borderRadius: '50%', filter: 'blur(100px)',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0.03) 40%, transparent 70%)',
          top: '30%', right: '-15%', animation: 'orb-float-2 30s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden="true"
        className="fixed pointer-events-none z-0"
        style={{
          width: 600, height: 600, borderRadius: '50%', filter: 'blur(100px)',
          background: 'radial-gradient(circle, rgba(52,211,153,0.10) 0%, rgba(52,211,153,0.03) 40%, transparent 70%)',
          bottom: '-5%', left: '10%', animation: 'orb-float-3 22s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden="true"
        className="fixed pointer-events-none z-0"
        style={{
          width: 500, height: 500, borderRadius: '50%', filter: 'blur(100px)',
          background: 'radial-gradient(circle, rgba(255,153,0,0.12) 0%, rgba(255,153,0,0.03) 40%, transparent 70%)',
          top: '55%', left: '45%', animation: 'orb-float-4 28s ease-in-out infinite',
        }}
      />
      {/* Particles */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 12 }, (_, i) => {
          const lefts = [10, 25, 40, 55, 70, 85, 15, 60, 35, 80, 48, 5];
          const durations = [18, 22, 20, 24, 19, 21, 26, 17, 23, 25, 20, 27];
          const delays = [0, 3, 7, 2, 5, 8, 4, 6, 1, 9, 11, 3];
          const isOdd = i % 2 === 1;
          const isTriple = i % 3 === 0;
          const isFifth = i % 5 === 0;
          const size = isFifth ? 4 : isOdd ? 2 : 3;
          const color = isTriple
            ? 'rgba(139,92,246,0.4)'
            : isOdd ? 'rgba(255,153,0,0.35)' : 'rgba(255,153,0,0.5)';
          const shadow = isTriple
            ? '0 0 6px rgba(139,92,246,0.25)'
            : `0 0 ${isFifth ? 8 : 6}px rgba(255,153,0,${isFifth ? 0.3 : 0.2})`;
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size, height: size,
                background: color,
                boxShadow: shadow,
                left: `${lefts[i]}%`,
                animation: `particle-rise ${durations[i]}s linear infinite`,
                animationDelay: `${delays[i]}s`,
              }}
            />
          );
        })}
      </div>
    </>
  );
}

// ---- Category color map ----
const CAT_COLORS: Record<string, string> = {
  ai: '#a78bfa', finance: '#34d399', data: '#60a5fa', developer: '#94a3b8',
  media: '#f472b6', security: '#22d3ee', location: '#fbbf24',
  communication: '#818cf8', seo: '#2dd4bf', scraping: '#fb923c', fun: '#fb7185',
};

function getCatColor(cat: string | undefined): string {
  return (cat && CAT_COLORS[cat]) || '#FF9900';
}

// ---- Featured Card ----
function FeaturedCard({ service, index }: { service: Service; index: number }) {
  const gradients = [
    'linear-gradient(90deg, #a78bfa, #7c3aed)',
    'linear-gradient(90deg, #34d399, #059669)',
    'linear-gradient(90deg, #60a5fa, #2563eb)',
  ];
  const catColors = ['#a78bfa', '#34d399', '#60a5fa'];
  const primaryTag = service.tags?.find(t => !['x402-native', 'live'].includes(t)) || service.tags?.[0];

  return (
    <Link
      to={`/services/${service.id}`}
      className="glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden no-underline
                 transition-all duration-300 hover:-translate-y-1 hover:border-[#FF9900]/25
                 hover:shadow-[0_0_24px_rgba(255,153,0,0.06),0_16px_48px_rgba(0,0,0,0.35)] group"
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-80"
        style={{ background: gradients[index % 3] }}
        aria-hidden="true"
      />
      <div
        className="text-[10px] uppercase tracking-wider font-semibold mb-2.5"
        style={{ color: catColors[index % 3] }}
      >
        {primaryTag || 'API'}
      </div>
      <h3 className="text-[15px] font-semibold text-white mb-1.5 tracking-tight">{service.name}</h3>
      <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{service.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[#FF9900] font-mono">${service.price_usdc}</span>
        <svg
          className="w-[18px] h-[18px] text-gray-600 group-hover:text-[#FF9900] group-hover:translate-x-0.5 transition-all duration-200"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

// ---- API Row ----
function ApiRow({ service, catColor }: { service: Service; catColor: string }) {
  const primaryTag = service.tags?.find(t => !['x402-native', 'live'].includes(t)) || service.tags?.[0];
  const isFree = Number(service.price_usdc) === 0;
  const isOnline = service.status === 'online';

  return (
    <Link
      to={`/services/${service.id}`}
      className="grid items-center gap-3.5 py-2.5 px-3.5 rounded-lg
                 transition-all duration-150 no-underline text-inherit group
                 hover:bg-white/[0.03]"
      style={{ gridTemplateColumns: '34px 1fr auto 68px' }}
    >
      <div
        className="w-[34px] h-[34px] rounded-lg flex items-center justify-center border border-white/5"
        style={{ background: `${catColor}08` }}
      >
        <CategoryIcon category={(primaryTag || 'all') as any} className="w-[15px] h-[15px]" />
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-gray-300 truncate group-hover:text-white transition-colors duration-150">
          {service.name}
        </div>
        <div className="text-[11px] text-gray-600 truncate mt-0.5">{service.description}</div>
      </div>
      <div className="flex items-center">
        {isOnline && (
          <div
            className="w-[5px] h-[5px] rounded-full bg-[#34D399]"
            style={{ boxShadow: '0 0 6px rgba(52,211,153,0.3)' }}
          />
        )}
      </div>
      <div className="flex items-center gap-2 justify-end">
        <span className={`text-[13px] font-semibold font-mono tracking-tight ${isFree ? 'text-[#34D399]' : 'text-[#FF9900]'}`}>
          {isFree ? 'Free' : `$${service.price_usdc}`}
        </span>
        <svg
          className="w-3.5 h-3.5 text-gray-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

// ---- Main Component ----
export default function Services() {
  const { data: servicesData, isLoading: loading, error: servicesError } = useServices();
  const services: Service[] = Array.isArray(servicesData) ? servicesData : [];

  const serviceIds = useMemo(() => services.map(s => s.id), [services]);
  const reviewStatsMap = useAllReviewStats(serviceIds);
  void reviewStatsMap; // reviews used in ServiceDetail, kept for cache warming

  const [uptimeMap, setUptimeMap] = useState<Record<string, number>>({});
  void uptimeMap; // uptime data kept for future use

  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  const search = searchParams.get('q') || '';
  const quickFilter = searchParams.get('filter') || 'all';
  const category = searchParams.get('cat') || 'all';

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const serviceCount = services.length || '70+';
  useSEO({
    title: `API Catalog — ${serviceCount} Services for AI Agents`,
    description: `Browse ${serviceCount} APIs for AI agents across 11 categories. Pay per call with USDC on Base or SKALE via x402 protocol. No API keys required.`,
    keywords: 'AI agent API catalog, pay-per-call API, USDC micropayments, x402 services, HTTP 402 marketplace',
  });

  // JSON-LD
  useEffect(() => {
    if (!services.length) return;
    const schema = {
      '@context': 'https://schema.org', '@type': 'ItemList',
      name: 'x402 Bazaar API Catalog',
      description: `${services.length} APIs for AI agents.`,
      url: 'https://x402bazaar.org/services',
      numberOfItems: services.length,
      itemListElement: services.slice(0, 20).map((svc, idx) => ({
        '@type': 'ListItem', position: idx + 1, name: svc.name,
        url: `https://x402bazaar.org/services/${svc.id}`,
      })),
    };
    let script = document.getElementById('services-itemlist-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'services-itemlist-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
    return () => { document.getElementById('services-itemlist-jsonld')?.remove(); };
  }, [services]);

  // Uptime
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/api/status/uptime?period=7d`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        if (data?.endpoints) {
          const map: Record<string, number> = {};
          for (const ep of data.endpoints) {
            if (ep.uptime !== null) map[`${API_URL}${ep.endpoint}`] = ep.uptime;
          }
          setUptimeMap(map);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // Category helpers
  const { getCategory, categoryCounts } = useMemo(() => {
    const categoryTags = CATEGORIES.filter(c => c.tag).map(c => c.tag);
    const getCategory = (s: Service) => s.tags?.find(t => categoryTags.includes(t)) || null;
    const counts: Record<string, number> = { all: services.length };
    services.forEach(s => {
      const cat = getCategory(s);
      if (cat) counts[cat] = (counts[cat] || 0) + 1;
    });
    return { getCategory, categoryCounts: counts };
  }, [services]);

  // Quick filter + search + category filter
  const filtered = useMemo(() => {
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return services.filter(s => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const match = s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.tags?.some(tag => tag.toLowerCase().includes(q));
        if (!match) return false;
      }
      // Quick filter
      if (quickFilter === 'free' && Number(s.price_usdc) !== 0) return false;
      if (quickFilter === 'cheap' && Number(s.price_usdc) >= 0.01) return false;
      if (quickFilter === 'new' && (!s.created_at || now - new Date(s.created_at).getTime() > sevenDays)) return false;
      // Category
      if (category !== 'all') {
        const cat = CATEGORIES.find(c => c.key === category);
        if (cat?.tag && !s.tags?.includes(cat.tag)) return false;
      }
      return true;
    });
  }, [services, search, quickFilter, category]);

  // Sort by name
  const sorted = useMemo(() => [...filtered].sort((a, b) => a.name.localeCompare(b.name)), [filtered]);

  // Featured: top 3 by trust_score
  const featured = useMemo(() => {
    if (services.length === 0) return [];
    return [...services]
      .filter(s => Number(s.price_usdc) > 0)
      .sort((a, b) => (b.trust_score ?? 0) - (a.trust_score ?? 0))
      .slice(0, 3);
  }, [services]);

  // Active categories (non-zero count)
  const activeCategories = useMemo(
    () => CATEGORIES.filter(c => c.tag && (categoryCounts[c.tag] || 0) > 0),
    [categoryCounts],
  );

  const hasFilters = search || quickFilter !== 'all' || category !== 'all';

  return (
    <div className="relative">
      <FloatingBackground />

      <div className="relative z-10 max-w-[1120px] mx-auto px-4 sm:px-6 py-10 sm:py-12">

        {/* ===== HERO SEARCH ===== */}
        <div className="text-center mb-12 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1.5 tracking-tight leading-tight">
            Explore <span className="gradient-text">{services.length > 0 ? services.length : '100+'} APIs</span>
          </h1>
          <p className="text-gray-500 text-sm mb-7">
            Pay per call with USDC. No keys, no subscriptions.
          </p>

          {/* Search bar */}
          <div className="max-w-[540px] mx-auto relative mb-3.5">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setParam('q', e.target.value)}
              placeholder={t.services.searchPlaceholder || 'Search by name, category, or use case...'}
              aria-label={t.services.searchPlaceholder}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl
                         pl-11 pr-14 py-3.5 text-sm text-white font-normal
                         placeholder-gray-600 outline-none transition-all duration-200
                         focus:border-[#FF9900] focus:shadow-[0_0_0_3px_rgba(255,153,0,0.08)]
                         focus:bg-white/[0.05]"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-white/5 border border-white/8 rounded px-1.5 py-0.5 text-[10px] text-gray-600">
              Ctrl K
            </span>
          </div>

          {/* Quick filters */}
          <div className="flex justify-center gap-1.5">
            {[
              { key: 'all', label: t.services.all || 'All' },
              { key: 'free', label: t.services.freeOnly || 'Free' },
              { key: 'cheap', label: 'Under $0.01' },
              { key: 'new', label: 'New this week' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setParam('filter', f.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer border ${
                  quickFilter === f.key
                    ? 'text-[#FF9900] bg-[#FF9900]/[0.06] border-[#FF9900]/15'
                    : 'text-gray-600 bg-transparent border-transparent hover:text-gray-400 hover:bg-white/[0.03]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== ERROR ===== */}
        {servicesError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center text-sm text-red-400 mb-6">
            Failed to load services. Please try again later.
          </div>
        )}

        {/* ===== LOADING ===== */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card rounded-xl p-5 h-16 animate-shimmer" />
            ))}
          </div>
        )}

        {/* ===== CONTENT ===== */}
        {!loading && services.length > 0 && (
          <>
            {/* Featured (only when no active filters) */}
            {!hasFilters && featured.length >= 3 && (
              <div className="mb-12 sm:mb-14 animate-fade-in">
                <div className="text-[10px] uppercase tracking-[1.5px] text-[#FF9900] font-semibold mb-3.5">
                  Popular
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {featured.map((s, i) => (
                    <FeaturedCard key={s.id} service={s} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Category tiles (only when no active filters) */}
            {!hasFilters && (
              <div className="mb-12 sm:mb-14 animate-fade-in">
                <div className="text-[10px] uppercase tracking-[1.5px] text-[#FF9900] font-semibold mb-3.5">
                  Categories
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                  {activeCategories.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setParam('cat', cat.key)}
                      className="glass-card rounded-xl p-3.5 text-left cursor-pointer
                                 transition-all duration-200 hover:-translate-y-0.5
                                 hover:border-[#FF9900]/25
                                 hover:shadow-[0_0_16px_rgba(255,153,0,0.05),0_8px_24px_rgba(0,0,0,0.3)]
                                 flex flex-col gap-2"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${getCatColor(cat.tag ?? undefined)}12` }}
                      >
                        <CategoryIcon category={cat.key as any} className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-semibold text-white">
                        {(t.services as Record<string, any>)[CATEGORY_LABELS[cat.key]]}
                      </div>
                      <div className="text-[11px] text-gray-600">
                        {categoryCounts[cat.tag!] || 0} APIs
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active filter indicator */}
            {hasFilters && (
              <div className="flex items-center justify-between mb-6 animate-fade-in">
                <p className="text-xs text-gray-400">
                  <span className="text-white font-semibold tabular-nums">{sorted.length}</span>
                  {' '}{t.services.results || 'results'}
                  {search && <span className="text-gray-600"> for &ldquo;{search}&rdquo;</span>}
                  {category !== 'all' && (
                    <span className="text-gray-600">
                      {' '}in {(t.services as Record<string, any>)[CATEGORY_LABELS[category]]}
                    </span>
                  )}
                </p>
                <button
                  onClick={() => setSearchParams({})}
                  className="text-xs text-[#FF9900] hover:text-[#FFB340] cursor-pointer bg-transparent border-none
                             flex items-center gap-1 transition-colors duration-150"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {t.services.clearFilters || 'Clear filters'}
                </button>
              </div>
            )}

            {/* Empty state */}
            {sorted.length === 0 && hasFilters && (
              <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
                <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="text-center max-w-xs">
                  <p className="text-white font-semibold text-sm mb-1">No results</p>
                  <p className="text-gray-500 text-xs">Try different keywords or clear your filters.</p>
                </div>
                <button
                  onClick={() => setSearchParams({})}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-[#FF9900]/10 text-[#FF9900]
                             border border-[#FF9900]/25 hover:bg-[#FF9900]/20 transition-all cursor-pointer"
                >
                  {t.services.clearFilters || 'Clear filters'}
                </button>
              </div>
            )}

            {/* Category sections (default view) */}
            {!hasFilters && (
              <div className="space-y-10">
                {CATEGORIES.filter(c => c.tag).map(cat => {
                  const catServices = sorted.filter(s => getCategory(s) === cat.tag);
                  if (catServices.length === 0) return null;
                  const color = getCatColor(cat.tag ?? undefined);
                  return (
                    <section key={cat.key} className="animate-fade-in">
                      <div className="flex items-center justify-between mb-2 pb-2.5 border-b border-white/5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-[7px] h-[7px] rounded-full" style={{ background: color }} />
                          <h2 className="text-[15px] font-semibold text-white tracking-tight">
                            {(t.services as Record<string, any>)[CATEGORY_LABELS[cat.key]]}
                          </h2>
                          <span className="text-[11px] text-gray-600 bg-white/[0.04] px-1.5 py-0.5 rounded-md">
                            {catServices.length}
                          </span>
                        </div>
                        <button
                          onClick={() => setParam('cat', cat.key)}
                          className="text-[11px] text-gray-500 hover:text-[#FF9900] cursor-pointer bg-transparent border-none transition-colors font-medium"
                        >
                          See all
                        </button>
                      </div>
                      <div className="flex flex-col gap-px">
                        {catServices.map(s => (
                          <ApiRow key={s.id} service={s} catColor={color} />
                        ))}
                      </div>
                    </section>
                  );
                })}

                {/* Uncategorized */}
                {(() => {
                  const uncategorized = sorted.filter(s => !getCategory(s));
                  if (uncategorized.length === 0) return null;
                  return (
                    <section className="animate-fade-in">
                      <div className="flex items-center justify-between mb-2 pb-2.5 border-b border-white/5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-[7px] h-[7px] rounded-full bg-gray-500" />
                          <h2 className="text-[15px] font-semibold text-white tracking-tight">
                            {t.services.otherApis || 'Other'}
                          </h2>
                          <span className="text-[11px] text-gray-600 bg-white/[0.04] px-1.5 py-0.5 rounded-md">
                            {uncategorized.length}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-px">
                        {uncategorized.map(s => (
                          <ApiRow key={s.id} service={s} catColor="#9ca3af" />
                        ))}
                      </div>
                    </section>
                  );
                })()}
              </div>
            )}

            {/* Filtered flat view */}
            {hasFilters && sorted.length > 0 && (
              <div className="flex flex-col gap-px animate-fade-in">
                {sorted.map(s => {
                  const cat = getCategory(s);
                  return <ApiRow key={s.id} service={s} catColor={getCatColor(cat ?? undefined)} />;
                })}
              </div>
            )}
          </>
        )}

        {/* Screen reader announcement */}
        <div aria-live="polite" className="sr-only">
          {sorted.length} {sorted.length === 1 ? 'service' : 'services'}
        </div>
      </div>
    </div>
  );
}
