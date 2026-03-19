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

const NAV_ITEMS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'services', label: 'Services', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { id: 'revenue', label: 'Revenus', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'activity', label: 'Activite', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'trust', label: 'Trust Scores', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 'monitoring', label: 'Monitoring', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'budgets', label: 'Budgets', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
] as const;

function NavIcon({ path, active }: { path: string; active: boolean }) {
  return (
    <svg className={`w-5 h-5 transition-colors ${active ? 'text-[#FF9900]' : 'text-gray-500 group-hover:text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function LoginModal({ onLogin }: { onLogin: (token: string) => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) { setError(true); return; }
    onLogin(value.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <form onSubmit={submit} className="bg-[#0f1419] border border-white/10 shadow-2xl rounded-2xl p-8 w-full max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF9900] to-[#FF6600] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Admin Dashboard</h2>
            <p className="text-xs text-gray-600">x402bazaar.org</p>
          </div>
        </div>
        <input
          type="password"
          value={value}
          onChange={e => { setValue(e.target.value); setError(false); }}
          placeholder="Admin token"
          autoFocus
          className={`w-full bg-white/[0.03] border rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 mb-4 outline-none focus:border-[#FF9900]/50 focus:bg-white/[0.05] transition-all ${
            error ? 'border-red-500/50' : 'border-white/8'
          }`}
        />
        {error && <p className="text-xs text-red-400 mb-3">Token requis</p>}
        <button type="submit" className="w-full bg-gradient-to-r from-[#FF9900] to-[#FF6600] text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity">
          Acceder
        </button>
      </form>
    </div>
  );
}

export default function AdminDashboard() {
  useSEO({ title: 'Admin Dashboard', noindex: true });
  const [showLogin, setShowLogin] = useState(!sessionStorage.getItem(STORAGE_KEY));
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const activeNav = NAV_ITEMS.find(n => n.id === activeTab);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0e14]">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-56'} bg-[#0f1419] border-r border-white/5 flex flex-col transition-all duration-200 shrink-0`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/5">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF9900] to-[#FF6600] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">x4</span>
            </div>
            {!sidebarCollapsed && (
              <span className="text-sm font-bold text-white">Admin</span>
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === item.id
                  ? 'bg-[#FF9900]/10 text-white'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <NavIcon path={item.icon} active={activeTab === item.id} />
              {!sidebarCollapsed && (
                <span className={`truncate ${activeTab === item.id ? 'font-medium' : ''}`}>{item.label}</span>
              )}
              {activeTab === item.id && !sidebarCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF9900]" />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/5 p-3 space-y-1">
          {!sidebarCollapsed && (
            <Link
              to="/admin/community-agent"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-purple-400 hover:bg-purple-500/5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
              Community Agent
            </Link>
          )}
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {!sidebarCollapsed && 'Retour au site'}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            {!sidebarCollapsed && 'Deconnexion'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 h-16 bg-[#0a0e14]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-white">{activeNav?.label}</h1>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400/70">Live</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-600 hidden sm:block">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 max-w-[1400px] mx-auto">
          {activeTab === 'overview' && <OverviewTab adminFetch={adminFetch} />}
          {activeTab === 'services' && <ServicesTab adminFetch={adminFetch} />}
          {activeTab === 'revenue' && <RevenueTab adminFetch={adminFetch} />}
          {activeTab === 'activity' && <ActivityTab adminFetch={adminFetch} />}
          {activeTab === 'trust' && <TrustScoreTab adminFetch={adminFetch} />}
          {activeTab === 'monitoring' && <MonitoringTab adminFetch={adminFetch} />}
          {activeTab === 'budgets' && <BudgetsTab adminFetch={adminFetch} />}
        </div>
      </main>
    </div>
  );
}
