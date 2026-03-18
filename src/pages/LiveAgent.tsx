import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import { useLiveAgent, useLiveAgentHistory } from '../hooks/useLiveAgent';
import type { AgentReport, AgentHistoryItem } from '../hooks/useLiveAgent';

// --- Helpers ---
function truncHash(hash: string | null) {
  if (!hash) return null;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// --- TX Badge ---
function TxBadge({ hash, cost, explorerBase }: { hash: string | null; cost: number; explorerBase: string }) {
  if (!hash) return null;
  return (
    <a
      href={`${explorerBase}/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400
                 text-xs font-mono hover:bg-emerald-500/25 transition-colors no-underline"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      {truncHash(hash)} &middot; {cost} USDC
    </a>
  );
}

// --- Live Badge ---
function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wider">
      <span className="live-dot" />
      LIVE
    </span>
  );
}

// --- Globe CSS (ISS) ---
function IssGlobe({ lat, lon }: { lat: number; lon: number }) {
  // Convert lat/lon to CSS position on a circle
  // lat: -90..90, lon: -180..180
  const normLat = (90 - lat) / 180; // 0 (north) to 1 (south)
  const normLon = (lon + 180) / 360; // 0 (west) to 1 (east)
  const dotX = 20 + normLon * 60; // percent
  const dotY = 10 + normLat * 80;

  return (
    <div className="iss-globe-container">
      <div className="iss-globe">
        {/* Grid lines */}
        <div className="globe-grid" />
        {/* ISS dot */}
        <div
          className="iss-dot"
          style={{ left: `${dotX}%`, top: `${dotY}%` }}
          title={`${lat.toFixed(1)}°, ${lon.toFixed(1)}°`}
        />
      </div>
    </div>
  );
}

// --- Countdown ---
function SpacexCountdown({ targetDate }: { targetDate: string }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = new Date(targetDate).getTime();
  const diff = Math.max(0, target - now);

  if (diff === 0) {
    return <div className="text-xl font-bold text-emerald-400">Launched!</div>;
  }

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const blocks = [
    { val: d, label: 'DAYS' },
    { val: h, label: 'HRS' },
    { val: m, label: 'MIN' },
    { val: s, label: 'SEC' },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 mr-1">T-</span>
      {blocks.map((b, i) => (
        <div key={b.label} className="flex items-center gap-2">
          <div className="countdown-block">
            <span className="text-xl sm:text-2xl font-mono font-bold text-white leading-none">
              {String(b.val).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">{b.label}</span>
          </div>
          {i < blocks.length - 1 && (
            <span className="text-gray-600 text-lg font-light">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

// --- Payment Flow Diagram ---
function PaymentFlow({ report }: { report: AgentReport }) {
  const { t } = useTranslation();
  const wallet = report.agent_wallet
    ? `${report.agent_wallet.slice(0, 6)}...${report.agent_wallet.slice(-4)}`
    : '0xAgent';

  const flows = [
    { emoji: '🔭', label: 'NASA', cost: report.nasa?.cost || 0.005, hash: report.nasa?.tx_hash },
    { emoji: '🛰️', label: 'ISS', cost: report.iss?.cost || 0.003, hash: report.iss?.tx_hash },
    { emoji: '🚀', label: 'SpaceX', cost: report.spacex?.cost || 0.005, hash: report.spacex?.tx_hash },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <h3 className="text-lg font-semibold text-white mb-6">{t.liveAgent?.paymentFlow || 'Payment Flow'}</h3>

      <div className="space-y-3">
        {flows.map((f) => (
          <div key={f.label} className="flex items-center gap-3 text-sm">
            <span className="font-mono text-gray-400 w-28 shrink-0">🏦 {wallet}</span>
            <span className="payment-flow-arrow flex-1" />
            <span className="text-[#FF9900] font-mono text-xs w-16 text-center">{f.cost} USDC</span>
            <span className="payment-flow-arrow flex-1" />
            <span className="w-24 text-right">
              {f.emoji} {f.label}
              {f.hash && <span className="ml-1 text-emerald-400">✓</span>}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">
        <span>{t.liveAgent?.totalCost || 'Total cost per run'}: <strong className="text-white">0.013 USDC</strong></span>
        <span>{t.liveAgent?.runsPerDay || '2 runs/day'}</span>
        <span>{t.liveAgent?.paymentFlowDesc || 'Real USDC payments on SKALE — $0.0007 gas per transaction'}</span>
      </div>
    </div>
  );
}

// --- History Timeline ---
function PastRuns({ reports }: { reports: AgentHistoryItem[] }) {
  const { t } = useTranslation();
  if (!reports || reports.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">{t.liveAgent?.pastRuns || 'Past Reports'}</h3>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {reports.map((r) => (
          <div
            key={r.id}
            className="glass-card rounded-xl p-4 min-w-[220px] shrink-0 hover:scale-[1.02] transition-transform"
          >
            {r.nasa_url && (
              <div className="w-full h-24 rounded-lg overflow-hidden mb-3 bg-white/5">
                <img
                  src={r.nasa_url}
                  alt={r.nasa_title || 'NASA APOD'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <p className="text-xs text-gray-400 mb-1">{r.nasa_date || timeAgo(r.run_at)}</p>
            <p className="text-sm text-white font-medium truncate">{r.nasa_title || 'Report'}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <span>{r.total_cost} USDC</span>
              <span>&middot;</span>
              <span>{r.tx_count} tx</span>
              <span
                className={`ml-auto w-1.5 h-1.5 rounded-full ${
                  r.status === 'success' ? 'bg-emerald-400' : r.status === 'partial' ? 'bg-yellow-400' : 'bg-red-400'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main Page ---
export default function LiveAgent() {
  const { t } = useTranslation();
  const { data: report, isLoading } = useLiveAgent();
  const { data: historyData } = useLiveAgentHistory(10);

  useSEO({
    title: 'Live AI Agent — x402 Bazaar',
    description: 'Watch a real AI agent pay for 3 space APIs with USDC, twice a day. NASA, ISS, SpaceX — fully autonomous, with on-chain payment proofs.',
    keywords: 'x402, ai agent, autonomous, usdc, api payments, nasa, iss, spacex',
  });

  const la = t.liveAgent || {} as Record<string, string>;
  const hasData = report && report.status !== 'no_data';
  const history = historyData?.reports || [];

  // Memoize explorer base URL
  const explorerBase = useMemo(() => {
    return report?.explorer_base_url || 'https://skale-base-explorer.skalenodes.com/tx';
  }, [report?.explorer_base_url]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-8 pb-20 px-4 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading agent data...</div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="min-h-screen pt-20 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <LiveBadge />
          <h1 className="text-3xl font-bold text-white mt-4 mb-4">
            {la.title || 'Live AI Agent'}
          </h1>
          <p className="text-gray-400 mb-8">
            {la.noData || "Agent hasn't run yet. First report coming soon..."}
          </p>
          <div className="glass-card rounded-2xl p-8 text-left">
            <p className="text-sm text-gray-400 mb-4">{la.subtitle || 'This autonomous agent calls 3 space APIs and pays real USDC — twice a day, fully automated.'}</p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>🔭 NASA Astronomy Picture of the Day — 0.005 USDC</li>
              <li>🛰️ ISS Real-time Position &amp; Crew — 0.003 USDC</li>
              <li>🚀 SpaceX Upcoming Launches — 0.005 USDC</li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">Runs at 8:00 AM and 8:00 PM UTC on SKALE on Base</p>
          </div>
        </div>
      </div>
    );
  }

  const nasa = report.nasa;
  const iss = report.iss;
  const spacex = report.spacex;
  const nasaImageUrl = nasa?.media_type === 'image' ? (nasa.hdurl || nasa.url) : null;

  return (
    <div className="min-h-screen pb-20">

      {/* ======= SECTION 1: NASA HERO ======= */}
      <section className="relative w-full min-h-[420px] sm:min-h-[520px] flex items-end overflow-hidden">
        {/* Background image */}
        {nasaImageUrl && (
          <img
            src={nasaImageUrl}
            alt={nasa?.title || 'NASA APOD'}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-8 pt-20">
          <div className="flex items-center gap-3 mb-3">
            <LiveBadge />
            <span className="text-xs text-gray-400">
              {report.run_at ? timeAgo(report.run_at) : ''}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 max-w-3xl">
            {nasa?.title || la.title || 'Live AI Agent'}
          </h1>
          <p className="text-sm text-gray-300 mb-4">
            {nasa?.date} — NASA Astronomy Picture of the Day
          </p>
          {nasa?.tx_hash && (
            <TxBadge hash={nasa.tx_hash} cost={nasa.cost || 0.005} explorerBase={explorerBase} />
          )}
        </div>
      </section>

      {/* ======= SECTION 2: ISS + SpaceX ======= */}
      <section className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-5">
          {/* ISS Card */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                🌍 {la.issTitle || 'ISS Position'}
              </h2>
              {iss?.tx_hash && (
                <TxBadge hash={iss.tx_hash} cost={iss.cost || 0.003} explorerBase={explorerBase} />
              )}
            </div>

            {iss?.position ? (
              <>
                <IssGlobe lat={iss.position.lat} lon={iss.position.lon} />
                <div className="mt-4 space-y-1">
                  <p className="text-sm text-white font-mono">
                    {iss.position.lat.toFixed(2)}° {iss.position.lat >= 0 ? 'N' : 'S'},&nbsp;
                    {iss.position.lon.toFixed(2)}° {iss.position.lon >= 0 ? 'E' : 'W'}
                  </p>
                  {iss.crew?.count > 0 && (
                    <p className="text-xs text-gray-400">
                      {(la.issCrew || '{count} astronauts aboard').replace('{count}', String(iss.crew.count))}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">ISS data unavailable</p>
            )}
          </div>

          {/* SpaceX Card */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                🚀 {la.spacexTitle || 'Next SpaceX Launch'}
              </h2>
              {spacex?.tx_hash && (
                <TxBadge hash={spacex.tx_hash} cost={spacex.cost || 0.005} explorerBase={explorerBase} />
              )}
            </div>

            {spacex?.name ? (
              <>
                <p className="text-lg font-semibold text-white mb-4">{spacex.name}</p>
                {spacex.date_utc && <SpacexCountdown targetDate={spacex.date_utc} />}
                {spacex.details && (
                  <p className="text-xs text-gray-400 mt-4 line-clamp-3">{spacex.details}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">SpaceX data unavailable</p>
            )}
          </div>
        </div>
      </section>

      {/* ======= SECTION 3: Payment Flow ======= */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <PaymentFlow report={report} />
      </section>

      {/* ======= SECTION 4: NASA Explanation ======= */}
      {nasa?.explanation && (
        <section className="max-w-7xl mx-auto px-4 mt-10">
          <NasaExplanation text={nasa.explanation} label={la.explanation || 'Full Explanation'} />
        </section>
      )}

      {/* ======= SECTION 5: Past Runs ======= */}
      {history.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-10">
          <PastRuns reports={history} />
        </section>
      )}

      {/* ======= SECTION 6: CTA ======= */}
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="glass-card rounded-2xl p-8 sm:p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            {la.ctaTitle || 'Build your own x402 agent'}
          </h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            {la.ctaSubtitle || '5 minutes to deploy an autonomous API-consuming agent'}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/quickstart"
              className="gradient-btn text-white text-sm font-semibold px-6 py-3 rounded-xl no-underline hover:brightness-110 transition-all"
            >
              {la.ctaButton || 'Get Started'}
            </Link>
            <a
              href="https://github.com/Wintyx57/x402-backend"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl border border-white/15 text-gray-300 text-sm font-medium no-underline
                         hover:bg-white/5 hover:text-white transition-colors"
            >
              View Source Code
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

// --- Collapsible NASA Explanation ---
function NasaExplanation({ text, label }: { text: string; label: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card rounded-2xl p-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left cursor-pointer bg-transparent border-none p-0"
      >
        <h3 className="text-base font-semibold text-white">{label}</h3>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[2000px] mt-4' : 'max-h-0'}`}>
        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{text}</p>
      </div>
    </div>
  );
}
