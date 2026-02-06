import { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { useTranslation } from '../i18n/LanguageContext';
import ServiceCard from '../components/ServiceCard';

export default function Services() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
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

  const filtered = search
    ? services.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase()) ||
        s.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : services;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10
                      animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-white">{t.services.title}</h1>
          <p className="text-gray-500 mt-1">{services.length} {t.services.apisAvailable}</p>
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

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse h-48" />
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
