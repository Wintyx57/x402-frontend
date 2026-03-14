import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import useSEO from '../hooks/useSEO';
import { API_URL } from '../config';

// ---- Types ----------------------------------------------------------------

interface TopProvider {
  owner_address: string;
  name: string;
  total_earned: number;
  api_count: number;
  call_count: number;
}

interface TopApi {
  service_id: string;
  name: string;
  category: string;
  total_calls: number;
  total_revenue: number;
}

interface TopPayer {
  wallet_address: string;
  total_spent: number;
  call_count: number;
}

interface LeaderboardData {
  topProviders: TopProvider[];
  topApis: TopApi[];
  topPayers: TopPayer[];
  updatedAt: string;
  stale?: boolean;
}

// ---- Medal badge ----------------------------------------------------------

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span
        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold"
        style={{ background: 'linear-gradient(135deg,#FFD700,#FFA500)', color: '#1a1f2e' }}
        aria-label="Gold"
      >
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span
        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold"
        style={{ background: 'linear-gradient(135deg,#C0C0C0,#A8A8A8)', color: '#1a1f2e' }}
        aria-label="Silver"
      >
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span
        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold"
        style={{ background: 'linear-gradient(135deg,#CD7F32,#A0522D)', color: '#fff' }}
        aria-label="Bronze"
      >
        3
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm text-gray-400 bg-white/5">
      {rank}
    </span>
  );
}

// ---- Table skeleton -------------------------------------------------------

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/3">
          <div className="w-7 h-7 rounded-full animate-shimmer shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-2/3 animate-shimmer rounded" />
            <div className="h-2.5 w-1/3 animate-shimmer rounded" />
          </div>
          <div className="h-3.5 w-20 animate-shimmer rounded" />
        </div>
      ))}
    </div>
  );
}

// ---- Providers table -------------------------------------------------------

