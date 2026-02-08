import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_URL } from '../config';
import { useTranslation } from '../i18n/LanguageContext';
import ServiceCard from '../components/ServiceCard';

const CATEGORIES = [
  { key: 'all', tag: null },
  { key: 'ai', tag: 'ai' },
  { key: 'finance', tag: 'finance' },
  { key: 'data', tag: 'data' },
  { key: 'developer', tag: 'developer' },
  { key: 'media', tag: 'media' },
  { key: 'security', tag: 'security' },
  { key: 'location', tag: 'location' },
  { key: 'communication', tag: 'communication' },
  { key: 'seo', tag: 'seo' },
  { key: 'scraping', tag: 'scraping' },
  { key: 'fun', tag: 'fun' },
];

const CATEGORY_LABELS = {
  all: 'categoryAll', ai: 'categoryAi', finance: 'categoryFinance', data: 'categoryData',
  developer: 'categoryDeveloper', media: 'categoryMedia', security: 'categorySecurity',
  location: 'categoryLocation', communication: 'categoryCommunication', seo: 'categorySeo',
  scraping: 'categoryScraping', fun: 'categoryFun',
};

const CATEGORY_EMOJI = {
  all: '', ai: '\u{1F916}', finance: '\u{1F4B0}', data: '\u{1F4CA}', developer: '\u{1F4BB}',
  media: '\u{1F3A8}', security: '\u{1F512}', location: '\u{1F4CD}', communication: '\u{1F4AC}',
  seo: '\u{1F50D}', scraping: '\u{1F578}\u{FE0F}', fun: '\u{1F3AE}',
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  const search = searchParams.get('q') || '';
  const priceFilter = searchParams.get('price') || 'all';
  const category = searchParams.get('cat') || 'all';
  const sort = searchParams.get('sort') || 'name';

  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== 'name') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  useEffect(() => {
    fetch(`${API_URL}/api/services`)
      .then(r => r.json())
      .then(data => {
        setServices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Count per category
  const categoryCounts = { all: services.length };
  services.forEach(s => {
    const cat = s.tags?.[0];
    if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Filter
  const filtered = services.filter(s => {
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
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'price-asc': return Number(a.price_usdc) - Number(b.price_usdc);
      case 'price-desc': return Number(b.price_usdc) - Number(a.price_usdc);
      case 'newest': return new Date(b.created_at) - new Date(a.created_at);
      default: return a.name.localeCompare(b.name);
    }
  });

  const freeCount = services.filter(s => Number(s.price_usdc) === 0).length;
  const paidCount = services.filter(s => Number(s.price_usdc) > 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t.services.title}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {services.length} {t.services.apisAvailable}
            <span className="text-gray-600 mx-2">|</span>
            <span className="text-blue-400">{freeCount} {t.services.freeOnly}</span>
            <span className="text-gray-600 mx-1">&middot;</span>
            <span className="text-green-400">{paidCount} {t.services.paidOnly}</span>
          </p>
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setParam('q', e.target.value)}
              placeholder={t.services.searchPlaceholder}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white
                         placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all duration-300"
            />
          </div>
          <select
            value={sort}
            onChange={e => setParam('sort', e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300
                       focus:outline-none focus:border-blue-500/50 cursor-pointer"
          >
            <option value="name">{t.services.sortName}</option>
            <option value="price-asc">{t.services.sortPriceAsc}</option>
            <option value="price-desc">{t.services.sortPriceDesc}</option>
            <option value="newest">{t.services.sortNewest}</option>
          </select>
        </div>
      </div>

      {/* Price filter pills */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {['all', 'free', 'paid'].map(f => (
          <button
            key={f}
            onClick={() => setParam('price', f)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
              priceFilter === f
                ? f === 'free'
                  ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30'
                  : f === 'paid'
                    ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30'
                    : 'bg-white/10 text-white ring-1 ring-white/20'
                : 'bg-white/3 text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {f === 'all' ? t.services.all : f === 'free' ? t.services.freeOnly : t.services.paidOnly}
          </button>
        ))}
      </div>

      {/* Category filter with counts */}
      <div className="flex flex-wrap items-center gap-1.5 mb-8">
        {CATEGORIES.map(cat => {
          const count = categoryCounts[cat.key] || 0;
          const isActive = category === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setParam('cat', cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-white/10 text-white ring-1 ring-white/20'
                  : 'bg-white/[0.02] text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {CATEGORY_EMOJI[cat.key] && <span>{CATEGORY_EMOJI[cat.key]}</span>}
              <span>{t.services[CATEGORY_LABELS[cat.key]]}</span>
              <span className={`text-[10px] ${isActive ? 'text-gray-400' : 'text-gray-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results info */}
      {(search || priceFilter !== 'all' || category !== 'all') && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500">
            {sorted.length} {t.services.results}
          </p>
          <button
            onClick={() => setSearchParams({})}
            className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer bg-transparent border-none"
          >
            {t.services.clearFilters}
          </button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4 animate-shimmer h-44" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-gray-500 text-center py-20 glass-card rounded-xl">
          <div className="text-4xl mb-3">{search ? '\u{1F50D}' : '\u{1F4E6}'}</div>
          <p>{search ? `${t.services.noMatch} "${search}"` : t.services.noServices}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {sorted.map(s => <ServiceCard key={s.id} service={s} />)}
        </div>
      )}
    </div>
  );
}
