import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import useSEO from '../hooks/useSEO';
import OverviewTab from '../components/community-agent/OverviewTab';
import AutomationTab from '../components/community-agent/AutomationTab';
import StudioTab from '../components/community-agent/StudioTab';
import ConfigTab from '../components/community-agent/ConfigTab';
import HistoryTab from '../components/community-agent/HistoryTab';
import LogsTab from '../components/community-agent/LogsTab';

const TABS = ['Overview', 'Automation', 'Studio', 'Config', 'History', 'Logs'] as const;
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
        <h2 className="text-xl font-bold text-white mb-2">Admin Access</h2>
        <p className="text-sm text-gray-400 mb-6">Enter admin token to access the community agent dashboard.</p>
        <input
          type="password"
          value={value}
          onChange={e => { setValue(e.target.value); setError(false); }}
          placeholder="Admin token"
          autoFocus
          className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 mb-4 ${
            error ? 'border-red-500' : 'border-white/10'
          }`}
        />
        {error && <p className="text-xs text-red-400 mb-3">Token is required</p>}
        <button type="submit" className="w-full gradient-btn text-white font-semibold py-3 rounded-lg">
          Login
        </button>
      </form>
    </div>
  );
}

export default function AdminCommunityAgent() {
  useSEO({ title: 'Admin — Community Agent', noindex: true });
  const { showLogin, login, logout, adminFetch } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  if (showLogin) {
    return <LoginModal onLogin={login} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-gray-400 hover:text-[#FF9900]">&larr; Back</Link>
          <h1 className="text-xl font-bold text-white">Community Agent</h1>
        </div>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-red-400">Logout</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === tab
                ? 'bg-[#FF9900]/20 text-[#FF9900] font-semibold'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >{tab}</button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && <OverviewTab adminFetch={adminFetch} />}
      {activeTab === 'Automation' && <AutomationTab adminFetch={adminFetch} />}
      {activeTab === 'Studio' && <StudioTab adminFetch={adminFetch} />}
      {activeTab === 'Config' && <ConfigTab adminFetch={adminFetch} />}
      {activeTab === 'History' && <HistoryTab adminFetch={adminFetch} />}
      {activeTab === 'Logs' && <LogsTab adminFetch={adminFetch} />}
    </div>
  );
}
