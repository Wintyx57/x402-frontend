import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import { API_URL } from '../config';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/* ── SVG Icons ── */
const WalletIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 110-6h5.25A2.25 2.25 0 0121 6v6zm0 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6" />
  </svg>
);

const TrendingUpIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);

const ExchangeIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
);

const GridIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TagIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
  </svg>
);

const ChartLineIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const CopyIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const ExternalLinkIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  </svg>
);

/* ── Helpers ── */
function relativeTime(isoString, t) {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t.analytics.justNow;
  if (minutes < 60) return t.analytics.minutesAgo.replace('{n}', minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t.analytics.hoursAgo.replace('{n}', hours);
  const days = Math.floor(hours / 24);
  return t.analytics.daysAgo.replace('{n}', days);
}

function truncateAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const activityTypeConfig = {
  payment: { colorClass: 'bg-emerald-400/10 text-emerald-400', label: 'payment' },
  api_call: { colorClass: 'bg-blue-400/10 text-blue-400', label: 'apiCall' },
  error: { colorClass: 'bg-red-400/10 text-red-400', label: 'error' },
};

export default function Analytics() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useReveal();

  useEffect(() => { document.title = 'Analytics | x402 Bazaar'; }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchAnalytics() {
      try {
        const response = await fetch(`${API_URL}/api/analytics`, { signal: controller.signal });
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const result = await response.json();
        setData(result);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('Analytics fetch error:', err);
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchAnalytics();
    return () => controller.abort();
  }, []);

  function copyAddress() {
    if (!data?.walletAddress) return;
    navigator.clipboard.writeText(data.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* ── Chart options ── */
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(255, 153, 0, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
        ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
        ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 11 } }
      }
    }
  };

  /* ── Loading Skeleton ── */
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-56 rounded-lg animate-shimmer mb-2"></div>
            <div className="h-4 w-72 rounded animate-shimmer"></div>
          </div>
          <div className="h-8 w-20 rounded-full animate-shimmer"></div>
        </div>

        {/* Wallet hero skeleton */}
        <div className="glass-card rounded-2xl p-8 mb-6 h-44 animate-shimmer"></div>

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="glass-card rounded-xl p-4 h-20 animate-shimmer"></div>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="glass-card rounded-xl p-6 h-80 animate-shimmer"></div>
          <div className="glass-card rounded-xl p-6 h-80 animate-shimmer"></div>
        </div>
        <div className="glass-card rounded-xl p-6 h-80 mb-6 animate-shimmer"></div>

        {/* Activity skeleton */}
        <div className="glass-card rounded-xl p-6 animate-shimmer">
          <div className="h-6 w-40 rounded mb-4 bg-white/5"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-14 rounded-lg bg-white/5"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold gradient-text mb-2">{t.analytics.title}</h1>
        <p className="text-gray-400 text-sm mb-8">{t.analytics.subtitle}</p>
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-gray-400">{t.analytics.noData}</p>
        </div>
      </div>
    );
  }

  /* ── Chart data ── */
  const dailyVolumeData = {
    labels: data.dailyVolume?.map(d => d.date) || [],
    datasets: [{
      label: 'Volume (USDC)',
      data: data.dailyVolume?.map(d => d.total) || [],
      borderColor: '#FF9900',
      backgroundColor: 'rgba(255, 153, 0, 0.1)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#FF9900',
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }]
  };

  const topServicesData = {
    labels: data.topServices?.map(s => s.endpoint) || [],
    datasets: [{
      label: 'Calls',
      data: data.topServices?.map(s => s.count) || [],
      backgroundColor: '#FF9900',
      borderRadius: 4,
      borderSkipped: false
    }]
  };

  const cumulativeRevenueData = {
    labels: data.cumulativeRevenue?.map(d => d.date) || [],
    datasets: [{
      label: 'Revenue (USDC)',
      data: data.cumulativeRevenue?.map(d => d.total) || [],
      borderColor: '#34D399',
      backgroundColor: 'rgba(52, 211, 153, 0.1)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#34D399',
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }]
  };

  /* ── Stat cards config ── */
  const stats = [
    {
      icon: <TrendingUpIcon className="w-5 h-5 text-emerald-400" />,
      value: `$${data.totals?.revenue?.toFixed(2) || '0.00'}`,
      label: t.analytics.totalRevenue,
      bgColor: 'bg-emerald-400/10'
    },
    {
      icon: <ExchangeIcon className="w-5 h-5 text-blue-400" />,
      value: data.totals?.transactions?.toLocaleString() || '0',
      label: t.analytics.totalTransactions,
      bgColor: 'bg-blue-400/10'
    },
    {
      icon: <GridIcon className="w-5 h-5 text-[#FF9900]" />,
      value: data.totals?.services || '0',
      label: t.analytics.totalServices,
      bgColor: 'bg-[#FF9900]/10'
    },
    {
      icon: <CheckCircleIcon className="w-5 h-5 text-emerald-400" />,
      value: data.activeServicesCount || '0',
      label: t.analytics.activeServices,
      bgColor: 'bg-emerald-400/10'
    },
    {
      icon: <TagIcon className="w-5 h-5 text-amber-400" />,
      value: `$${data.avgPrice?.toFixed(3) || '0.000'}`,
      label: t.analytics.avgPrice,
      bgColor: 'bg-amber-400/10'
    }
  ];

  const recentActivity = data.recentActivity || [];
  const explorer = data.explorer || 'https://basescan.org';

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">

      {/* ── 1. Header ── */}
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold gradient-text">{t.analytics.title}</h1>
          <p className="text-gray-400 text-sm mt-1">{t.analytics.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 glass-card rounded-full px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></span>
          <span className="text-xs text-emerald-400 font-medium">{t.analytics.live}</span>
        </div>
      </div>

      {/* ── 2. Wallet Balance Hero Card ── */}
      <div
        className="glass-card glow-orange-lg rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden animate-fade-in-up"
        style={{ animationDelay: '0.1s' }}
      >
        {/* Background radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(255,153,0,0.06) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="relative">
          <div className="flex items-center gap-2 text-gray-400 mb-3">
            <WalletIcon className="w-5 h-5 text-[#FF9900]" />
            <span className="text-sm font-medium">{t.analytics.treasuryBalance}</span>
          </div>
          <div className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            ${data.walletBalance?.toFixed(2) || '0.00'} <span className="text-lg md:text-xl text-gray-400 font-normal">USDC</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Address + copy */}
            <div className="flex items-center gap-2">
              <code className="text-sm text-gray-400 font-mono">
                {truncateAddress(data.walletAddress)}
              </code>
              <button
                onClick={copyAddress}
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-gray-500 hover:text-white"
                aria-label={t.analytics.copyAddress}
              >
                {copied
                  ? <CheckIcon className="w-4 h-4 text-emerald-400" />
                  : <CopyIcon className="w-4 h-4" />
                }
              </button>
              {copied && (
                <span className="text-xs text-emerald-400 animate-fade-in">{t.analytics.copied}</span>
              )}
            </div>

            {/* Network badge */}
            {data.network && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20">
                {data.network}
              </span>
            )}

            {/* Explorer link */}
            {data.walletAddress && (
              <a
                href={`${explorer}/address/${data.walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#FF9900] transition-colors"
              >
                {t.analytics.viewOnExplorer}
                <ExternalLinkIcon className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Stat Cards Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="glass-card rounded-xl p-4 group hover:glow-orange transition-all animate-fade-in-up"
            style={{ animationDelay: `${0.2 + i * 0.05}s` }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center shrink-0`}>
                {stat.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xl font-bold text-white truncate">{stat.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider truncate">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 4. Charts Grid ── */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Daily Volume */}
        <div
          className="glass-card rounded-xl p-6 animate-fade-in-up"
          style={{ animationDelay: '0.45s' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <ChartLineIcon className="w-5 h-5 text-[#FF9900]" />
            <h2 className="text-lg font-semibold text-white">{t.analytics.dailyVolumeTitle}</h2>
          </div>
          <div className="h-64">
            <Line data={dailyVolumeData} options={commonOptions} />
          </div>
        </div>

        {/* Top Services */}
        <div
          className="glass-card rounded-xl p-6 animate-fade-in-up"
          style={{ animationDelay: '0.5s' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <ChartLineIcon className="w-5 h-5 text-[#FF9900]" />
            <h2 className="text-lg font-semibold text-white">{t.analytics.topServicesTitle}</h2>
          </div>
          <div className="h-64">
            <Bar data={topServicesData} options={commonOptions} />
          </div>
        </div>
      </div>

      {/* Cumulative Revenue - full width */}
      <div
        className="glass-card rounded-xl p-6 mb-6 animate-fade-in-up"
        style={{ animationDelay: '0.55s' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUpIcon className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">{t.analytics.cumulativeRevenueTitle}</h2>
        </div>
        <div className="h-72">
          <Line data={cumulativeRevenueData} options={commonOptions} />
        </div>
      </div>

      {/* ── 5. Recent Activity Feed ── */}
      <div
        className="glass-card rounded-xl p-6 animate-fade-in-up"
        style={{ animationDelay: '0.6s' }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">{t.analytics.recentActivity}</h3>
        {recentActivity.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">{t.analytics.noActivity}</p>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((item, i) => {
              const config = activityTypeConfig[item.type] || activityTypeConfig.api_call;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {/* Type icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${config.colorClass}`}>
                    {item.type === 'payment' && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {item.type === 'api_call' && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                      </svg>
                    )}
                    {item.type === 'error' && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    )}
                  </div>

                  {/* Detail */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{item.detail}</div>
                    <div className="text-xs text-gray-500">{relativeTime(item.time, t)}</div>
                  </div>

                  {/* Amount */}
                  {item.amount != null && (
                    <div className="text-sm font-mono text-emerald-400 shrink-0">
                      ${item.amount}
                    </div>
                  )}

                  {/* Tx link */}
                  {item.txHash && (
                    <a
                      href={`${explorer}/tx/${item.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-500 hover:text-[#FF9900] transition-colors shrink-0"
                      aria-label="View transaction"
                    >
                      tx&#8599;
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
