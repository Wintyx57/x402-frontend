import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { useReveal } from '../hooks/useReveal';
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

// --- SVG Check Icon ---
function CheckIcon() {
  return (
    <span className="check-circle">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2.5 5L4.5 7L7.5 3" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

// --- TX Badge ---
function TxBadge({ hash, cost, explorerBase }: { hash: string | null; cost: number; explorerBase: string }) {
  if (!hash) return null;
  return (
    <a
      href={`${explorerBase}/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Transaction ${truncHash(hash)} — ${cost} USDC`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400
                 text-xs font-mono hover:bg-emerald-500/20 hover:scale-[1.02] transition-all no-underline"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      {truncHash(hash)} &middot; {cost} USDC
    </a>
  );
}

// --- Live Badge ---
function LiveBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                 bg-emerald-500/10 border border-emerald-500/25"
      role="status"
      aria-label="Live feed"
    >
      <span className="live-dot" />
      <span className="text-emerald-400 font-semibold text-[10px] uppercase tracking-[0.12em]">
        LIVE
      </span>
    </span>
  );
}

// --- Section Label ---
function SectionLabel({ children }: { children: string }) {
  return (
    <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 mb-2">
      {children}
    </span>
  );
}

// --- Globe CSS (ISS) ---
function IssGlobe({ lat, lon }: { lat: number; lon: number }) {
  const normLat = (90 - lat) / 180;
  const normLon = (lon + 180) / 360;
  const dotX = 20 + normLon * 60;
  const dotY = 10 + normLat * 80;

  return (
    <div className="iss-globe-container">
      <div className="iss-globe">
        <div className="globe-grid" />
        <div
          className="iss-dot"
          style={{ left: `${dotX}%`, top: `${dotY}%` }}
          title={`${lat.toFixed(1)}, ${lon.toFixed(1)}`}
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
      <span className="text-[10px] tracking-[0.14em] text-gray-500 font-semibold mr-1">T-</span>
      {blocks.map((b, i) => (
        <div key={b.label} className="flex items-center gap-2">
          <div className="countdown-block">
            <span className={`text-3xl sm:text-4xl font-mono font-light leading-none tabular-nums ${
              b.label === 'SEC' ? 'text-[#FF9900]' : 'text-white'
            }`} style={b.label === 'SEC' ? { textShadow: '0 0 12px rgba(255,153,0,0.4)' } : undefined}>
              {String(b.val).padStart(2, '0')}
            </span>
            <span className="text-[10px] tracking-[0.14em] text-gray-500 font-semibold">{b.label}</span>
          </div>
          {i < blocks.length - 1 && (
            <span className="text-2xl text-gray-700 font-extralight">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

// --- Payment Flow Diagram ---
function PaymentFlow({ report }: { report: AgentReport }) {
  const { t } = useTranslation();
  const ref = useReveal();
  const wallet = report.agent_wallet
    ? `${report.agent_wallet.slice(0, 6)}...${report.agent_wallet.slice(-4)}`
    : '0xAgent';

  const flows = [
    { label: 'NASA APOD', cost: report.nasa?.cost || 0.005, hash: report.nasa?.tx_hash },
    { label: 'ISS TRACKER', cost: report.iss?.cost || 0.003, hash: report.iss?.tx_hash },
    { label: 'SPACEX', cost: report.spacex?.cost || 0.005, hash: report.spacex?.tx_hash },
  ];

  const la = t.liveAgent || {} as Record<string, string>;

  return (
    <div ref={ref} className="glass-card rounded-2xl p-6 sm:p-8 reveal animate-fade-in-up delay-300">
      <SectionLabel>{la.paymentFlow || 'PAYMENT FLOW'}</SectionLabel>

      <div className="space-y-3 mt-4">
        {flows.map((f) => (
          <div key={f.label} className="flex items-center gap-3 text-sm">
            <span className="shrink-0 w-28">
              <span className="block text-[10px] tracking-wider text-gray-500 font-semibold">AGENT</span>
              <span className="font-mono text-sm text-gray-400">{wallet}</span>
            </span>
            <span className="payment-flow-arrow flex-1" />
            <span className="text-[#FF9900] font-mono text-xs w-16 text-center tabular-nums">{f.cost} USDC</span>
            <span className="payment-flow-arrow flex-1" />
            <span className="w-28 text-right flex items-center justify-end gap-1.5">
              <span className="text-[10px] tracking-wider text-gray-400 font-semibold">{f.label}</span>
              {f.hash && <CheckIcon />}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">
        <span>{la.totalCost || 'Total cost per run'}: <strong className="text-white">0.013 USDC</strong></span>
        <span>{la.runsPerDay || '2 runs/day'}</span>
        <span>{la.paymentFlowDesc || 'Real USDC payments on SKALE — $0.0007 gas per transaction'}</span>
      </div>
    </div>
  );
}

// --- History Timeline ---
function PastRuns({ reports }: { reports: AgentHistoryItem[] }) {
  const { t } = useTranslation();
  const ref = useReveal();
  if (!reports || reports.length === 0) return null;

  const la = t.liveAgent || {} as Record<string, string>;

  return (
    <div ref={ref} className="reveal animate-fade-in-up delay-500">
      <SectionLabel>{la.pastRuns || 'PAST REPORTS'}</SectionLabel>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin timeline-scroll mt-3">
        {reports.map((r) => (
          <div
            key={r.id}
            className="glass-card card-hover-lift rounded-xl p-4 min-w-[220px] shrink-0"
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
              <span className="font-mono tabular-nums">{r.total_cost} USDC</span>
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

// --- Collapsible NASA Explanation ---
function NasaExplanation({ text, label }: { text: string; label: string }) {
  const [expanded, setExpanded] = useState(false);
  const ref = useReveal();

  return (
    <div ref={ref} className="glass-card rounded-2xl p-6 reveal animate-fade-in-up delay-400">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left cursor-pointer bg-transparent border-none p-0"
      >
        <SectionLabel>{label}</SectionLabel>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[2000px] mt-4' : 'max-h-0'}`}>
        <p className="text-base text-gray-300 leading-relaxed whitespace-pre-line">{text}</p>
      </div>
    </div>
  );
}

// --- Loading Skeleton ---
function LoadingSkeleton() {
  return (
    <div className="min-h-screen pb-20 animate-page-enter">
      {/* Hero skeleton */}
      <div className="w-full h-[420px] sm:h-[520px] animate-shimmer rounded-none" />
      {/* Cards skeleton */}
      <div className="max-w-7xl mx-auto px-4 mt-6 grid md:grid-cols-2 gap-5">
        <div className="h-[280px] rounded-2xl animate-shimmer" />
        <div className="h-[280px] rounded-2xl animate-shimmer" />
      </div>
    </div>
  );
}

// --- Main Page ---
export default function LiveAgent() {
  const { t } = useTranslation();
  const { data: report, isLoading } = useLiveAgent();
  const { data: historyData } = useLiveAgentHistory(10);
  const heroRef = useReveal();
  const issRef = useReveal();
  const spacexRef = useReveal();
  const ctaRef = useReveal();

  useSEO({
    title: 'Live AI Agent — x402 Bazaar',
    description: 'Watch a real AI agent pay for 3 space APIs with USDC, twice a day. NASA, ISS, SpaceX — fully autonomous, with on-chain payment proofs.',
    keywords: 'x402, ai agent, autonomous, usdc, api payments, nasa, iss, spacex',
  });

  const la = t.liveAgent || {} as Record<string, string>;
  const hasData = report && report.status !== 'no_data';
  const history = historyData?.reports || [];

  const explorerBase = useMemo(() => {
    return report?.explorer_base_url || 'https://skale-base-explorer.skalenodes.com/tx';
  }, [report?.explorer_base_url]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!hasData) {
    return (
      <div className="min-h-screen pt-20 pb-20 px-4 animate-page-enter">
        <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
          <LiveBadge />
          <h1 className="text-3xl font-bold text-white mt-4 mb-4">
            {la.title || 'Live AI Agent'}
          </h1>
          <p className="text-gray-400 mb-8">
            {la.noData || "Agent hasn't run yet. First report coming soon..."}
          </p>
          <div className="glass-card rounded-2xl p-8 text-left">
            <p className="text-sm text-gray-400 mb-4">{la.subtitle || 'This autonomous agent calls 3 space APIs and pays real USDC — twice a day, fully automated.'}</p>
            <ul className="space-y-2 text-sm text-gray-300 list-disc list-inside">
              <li>NASA Astronomy Picture of the Day — 0.005 USDC</li>
              <li>ISS Real-time Position & Crew — 0.003 USDC</li>
              <li>SpaceX Upcoming Launches — 0.005 USDC</li>
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
    <div className="min-h-screen pb-20 animate-page-enter">

      {/* ======= SECTION 1: NASA HERO ======= */}
      <section className="relative w-full min-h-[420px] sm:min-h-[520px] flex items-end overflow-hidden">
        {nasaImageUrl && (
          <img
            src={nasaImageUrl}
            alt={nasa?.title || 'NASA APOD'}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/70 to-[#0a0a0f]/20" />

        <div ref={heroRef} className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-8 pt-20 reveal animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <LiveBadge />
            <span className="text-xs text-gray-400">
              {report.run_at ? timeAgo(report.run_at) : ''}
            </span>
          </div>
          <SectionLabel>NASA ASTRONOMY PICTURE OF THE DAY</SectionLabel>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 max-w-3xl">
            {nasa?.title || la.title || 'Live AI Agent'}
          </h1>
          <p className="text-sm font-mono text-gray-400 mb-4">
            {nasa?.date}
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
          <div ref={issRef} className="glass-card card-hover-lift rounded-2xl p-6 border-l-2 border-l-[#00D4FF]/30 reveal animate-fade-in-up delay-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <SectionLabel>ISS TRACKER</SectionLabel>
                <h2 className="text-lg font-semibold text-white">
                  International Space Station
                </h2>
              </div>
              {iss?.tx_hash && (
                <TxBadge hash={iss.tx_hash} cost={iss.cost || 0.003} explorerBase={explorerBase} />
              )}
            </div>

            {iss?.position ? (
              <>
                <IssGlobe lat={iss.position.lat} lon={iss.position.lon} />
                <div className="mt-4 flex items-center gap-6">
                  <div>
                    <span className="block text-[10px] tracking-wider text-gray-500 font-semibold">LAT</span>
                    <span className="font-mono text-xl text-[#00D4FF] tabular-nums">
                      {iss.position.lat.toFixed(2)}{iss.position.lat >= 0 ? 'N' : 'S'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] tracking-wider text-gray-500 font-semibold">LON</span>
                    <span className="font-mono text-xl text-[#00D4FF] tabular-nums">
                      {iss.position.lon.toFixed(2)}{iss.position.lon >= 0 ? 'E' : 'W'}
                    </span>
                  </div>
                </div>
                {iss.crew?.count > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    {(la.issCrew || '{count} astronauts aboard').replace('{count}', String(iss.crew.count))}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">ISS data unavailable</p>
            )}
          </div>

          {/* SpaceX Card */}
          <div ref={spacexRef} className="glass-card card-hover-lift rounded-2xl p-6 reveal animate-fade-in-up delay-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <SectionLabel>SPACEX</SectionLabel>
                <h2 className="text-lg font-semibold text-white">
                  {spacex?.name || (la.spacexTitle || 'Next SpaceX Launch')}
                </h2>
              </div>
              {spacex?.tx_hash && (
                <TxBadge hash={spacex.tx_hash} cost={spacex.cost || 0.005} explorerBase={explorerBase} />
              )}
            </div>

            {spacex?.name ? (
              <>
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
          <NasaExplanation text={nasa.explanation} label={la.explanation || 'FULL EXPLANATION'} />
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
        <div ref={ctaRef} className="gradient-cta rounded-2xl p-8 sm:p-10 text-center reveal animate-fade-in-up delay-500">
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
