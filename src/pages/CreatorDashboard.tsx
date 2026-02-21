import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import useSEO from '../hooks/useSEO';
import { API_URL } from '../config';

function ServiceRow({ service, t }) {
  const cd = t.creatorDashboard || {};
  const price = parseFloat(service.price_usdc || service.price) || 0;
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
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetched, setFetched] = useState(false);

  // Auto-fetch when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      fetchMyServices(address);
    } else {
      setServices([]);
      setFetched(false);
      setError(null);
    }
  }, [isConnected, address]);

  const fetchMyServices = async (walletAddr) => {
    setLoading(true);
    setError(null);
    setFetched(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${API_URL}/api/services`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const allServices = Array.isArray(data) ? data : (data.data || data.services || []);
      const mine = allServices.filter(
        s => s.owner_address?.toLowerCase() === walletAddr.toLowerCase() ||
             s.ownerAddress?.toLowerCase() === walletAddr.toLowerCase()
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

  const totalRevenuePotential = services.reduce((acc, s) => acc + (parseFloat(s.price_usdc || s.price) || 0) * 0.95, 0);

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
        <p className="text-gray-400 text-sm">
          {isConnected
            ? (cd.connectedAs || 'Connected as') + ` ${address.slice(0, 6)}...${address.slice(-4)}`
            : (cd.subtitle || 'Connect your wallet to view your registered APIs and revenue.')}
        </p>
      </div>

      {/* Not connected: prompt to connect */}
      {!isConnected && (
        <div className="glass-card rounded-xl p-8 text-center animate-fade-in-up delay-100">
          <svg className="w-14 h-14 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-white font-semibold text-lg mb-2">{cd.connectTitle || 'Connect Your Wallet'}</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
            {cd.connectDesc || 'Connect the wallet you used when registering your APIs to automatically view all your services, revenue, and statistics.'}
          </p>
          <button
            onClick={() => openConnectModal?.()}
            className="gradient-btn px-8 py-3 rounded-lg text-white text-sm font-medium cursor-pointer
                       hover:opacity-90 transition-opacity"
          >
            {cd.connectBtn || 'Connect Wallet'}
          </button>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Link to="/creators/onboarding" className="text-xs text-[#FF9900] no-underline hover:text-[#FEBD69] transition-colors font-medium">
              {cd.readGuide || 'Read the onboarding guide'} &rarr;
            </Link>
            <Link to="/register" className="text-xs text-gray-400 no-underline hover:text-white transition-colors">
              {cd.registerNew || 'Register a new API'} &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Loading spinner */}
      {isConnected && loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-8 h-8 border-2 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin" />
          <p className="text-xs text-gray-500">{cd.loadingApis || 'Loading your APIs...'}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card rounded-xl p-6 text-center mb-6">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button
            onClick={() => fetchMyServices(address)}
            className="text-xs text-[#FF9900] font-medium cursor-pointer hover:text-[#FEBD69] transition-colors"
          >
            {cd.retry || 'Retry'}
          </button>
        </div>
      )}

      {/* Results */}
      {isConnected && fetched && !loading && !error && (
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
    </div>
  );
}