function ProvidersTable({ providers, t }: { providers: TopProvider[]; t: Record<string, any> }) {
  const lb = t.leaderboard;
  if (!providers || providers.length === 0) {
    return <p className="text-sm text-gray-500 py-8 text-center">{lb.emptyProviders}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" aria-label={lb.tabProviders}>
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left text-xs font-medium text-gray-500 py-2 px-3 w-10">{lb.rankLabel}</th>
            <th className="text-left text-xs font-medium text-gray-500 py-2 px-3">{lb.providerNameLabel}</th>
            <th className="text-right text-xs font-medium text-gray-500 py-2 px-3">{lb.earnedLabel}</th>
            <th className="text-right text-xs font-medium text-gray-500 py-2 px-3 hidden sm:table-cell">{lb.apiCountLabel}</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p, i) => (
            <tr
              key={p.owner_address + i}
              className="border-b border-white/5 hover:bg-white/3 transition-colors"
            >
              <td className="py-3 px-3">
                <RankBadge rank={i + 1} />
              </td>
              <td className="py-3 px-3">
                <div className="font-medium text-white truncate max-w-[200px]">{p.name}</div>
                <div className="text-xs text-gray-500 font-mono mt-0.5">{p.owner_address}</div>
              </td>
              <td className="py-3 px-3 text-right">
                <span className="font-semibold text-[#FF9900]">
                  ${Number(p.total_earned).toFixed(4)}
                </span>
              </td>
              <td className="py-3 px-3 text-right hidden sm:table-cell text-gray-300">
                {p.api_count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- APIs table -----------------------------------------------------------

function ApisTable({ apis, t }: { apis: TopApi[]; t: Record<string, any> }) {
  const lb = t.leaderboard;
  if (!apis || apis.length === 0) {
    return <p className="text-sm text-gray-500 py-8 text-center">{lb.emptyApis}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" aria-label={lb.tabApis}>
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left text-xs font-medium text-gray-500 py-2 px-3 w-10">{lb.rankLabel}</th>
            <th className="text-left text-xs font-medium text-gray-500 py-2 px-3">{lb.apiNameLabel}</th>
            <th className="text-right text-xs font-medium text-gray-500 py-2 px-3">{lb.callsLabel}</th>
            <th className="text-right text-xs font-medium text-gray-500 py-2 px-3 hidden sm:table-cell">{lb.revenueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {apis.map((api, i) => (
            <tr
              key={api.service_id + i}
              className="border-b border-white/5 hover:bg-white/3 transition-colors"
            >
              <td className="py-3 px-3">
                <RankBadge rank={i + 1} />
              </td>
              <td className="py-3 px-3">
                <div className="font-medium text-white truncate max-w-[200px]">{api.name}</div>
                {api.category && api.category !== 'Other' && (
                  <span className="inline-block mt-0.5 px-1.5 py-0.5 text-xs rounded bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20">
                    {api.category}
                  </span>
                )}
              </td>
              <td className="py-3 px-3 text-right font-semibold text-[#34D399]">
                {api.total_calls.toLocaleString()}
              </td>
              <td className="py-3 px-3 text-right text-gray-300 hidden sm:table-cell">
                ${Number(api.total_revenue).toFixed(4)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- Payers table ---------------------------------------------------------

function PayersTable({ payers, t }: { payers: TopPayer[]; t: Record<string, any> }) {
  const lb = t.leaderboard;
  if (!payers || payers.length === 0) {
    return <p className="text-sm text-gray-500 py-8 text-center">{lb.emptyPayers}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" aria-label={lb.tabPayers}>
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left text-xs font-medium text-gray-500 py-2 px-3 w-10">{lb.rankLabel}</th>
            <th className="text-left text-xs font-medium text-gray-500 py-2 px-3">{lb.payerLabel}</th>
            <th className="text-right text-xs font-medium text-gray-500 py-2 px-3">{lb.spentLabel}</th>
            <th className="text-right text-xs font-medium text-gray-500 py-2 px-3 hidden sm:table-cell">{lb.callCountLabel}</th>
          </tr>
        </thead>
        <tbody>
          {payers.map((p, i) => (
            <tr
              key={p.wallet_address + i}
              className="border-b border-white/5 hover:bg-white/3 transition-colors"
            >
              <td className="py-3 px-3">
                <RankBadge rank={i + 1} />
              </td>
              <td className="py-3 px-3">
                <span className="font-mono text-gray-300 text-xs">{p.wallet_address}</span>
              </td>
              <td className="py-3 px-3 text-right font-semibold text-[#60A5FA]">
                ${Number(p.total_spent).toFixed(4)}
              </td>
              <td className="py-3 px-3 text-right text-gray-300 hidden sm:table-cell">
                {p.call_count.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- Tabs -----------------------------------------------------------------

type Tab = 'providers' | 'apis' | 'payers';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}

function TabButton({ active, onClick, label, count }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer border-none ${
        active
          ? 'bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/30'
          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
      }`}
      aria-pressed={active}
    >
      {label}
      {count > 0 && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          active ? 'bg-[#FF9900]/20 text-[#FF9900]' : 'bg-white/10 text-gray-500'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ---- Main page ------------------------------------------------------------

export default function Leaderboard() {
  const { t } = useTranslation();
  const lb = (t as any).leaderboard;

  useSEO({
    title: lb.pageTitle,
    description: lb.pageDesc,
    noindex: false,
  });

  const ref1 = useReveal();
  const ref2 = useReveal();

  const [activeTab, setActiveTab] = useState<Tab>('providers');

  const { data, isLoading, error, refetch } = useQuery<LeaderboardData>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/leaderboard`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">

      {/* Hero */}
      <div className="animate-fade-in-up mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20">
            {lb.live}
          </span>
          <span className="text-xs text-gray-500">{lb.cacheHint}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{lb.title}</h1>
        <p className="text-gray-400 text-sm max-w-2xl">{lb.subtitle}</p>
      </div>

      {/* Summary cards */}
      {data && (
        <div ref={ref1} className="reveal grid grid-cols-3 gap-4 mb-8">
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#FF9900]">{data.topProviders.length}</div>
            <div className="text-xs text-gray-400 mt-1">{lb.tabProviders}</div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#34D399]">{data.topApis.length}</div>
            <div className="text-xs text-gray-400 mt-1">{lb.tabApis}</div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#60A5FA]">{data.topPayers.length}</div>
            <div className="text-xs text-gray-400 mt-1">{lb.tabPayers}</div>
          </div>
        </div>
      )}

      {/* Main card */}
      <div ref={ref2} className="reveal glass-card rounded-xl overflow-hidden">

        {/* Tabs */}
        <div className="flex items-center gap-2 p-4 border-b border-white/5 flex-wrap">
          <TabButton
            active={activeTab === 'providers'}
            onClick={() => setActiveTab('providers')}
            label={lb.tabProviders}
            count={data?.topProviders.length ?? 0}
          />
          <TabButton
            active={activeTab === 'apis'}
            onClick={() => setActiveTab('apis')}
            label={lb.tabApis}
            count={data?.topApis.length ?? 0}
          />
          <TabButton
            active={activeTab === 'payers'}
            onClick={() => setActiveTab('payers')}
            label={lb.tabPayers}
            count={data?.topPayers.length ?? 0}
          />
          {data?.updatedAt && (
            <span className="ml-auto text-xs text-gray-600 hidden sm:block">
              {lb.updatedAt}: {new Date(data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <TableSkeleton rows={8} />
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-gray-400 mb-2">{lb.error}</p>
              <p className="text-xs text-gray-600 mb-4">{(error as Error).message}</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 text-xs text-[#FF9900] border border-[#FF9900]/20 rounded-lg hover:bg-[#FF9900]/10 transition-colors cursor-pointer"
              >
                {lb.retry}
              </button>
            </div>
          ) : !data ? (
            <p className="py-12 text-center text-sm text-gray-500">{lb.emptyProviders}</p>
          ) : (
            <>
              {activeTab === 'providers' && (
                <ProvidersTable providers={data.topProviders} t={t as Record<string, any>} />
              )}
              {activeTab === 'apis' && (
                <ApisTable apis={data.topApis} t={t as Record<string, any>} />
              )}
              {activeTab === 'payers' && (
                <PayersTable payers={data.topPayers} t={t as Record<string, any>} />
              )}
            </>
          )}
        </div>

        {/* Stale notice */}
        {data?.stale && (
          <div className="px-4 pb-3 text-xs text-yellow-500 text-center border-t border-white/5 pt-2">
            Displaying cached data — live data temporarily unavailable.
          </div>
        )}
      </div>

    </div>
  );
}
