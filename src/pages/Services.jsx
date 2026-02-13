import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_URL } from '../config';
import { useTranslation } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import ServiceCard from '../components/ServiceCard';
import CategoryIcon from '../components/CategoryIcon';
import { CATEGORIES, CATEGORY_LABELS } from '../data/categories';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityMap, setActivityMap] = useState({});
  const [healthMap, setHealthMap] = useState({});
  const [uptimeMap, setUptimeMap] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  const search = searchParams.get('q') || '';
  const priceFilter = searchParams.get('price') || 'all';
  const category = searchParams.get('cat') || 'all';
  const sort = searchParams.get('sort') || 'name';
  const maxPrice = parseFloat(searchParams.get('maxPrice') || '1');
  const sourceFilter = searchParams.get('source') || 'all';

  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== 'name') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  useSEO({
    title: 'API Services',
    description: 'Browse 70+ API services available for AI agents. Weather, crypto, search, image generation and more — pay per call with USDC.'
  });

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    fetch(`${API_URL}/api/services`, { signal })
      .then(r => r.json())
      .then(data => {
        setServices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => { if (!signal.aborted) setLoading(false); });

    fetch(`${API_URL}/api/services/activity`, { signal })
      .then(r => r.json())
      .then(data => setActivityMap(data || {}))
      .catch(() => {});

    fetch(`${API_URL}/api/health-check`, { signal })
      .then(r => r.json())
      .then(data => setHealthMap(data || {}))
      .catch(() => {});

    fetch(`${API_URL}/api/status/uptime?period=7d`, { signal })
      .then(r => r.json())
      .then(data => {
        if (data?.endpoints) {
          const map = {};
          for (const ep of data.endpoints) {
            if (ep.uptime !== null) {
              map[`${API_URL}${ep.endpoint}`] = ep.uptime;
            }
          }
          setUptimeMap(map);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // Helper: find the primary category of a service (first tag matching a known category)
  const categoryTags = CATEGORIES.filter(c => c.tag).map(c => c.tag);
  const getCategory = (s) => s.tags?.find(t => categoryTags.includes(t)) || null;

  // Count per category
  const categoryCounts = { all: services.length };
  services.forEach(s => {
    const cat = getCategory(s);
    if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Filter
  const filtered = useMemo(() => services.filter(s => {
    if (search) {
      const q = search.toLowerCase();
      const match = s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.tags?.some(tag => tag.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (priceFilter === 'free' && Number(s.price_usdc) !== 0) return false;
    if (priceFilter === 'paid' && Number(s.price_usdc) === 0) return false;
    if (category !== 'all') {
      const cat = CATEGORIES.find(c => c.key === category);
      if (cat?.tag && !s.tags?.includes(cat.tag)) return false;
    }
    if (maxPrice < 1 && Number(s.price_usdc) > maxPrice) return false;
    if (sourceFilter === 'native' && !s.url?.startsWith('https://x402-api.onrender.com')) return false;
    if (sourceFilter === 'community' && s.url?.startsWith('https://x402-api.onrender.com')) return false;
    return true;
  }), [services, search, priceFilter, category, maxPrice, sourceFilter]);

  // Sort
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    switch (sort) {
      case 'price-asc': return Number(a.price_usdc) - Number(b.price_usdc);
      case 'price-desc': return Number(b.price_usdc) - Number(a.price_usdc);
      case 'newest': return new Date(b.created_at) - new Date(a.created_at);
      default: return a.name.localeCompare(b.name);
    }
  }), [filtered, sort]);

  const freeCount = services.filter(s => Number(s.price_usdc) === 0).length;
  const paidCount = services.filter(s => Number(s.price_usdc) > 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{t.services.title}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {services.length} {t.services.apisAvailable}
            <span className="text-gray-600 mx-2">|</span>
            <span className="text-gray-400">{freeCount} {t.services.freeOnly}</span>
            <span className="text-gray-600 mx-1">&middot;</span>
            <span className="text-[#FF9900]">{paidCount} {t.services.paidOnly}</span>
          </p>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={sort}
            onChange={e => setParam('sort', e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300
                       focus:outline-none focus:border-[#FF9900]/50 cursor-pointer"
          >
            <option value="name">{t.services.sortName}</option>
            <option value="price-asc">{t.services.sortPriceAsc}</option>
            <option value="price-desc">{t.services.sortPriceDesc}</option>
            <option value="newest">{t.services.sortNewest}</option>
          </select>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setParam('q', e.target.value)}
          placeholder={t.services.searchPlaceholder}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white
                     placeholder-gray-500 focus:outline-none focus:border-[#FF9900]/50 focus:bg-white/8
                     transition-all duration-200"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {search && (
          <button
            onClick={() => setParam('q', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors
                       bg-transparent border-none cursor-pointer p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Price filter pills */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {['all', 'free', 'paid'].map(f => (
          <button
            key={f}
            onClick={() => setParam('price', f)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
              priceFilter === f
                ? 'bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/25'
                : 'bg-white/3 text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
            }`}
          >
            {f === 'all' ? t.services.all : f === 'free' ? t.services.freeOnly : t.services.paidOnly}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4 mb-3">
        {/* Max price slider */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">{t.services.maxPrice || 'Max price'}:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.005"
            value={maxPrice}
            onChange={e => setParam('maxPrice', e.target.value === '1' ? 'all' : e.target.value)}
            className="w-32 sm:w-24 h-2 accent-[#FF9900] cursor-pointer"
          />
          <span className="text-xs text-[#FF9900] font-mono min-w-[3rem]">
            {maxPrice >= 1 ? (t.services.all || 'All') : `$${maxPrice}`}
          </span>
        </div>

        {/* Source filter */}
        <div className="flex items-center gap-1.5">
          {['all', 'native', 'community'].map(f => (
            <button
              key={f}
              onClick={() => setParam('source', f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                sourceFilter === f
                  ? 'bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/25'
                  : 'bg-white/3 text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
              }`}
            >
              {f === 'all' ? (t.services.sourceAll || 'All') : f === 'native' ? (t.services.sourceNative || 'x402 Native') : (t.services.sourceCommunity || 'Community')}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex overflow-x-auto items-center gap-1.5 mb-8 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
        {CATEGORIES.map(cat => {
          const count = categoryCounts[cat.key] || 0;
          const isActive = category === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setParam('cat', cat.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 sm:shrink ${
                isActive
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'bg-white/[0.02] text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
              }`}
            >
              <CategoryIcon category={cat.key} className="w-3.5 h-3.5" />
              <span>{t.services[CATEGORY_LABELS[cat.key]]}</span>
              <span className={`text-xs ${isActive ? 'text-gray-400' : 'text-gray-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="border-b border-white/6 mb-6" />

      {/* Results info */}
      {(search || priceFilter !== 'all' || category !== 'all') && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500">
            {sorted.length} {t.services.results}
          </p>
          <button
            onClick={() => setSearchParams({})}
            className="text-xs text-[#FF9900] hover:text-[#FEBD69] cursor-pointer bg-transparent border-none"
          >
            {t.services.clearFilters}
          </button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="glass-card rounded-lg p-4 animate-shimmer h-44" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-gray-500 text-center py-20 glass-card rounded-lg">
          <p className="text-sm">{search ? `${t.services.noMatch} "${search}"` : t.services.noServices}</p>
        </div>
      ) : category === 'all' && !search ? (
        /* Grouped by category view */
        <div className="space-y-10">
          {CATEGORIES.filter(c => c.tag).map(cat => {
            const catServices = sorted.filter(s => getCategory(s) === cat.tag);
            if (catServices.length === 0) return null;
            return (
              <section key={cat.key}>
                <div className="flex items-center gap-2.5 mb-4">
                  <CategoryIcon category={cat.key} className="w-5 h-5" />
                  <h2 className="text-lg font-semibold text-white">
                    {t.services[CATEGORY_LABELS[cat.key]]}
                  </h2>
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                    {catServices.length}
                  </span>
                  <button
                    onClick={() => setParam('cat', cat.key)}
                    className="ml-auto text-xs text-[#FF9900] hover:text-[#FEBD69] cursor-pointer bg-transparent border-none"
                  >
                    {t.services.viewAll || 'View all'} &rarr;
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {catServices.map((s, i) => (
                    <div key={s.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 7) * 50}ms` }}>
                      <ServiceCard service={s} lastActivity={activityMap[s.url]} healthStatus={healthMap[s.url]} uptimePercent={uptimeMap[s.url]} />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
          {/* Uncategorized services */}
          {(() => {
            const uncategorized = sorted.filter(s => !getCategory(s));
            if (uncategorized.length === 0) return null;
            return (
              <section>
                <div className="flex items-center gap-2.5 mb-4">
                  <CategoryIcon category="all" className="w-5 h-5" />
                  <h2 className="text-lg font-semibold text-white">
                    {t.services.otherApis || 'Other'}
                  </h2>
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                    {uncategorized.length}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {uncategorized.map((s, i) => (
                    <div key={s.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 7) * 50}ms` }}>
                      <ServiceCard service={s} lastActivity={activityMap[s.url]} healthStatus={healthMap[s.url]} uptimePercent={uptimeMap[s.url]} />
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}
        </div>
      ) : (
        /* Flat grid when filtering by category or searching */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sorted.map((s, i) => (
            <div key={s.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 11) * 50}ms` }}>
              <ServiceCard service={s} lastActivity={activityMap[s.url]} healthStatus={healthMap[s.url]} uptimePercent={uptimeMap[s.url]} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
