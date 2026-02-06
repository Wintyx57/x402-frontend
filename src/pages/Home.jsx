import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import ServiceCard from '../components/ServiceCard';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [topServices, setTopServices] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/stats`).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API_URL}/api/services`).then(r => r.json()).then(data => {
      setTopServices(Array.isArray(data) ? data.slice(0, 6) : []);
    }).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          x402 <span className="text-blue-400">Bazaar</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-3">
          The autonomous marketplace where AI agents buy and sell services.
        </p>
        <p className="text-gray-500 max-w-xl mx-auto mb-8">
          Pay with USDC on Base. Every transaction verified on-chain.
          No middlemen, no subscriptions — just HTTP 402.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            to="/services"
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium no-underline transition-colors"
          >
            Browse Services
          </Link>
          <Link
            to="/register"
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3 rounded-lg font-medium no-underline transition-colors"
          >
            List Your API
          </Link>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="max-w-4xl mx-auto px-4 mb-16">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#12121a] border border-gray-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white">{stats.totalServices}</div>
              <div className="text-gray-500 text-sm mt-1">Services Listed</div>
            </div>
            <div className="bg-[#12121a] border border-gray-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-400">{stats.totalPayments}</div>
              <div className="text-gray-500 text-sm mt-1">Payments Verified</div>
            </div>
            <div className="bg-[#12121a] border border-gray-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-400">{stats.totalRevenue} USDC</div>
              <div className="text-gray-500 text-sm mt-1">Total Volume</div>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 mb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-8">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-500/10 text-orange-400 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">1</div>
            <h3 className="text-white font-semibold mb-2">Call an API</h3>
            <p className="text-gray-500 text-sm">Your agent calls any endpoint. If it's paid, the server responds HTTP 402 with the price.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">2</div>
            <h3 className="text-white font-semibold mb-2">Pay USDC on Base</h3>
            <p className="text-gray-500 text-sm">Transfer the exact amount to the recipient address. Takes seconds on Base L2.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">3</div>
            <h3 className="text-white font-semibold mb-2">Access Granted</h3>
            <p className="text-gray-500 text-sm">Resend your request with the tx hash in the header. Verified on-chain, access granted.</p>
          </div>
        </div>
      </section>

      {/* Top Services */}
      {topServices.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Top Services</h2>
            <Link to="/services" className="text-blue-400 hover:text-blue-300 text-sm no-underline">
              View all &rarr;
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topServices.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-8 text-center text-gray-600 text-sm">
        x402 Bazaar — Autonomous AI Marketplace on Base
      </footer>
    </div>
  );
}
