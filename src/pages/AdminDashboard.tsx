import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { ADMIN_STORAGE_KEY as STORAGE_KEY } from '../constants/admin';
import useSEO from '../hooks/useSEO';
import type { AdminFetch } from '../types/admin';
import OverviewTab from '../components/admin-dashboard/OverviewTab';
import ServicesTab from '../components/admin-dashboard/ServicesTab';
import RevenueTab from '../components/admin-dashboard/RevenueTab';
import ActivityTab from '../components/admin-dashboard/ActivityTab';
import TrustScoreTab from '../components/admin-dashboard/TrustScoreTab';
import MonitoringTab from '../components/admin-dashboard/MonitoringTab';
import BudgetsTab from '../components/admin-dashboard/BudgetsTab';

const TABS = ['Vue d\'ensemble', 'Services', 'Revenus', 'Activite', 'Trust Scores', 'Monitoring', 'Budgets'] as const;
type Tab = (typeof TABS)[number];

function LoginModal({ onLogin }: { onLogin: (token: string) => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) { setError(true); return; }
    onLogin(value.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <form onSubmit={submit} className="glass-strong rounded-2xl p-8 w-full max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FF9900]/10 flex items-center justify-center text-xl">&#9776;</div>
          <div>
            <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
            <p className="text-xs text-gray-500">x402bazaar.org</p>
          </div>
        </div>
        <input
          type="password"
          value={value}
          onChange={e => { setValue(e.target.value); setError(false); }}
          placeholder="Admin token"
          autoFocus
          className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 mb-4 outline-none focus:border-[#FF9900]/40 transition-colors ${
            error ? 'border-red-500' : 'border-white/10'
          }`}
        />
        {error && <p className="text-xs text-red-400 mb-3">Token requis</p>}
        <button type="submit" className="w-full gradient-btn text-white font-semibold py-3 rounded-lg">
          Acceder
        </button>
      </form>
    </div>
  );
}

export default function AdminDashboard() {
  useSEO({ title: 'Admin Dashboard', noindex: true });
  const [showLogin, setShowLogin] = useState(!sessionStorage.getItem(STORAGE_KEY));
  const [activeTab, setActiveTab] = useState<Tab>('Vue d\'ensemble');

  const adminFetch: AdminFetch = useCallback(async <T,>(path: string, options?: RequestInit): Promise<T> => {
    const token = sessionStorage.getItem(STORAGE_KEY) || '';
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': token,
        ...(options?.headers || {}),
      },
    });
    if (res.status === 401 || res.status === 403) {
      sessionStorage.removeItem(STORAGE_KEY);
      setShowLogin(true);
      throw new Error('Unauthorized');
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { error?: string; message?: string }).error || `Erreur ${res.status}`);
    }
    return res.json() as Promise<T>;
  }, []);

  const handleLogin = (token: string) => {
    sessionStorage.setItem(STORAGE_KEY, token);
    setShowLogin(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setShowLogin(true);
  };

  if (showLogin) return <LoginModal onLogin={handleLogin} />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-gray-400 hover:text-[#FF9900] transition-colors">&larr; Back</Link>
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
        </div>
        <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-400 transition-colors">
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-[#FF9900]/20 text-[#FF9900] font-semibold'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >{tab}</button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Vue d\'ensemble' && <OverviewTab adminFetch={adminFetch} />}
      {activeTab === 'Services' && <ServicesTab adminFetch={adminFetch} />}
      {activeTab === 'Revenus' && <RevenueTab adminFetch={adminFetch} />}
      {activeTab === 'Activite' && <ActivityTab adminFetch={adminFetch} />}
      {activeTab === 'Trust Scores' && <TrustScoreTab adminFetch={adminFetch} />}
      {activeTab === 'Monitoring' && <MonitoringTab adminFetch={adminFetch} />}
      {activeTab === 'Budgets' && <BudgetsTab adminFetch={adminFetch} />}
    </div>
  );
}
