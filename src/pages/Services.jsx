import { useEffect, useState } from 'react';
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
  all: 'categoryAll',
  ai: 'categoryAi',
  finance: 'categoryFinance',
  data: 'categoryData',
  developer: 'categoryDeveloper',
  media: 'categoryMedia',
  security: 'categorySecurity',
  location: 'categoryLocation',
  communication: 'categoryCommunication',
  seo: 'categorySeo',
  scraping: 'categoryScraping',
  fun: 'categoryFun',
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [priceFilter, setPriceFilter] = useState('all'); // all | free | paid
  const [category, setCategory] = useState('all');
  const { t } = useTranslation();

  useEffect(() => {
    fetch(`${API_URL}/api/services`)
      .then(r => r.json())
      .then(data => {
        setServices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = services.filter(s => {
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      const matchesSearch =
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.tags?.some(tag => tag.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    // Price filter
    if (priceFilter === 'free' && Number(s.price_usdc) !== 0) return false;
    if (priceFilter === 'paid' && Number(s.price_usdc) === 0) return false;

    // Category filter
    if (category !== 'all') {
      const cat = CATEGORIES.find(c => c.key === category);
      if (cat?.tag && !s.tags?.includes(cat.tag)) return false;
    }

    return true;
  });

  const freeCount = services.filter(s => Number(s.price_usdc) === 0).length;
  const paidCount = services.filter(s => Number(s.price_usdc) > 0).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6
                      animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-white">{t.services.title}</h1>
          <p className="text-gray-500 mt-1">
            {services.length} {t.services.apisAvailable}
            <span className="ml-3 text-blue-400">{freeCount} {t.services.freeOnly}</span>
            <span className="mx-1 text-gray-600">·</span>
            <span className="text-green-400">{paidCount} {t.services.paidOnly}</span>
          </p>
        </div>
        <input
          type="text"
          placeholder={t.services.searchPlaceholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full md:w-72 glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500
                     focus:outline-none focus:glow-blue focus:border-blue-500/50 transition-all duration-300"
        />
      </div>

      {/* Price filter pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4 animate-fade-in-up">
        {['all', 'free', 'paid'].map(f => (
          <button
            key={f}
            onClick={() => setPriceFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
              priceFilter === f
                ? f === 'free'
                  ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/40'
                  : f === 'paid'
                    ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/40'
                    : 'bg-white/10 text-white ring-1 ring-white/20'
                : 'glass text-gray-400 hover:text-white hover:border-white/15'
            }`}
          >
            {f === 'all' ? t.services.all : f === 'free' ? t.services.freeOnly : t.services.paidOnly}
          </button>
        ))}
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap items-center gap-2 mb-8 animate-fade-in-up">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
              category === cat.key
                ? 'gradient-btn text-white'
                : 'glass text-gray-400 hover:text-white hover:border-white/15'
            }`}
          >
            {t.services[CATEGORY_LABELS[cat.key]]}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 animate-shimmer h-48" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500 text-center py-16 glass rounded-2xl">
          {search ? `${t.services.noMatch} "${search}"` : t.services.noServices}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => <ServiceCard key={s.id} service={s} />)}
        </div>
      )}
    </div>
  );
}
