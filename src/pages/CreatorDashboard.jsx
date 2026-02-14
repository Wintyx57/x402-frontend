import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import useSEO from '../hooks/useSEO';
import { API_URL } from '../config';

function ServiceRow({ service, t }) {
  const cd = t.creatorDashboard || {};
  const price = parseFloat(service.price) || 0;
  const tags = service.tags || [];
  const date = service.created_at
    ? new Date(service.created_at).toLocaleDateString()
    : cd.unknown || 'Unknown';

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#232f3e] flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-[#FF9900]">{(service.name || 'A').charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">{service.name}</h3>
            {service.description && (
              <p className="text-gray-500 text-xs truncate mt-0.5">{service.description}</p>
            )}
          </div>
        </div>
        <span className={`shrink-0 font-mono text-xs font-bold px-2.5 py-1 rounded-lg ${
          price === 0
            ? 'bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20'
            : 'bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20'
        }`}>
          {price > 0 ? `$${price}` : (t.serviceCard?.free || 'Free')}
        </span>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.slice(0, 5).map(tag => (
            <span key={tag} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-lg">{tag}</span>
          ))}
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-white/5">
        <span>{cd.registered || 'Registered'}: {date}</span>
        {price > 0 && (
          <span className="text-[#34D399]">{cd.earnsPerCall || 'Earns'}: ${(price * 0.95).toFixed(4)}/{cd.call || 'call'}</span>
        )}
      </div>
    </div>
  );
}

export default function CreatorDashboard() {
  const { t } = useTranslation();
  const cd = t.creatorDashboard || {};
  useSEO({
    title: cd.title || 'Creator Dashboard',
    description: 'View your APIs on x402 Bazaar. Track registrations, revenue, and manage your provider profile.',
  });

  const ref1 = useReveal();

  const [wallet, setWallet] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = wallet.trim();
    if (!trimmed || !trimmed.startsWith('0x') || trimmed.length !== 42) {
      setError(cd.invalidWallet || 'Please enter a valid Ethereum address (0x...)');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${API_URL}/services`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const allServices = data.services || data || [];
      const mine = allServices.filter(
        s => s.ownerAddress?.toLowerCase() === trimmed.toLowerCase() ||
             s.owner_address?.toLowerCase() === trimmed.toLowerCase()
      );
      setServices(mine);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(cd.fetchError || 'Failed to load services. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const totalRevenuePotential = services.reduce((acc, s) => acc + (parseFloat(s.price) || 0) * 0.95, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="animate-fade-in-up mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Link to="/creators" className="text-gray-500 hover:text-white text-xs no-underline transition-colors">
            {cd.backToPortal || 'Creator Portal'}
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-xs text-gray-400">{cd.title || 'Dashboard'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{cd.title || 'Creator Dashboard'}</h1>
        <p className="text-gray-400 text-sm">{cd.subtitle || 'Enter your wallet address to view your registered APIs and revenue.'}</p>
      </div>

      {/* Wallet input */}
      <form onSubmit={handleSearch} className="mb-8 animate-fade-in-up delay-100">
        <label className="block text-sm text-gray-400 mb-2" htmlFor="wallet-input">{cd.walletLabel || 'Wallet Address'}</label>
        <div className="flex gap-3">
          <input
            id="wallet-input"
            type="text"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="0x..."
            className="flex-1 bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600
                       focus:outline-none focus:border-[#FF9900]/40 transition-all duration-300 font-mono text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="gradient-btn px-6 py-2.5 rounded-lg text-white text-sm font-medium cursor-pointer
                       hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
          >
            {loading ? (cd.searching || 'Searching...') : (cd.searchBtn || 'Search')}
          </button>
        </div>
        {error && (
          <p className="text-red-400 text-xs mt-2">{error}</p>
        )}
      </form>

      {/* Results */}
      {searched && !loading && (
        <div ref={ref1} className="reveal">
          {services.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-400 text-sm mb-2">{cd.noApis || 'No APIs found for this wallet.'}</p>
              <p className="text-gray-600 text-xs mb-4">{cd.noApisHint || 'Make sure you used the same wallet address during registration.'}</p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 gradient-btn px-5 py-2 rounded-lg text-white text-sm font-medium no-underline hover:opacity-90 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {cd.registerFirst || 'Register Your First API'}
              </Link>
            </div>
          ) : (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#FF9900]">{services.length}</div>
                  <div className="text-xs text-gray-400">{cd.yourApis || 'Your APIs'}</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#34D399]">95%</div>
                  <div className="text-xs text-gray-400">{cd.revenueShare || 'Revenue Share'}</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center sm:col-span-1 col-span-2">
                  <div className="text-2xl font-bold text-[#60A5FA]">${totalRevenuePotential.toFixed(4)}</div>
                  <div className="text-xs text-gray-400">{cd.revenuePerCycle || 'Revenue / call cycle'}</div>
                </div>
              </div>

              {/* API list */}
              <div className="space-y-3 mb-6">
                {services.map((s, i) => (
                  <ServiceRow key={s.id || i} service={s} t={t} />
                ))}
              </div>

              {/* Add more CTA */}
              <div className="text-center">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 text-[#FF9900] text-sm font-medium no-underline hover:text-[#FEBD69] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {cd.addMore || 'Register Another API'}
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-8 h-8 border-2 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin" />
          <p className="text-xs text-gray-500">{cd.loadingApis || 'Loading your APIs...'}</p>
        </div>
      )}

      {/* Guide section */}
      {!searched && (
        <div className="glass-card rounded-xl p-6 text-center animate-fade-in-up delay-200">
          <svg className="w-10 h-10 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-white font-semibold text-sm mb-2">{cd.guideTitle || 'How to use this dashboard'}</h3>
          <p className="text-gray-400 text-xs leading-relaxed max-w-md mx-auto mb-4">
            {cd.guideDesc || 'Enter the wallet address you used when registering your APIs. We will show all services associated with that address, along with pricing and revenue details.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/creators/onboarding" className="text-xs text-[#FF9900] no-underline hover:text-[#FEBD69] transition-colors font-medium">
              {cd.readGuide || 'Read the onboarding guide'} &rarr;
            </Link>
            <Link to="/register" className="text-xs text-gray-400 no-underline hover:text-white transition-colors">
              {cd.registerNew || 'Register a new API'} &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
