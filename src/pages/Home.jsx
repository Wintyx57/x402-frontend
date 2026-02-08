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
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 animate-fade-in-up">
            x402 <span className="gradient-text">Bazaar</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-3 animate-fade-in-up delay-100">
            {t.home.heroSubtitle}
          </p>
          <p className="text-gray-500 max-w-xl mx-auto mb-10 animate-fade-in-up delay-200">
            {t.home.heroDescription}
          </p>

          <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up delay-300">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <div className="flex items-center justify-between mb-8 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">{t.home.topServices}</h2>
            <Link to="/services" className="gradient-text text-sm no-underline font-medium whitespace-nowrap
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
      <footer className="max-w-4xl mx-auto px-4 py-10 mt-2">
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-gray-400 text-sm mb-4">
            Built for the <span className="gradient-text font-semibold">x402 Hackathon</span>
          </p>
          <div className="flex items-center justify-center gap-6 mb-4">
            <a
              href="https://github.com/Wintyx57/x402-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors duration-300 text-sm no-underline"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Frontend
            </a>
            <a
              href="https://github.com/Wintyx57/x402-backend"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors duration-300 text-sm no-underline"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Backend
            </a>
          </div>
          <p className="text-gray-600 text-xs">
            Powered by <span className="text-blue-400">Base</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
