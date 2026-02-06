import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import ServiceCard from '../components/ServiceCard';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [topServices, setTopServices] = useState([]);
  const { t } = useTranslation();
  const statsRef = useReveal();
  const howRef = useReveal();
  const servicesRef = useReveal();

  useEffect(() => {
    fetch(`${API_URL}/api/stats`).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API_URL}/api/services`).then(r => r.json()).then(data => {
      setTopServices(Array.isArray(data) ? data.slice(0, 6) : []);
    }).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px]
                        bg-blue-500/10 rounded-full blur-[120px] animate-glow-pulse pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px]
                        bg-purple-500/8 rounded-full blur-[100px] animate-glow-pulse pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 animate-fade-in-up">
            x402 <span className="gradient-text">Bazaar</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-3 animate-fade-in-up delay-100">
            {t.home.heroSubtitle}
          </p>
          <p className="text-gray-500 max-w-xl mx-auto mb-10 animate-fade-in-up delay-200">
            {t.home.heroDescription}
          </p>

          <div className="flex gap-4 justify-center animate-fade-in-up delay-300">
            <Link
              to="/services"
              className="gradient-btn text-white px-7 py-3 rounded-xl font-medium no-underline
                         transition-all duration-300 hover:scale-105 hover:glow-blue"
            >
              {t.home.browseServices}
            </Link>
            <Link
              to="/register"
              className="glass text-gray-300 px-7 py-3 rounded-xl font-medium no-underline
                         transition-all duration-300 hover:scale-105 hover:border-white/20"
            >
              {t.home.listYourApi}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section ref={statsRef} className="reveal max-w-4xl mx-auto px-4 mb-20">
          <div className="grid grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:glow-blue">
              <div className="text-3xl font-bold text-white">{stats.totalServices}</div>
              <div className="text-gray-500 text-sm mt-1">{t.home.servicesListed}</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:glow-green">
              <div className="text-3xl font-bold text-green-400">{stats.totalPayments}</div>
              <div className="text-gray-500 text-sm mt-1">{t.home.paymentsVerified}</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:glow-purple">
              <div className="text-3xl font-bold gradient-text">{stats.totalRevenue} USDC</div>
              <div className="text-gray-500 text-sm mt-1">{t.home.totalVolume}</div>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section ref={howRef} className="reveal max-w-4xl mx-auto px-4 mb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-10">{t.home.howItWorks}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:glow-blue">
            <div className="w-12 h-12 glass text-orange-400 rounded-full flex items-center justify-center
                            text-xl font-bold mx-auto mb-4 ring-2 ring-orange-400/30">1</div>
            <h3 className="text-white font-semibold mb-2 text-lg">{t.home.step1Title}</h3>
            <p className="text-gray-500 text-sm">{t.home.step1Desc}</p>
          </div>
          <div className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:glow-green">
            <div className="w-12 h-12 glass text-green-400 rounded-full flex items-center justify-center
                            text-xl font-bold mx-auto mb-4 ring-2 ring-green-400/30">2</div>
            <h3 className="text-white font-semibold mb-2 text-lg">{t.home.step2Title}</h3>
            <p className="text-gray-500 text-sm">{t.home.step2Desc}</p>
          </div>
          <div className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:glow-purple">
            <div className="w-12 h-12 glass text-blue-400 rounded-full flex items-center justify-center
                            text-xl font-bold mx-auto mb-4 ring-2 ring-blue-400/30">3</div>
            <h3 className="text-white font-semibold mb-2 text-lg">{t.home.step3Title}</h3>
            <p className="text-gray-500 text-sm">{t.home.step3Desc}</p>
          </div>
        </div>
      </section>

      {/* Top Services */}
      {topServices.length > 0 && (
        <section ref={servicesRef} className="reveal max-w-6xl mx-auto px-4 mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">{t.home.topServices}</h2>
            <Link to="/services" className="gradient-text text-sm no-underline font-medium
                     transition-all duration-300 hover:opacity-80">
              {t.home.viewAll} &rarr;
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topServices.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <footer className="py-8 mt-2 text-center text-gray-600 text-sm">
        {t.home.footer}
      </footer>
    </div>
  );
}
