import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_URL } from '../config';
import { useTranslation } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import { useReviews, useReviewStats } from '../hooks/useReviews';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import CopyButton from '../components/CopyButton';

interface Service {
  id: string;
  name: string;
  description: string;
  url: string;
  price_usdc: number;
  tags: string[];
  owner_address: string;
  tx_hash?: string;
  created_at: string;
  verified_status?: string;
}

type CodeTab = 'curl' | 'javascript' | 'python';

function getCodeSnippet(service: Service, tab: CodeTab): string {
  const url = service.url || `${API_URL}/api/${service.name.toLowerCase().replace(/\s+/g, '-')}`;
  const price = Number(service.price_usdc);
  const isFree = price === 0;
  const paymentNote = isFree
    ? '# Free API — no payment required'
    : `# Price: $${price} USDC on Base`;

  if (tab === 'curl') {
    if (isFree) {
      return `${paymentNote}
curl -X GET "${url}"`;
    }
    return `${paymentNote}

# Step 1: Call the API (returns 402 with payment instructions)
curl "${url}"

# Step 2: Send USDC on Base to the recipient address shown in the 402 response

# Step 3: Retry with the transaction hash
curl -X GET "${url}" \\
  -H "X-Payment-TxHash: 0xYOUR_TX_HASH" \\
  -H "X-Payment-Chain: base"`;
  }

  if (tab === 'javascript') {
    if (isFree) {
      return `${paymentNote}

const response = await fetch("${url}");
const data = await response.json();
console.log(data);`;
    }
    return `${paymentNote}

// Step 1: Call the API
const res = await fetch("${url}");

if (res.status === 402) {
  const payment = await res.json();
  // payment.address = recipient wallet
  // payment.price   = amount in USDC (${price})

  // Step 2: Send USDC on Base (use viem, ethers, or your wallet)
  const txHash = await sendUSDC(payment.address, payment.price);

  // Step 3: Retry with the transaction hash
  const data = await fetch("${url}", {
    headers: {
      "X-Payment-TxHash": txHash,
      "X-Payment-Chain": "base",
    },
  }).then(r => r.json());

  console.log(data);
}`;
  }

  if (tab === 'python') {
    if (isFree) {
      return `${paymentNote}

import requests

response = requests.get("${url}")
print(response.json())`;
    }
    return `${paymentNote}

import requests

# Step 1: Call the API
res = requests.get("${url}")

if res.status_code == 402:
    payment = res.json()
    # payment["address"] = recipient wallet
    # payment["price"]   = amount in USDC (${price})

    # Step 2: Send USDC on Base
    tx_hash = send_usdc(payment["address"], payment["price"])

    # Step 3: Retry with the transaction hash
    data = requests.get(
        "${url}",
        headers={
            "X-Payment-TxHash": tx_hash,
            "X-Payment-Chain": "base",
        },
    ).json()

    print(data)`;
  }

  return '';
}

// ── Rating distribution bar ────────────────────────────────────────────────────

interface DistributionBarProps {
  star: number;
  count: number;
  total: number;
}

function DistributionBar({ star, count, total }: DistributionBarProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-500 w-3 text-right" aria-label={`${star} star`}>{star}</span>
      <div
        className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${star} stars: ${count} reviews (${pct}%)`}
      >
        <div
          className="h-full bg-[#FBBF24] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-gray-600 w-5 text-right">{count}</span>
    </div>
  );
}

// ── Pagination controls ────────────────────────────────────────────────────────

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-5"
      aria-label="Reviews pagination"
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 rounded-lg text-sm text-gray-400 bg-white/5 border border-white/10
                   hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-150 cursor-pointer"
        aria-label="Previous page"
      >
        &larr;
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
            p === page
              ? 'bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/25 font-medium'
              : 'text-gray-500 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 rounded-lg text-sm text-gray-400 bg-white/5 border border-white/10
                   hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-150 cursor-pointer"
        aria-label="Next page"
      >
        &rarr;
      </button>
    </nav>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 5;

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const [service, setService] = useState<Service | null>(null);
  const [loadingService, setLoadingService] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CodeTab>('curl');
  const [urlCopied, setUrlCopied] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);

  // ── TanStack Query: reviews + stats ──
  const {
    data: reviewsData,
    isLoading: loadingReviews,
    isFetching: fetchingReviews,
  } = useReviews(id, reviewPage);

  const { data: stats, refetch: refetchStats } = useReviewStats(id);

  const reviews = reviewsData?.data ?? [];
  const totalReviews = reviewsData?.count ?? 0;
  const totalPages = Math.ceil(totalReviews / PAGE_SIZE);

  useSEO({
    title: service ? `${service.name} — x402 Bazaar` : 'Service — x402 Bazaar',
    description: service
      ? `${service.description} Pay per call with USDC from $${service.price_usdc ?? '0.001'} via x402 protocol on Base or SKALE. No API key required.`
      : 'Discover and call this API service with USDC micropayments via the x402 protocol on x402 Bazaar.',
    keywords: service
      ? `${service.name}, ${(service.tags || []).join(', ')}, pay-per-call API, USDC micropayment, x402 protocol, AI agent API`
      : undefined,
  });

  useEffect(() => {
    if (!id) return;

    setService(null);
    setError(null);
    setLoadingService(true);
    setReviewPage(1);

    fetch(`${API_URL}/api/services/${id}`)
      .then(async r => {
        if (r.status === 404 || r.status === 405) {
          const listRes = await fetch(`${API_URL}/api/services`);
          const data: Service[] = await listRes.json();
          const found = data.find(s => s.id === id);
          if (!found) throw new Error('Service not found');
          return found;
        }
        if (!r.ok) throw new Error('Failed to load service');
        return r.json() as Promise<Service>;
      })
      .then(setService)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load service'))
      .finally(() => setLoadingService(false));
  }, [id]);

  const handleCopyUrl = async () => {
    if (!service?.url) return;
    try {
      await navigator.clipboard.writeText(service.url);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch {
      // Clipboard API may fail in insecure contexts
    }
  };

  // Reset to page 1 when service changes
  const handleReviewSuccess = () => {
    setReviewPage(1);
    refetchStats();
  };

  if (loadingService) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div
          className="w-8 h-8 border-2 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin mx-auto"
          role="status"
          aria-label="Loading service"
        />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 mb-4">{error || 'Service not found'}</p>
        <Link to="/services" className="text-[#FF9900] hover:text-[#FEBD69] no-underline text-sm">
          &larr; Back to Services
        </Link>
      </div>
    );
  }

  const isFree = Number(service.price_usdc) === 0;
  const isNative = service.url?.startsWith('https://x402-api.onrender.com');
  const codeSnippet = getCodeSnippet(service, activeTab);

  const CODE_TABS: { key: CodeTab; label: string }[] = [
    { key: 'curl', label: 'cURL' },
    { key: 'javascript', label: 'JavaScript' },
    { key: 'python', label: 'Python' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* ── BREADCRUMB ── */}
      <nav aria-label="Breadcrumb" className="mb-5">
        <ol className="flex items-center flex-wrap gap-1 text-xs text-gray-500" role="list">
          <li>
            <Link to="/" className="hover:text-[#FF9900] no-underline transition-colors duration-150">Home</Link>
          </li>
          <li aria-hidden="true" className="mx-0.5">
            <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </li>
          <li>
            <Link to="/services" className="hover:text-[#FF9900] no-underline transition-colors duration-150">Services</Link>
          </li>
          {service.tags?.[0] && (
            <>
              <li aria-hidden="true" className="mx-0.5">
                <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </li>
              <li>
                <Link to={`/services?cat=${service.tags[0]}`} className="hover:text-[#FF9900] no-underline transition-colors duration-150 capitalize">
                  {service.tags[0]}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true" className="mx-0.5">
            <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </li>
          <li aria-current="page" className="text-gray-300 truncate max-w-[180px] font-medium">{service.name}</li>
        </ol>
      </nav>

      {/* ── 1. HEADER ── */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            {/* Name + badges */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-white">{service.name}</h1>
              {isNative && (
                <span className="text-xs bg-[#FF9900]/10 text-[#FF9900] px-2 py-0.5 rounded border border-[#FF9900]/20">
                  Native
                </span>
              )}
              {service.verified_status === 'mainnet_verified' && (
                <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
              {service.verified_status === 'reachable' && (
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                  Auto-tested
                </span>
              )}
            </div>

            {/* Star rating summary (inline in header) */}
            {stats && stats.count > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={stats.average} size="sm" />
                <span className="text-xs text-gray-400">
                  {stats.average} ({stats.count} {t.reviews.title.toLowerCase()})
                </span>
              </div>
            )}

            <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
          </div>

          {/* Price + prominent Try it CTA */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            <span className={`font-mono text-sm font-bold px-3 py-1.5 rounded-lg ${
              isFree
                ? 'bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20'
                : 'bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20'
            }`}>
              {isFree ? 'Free' : `$${service.price_usdc} USDC`}
            </span>

            <Link
              to={`/playground?api=${encodeURIComponent(service.name)}`}
              className="inline-flex items-center gap-2 gradient-btn text-white font-bold px-5 py-2.5 rounded-xl
                         text-sm no-underline transition-all duration-200 hover:brightness-110 hover:scale-[1.02]
                         shadow-[0_0_20px_rgba(255,153,0,0.30)]"
              aria-label={`Try ${service.name} in the playground`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
              Try it now
            </Link>
          </div>
        </div>

        {/* Tags — clickable links to category filter */}
        {service.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {service.tags.map(tag => (
              <Link
                key={tag}
                to={`/services?cat=${tag}`}
                className="text-xs text-gray-500 bg-white/5 hover:bg-white/8 hover:text-gray-300
                           px-2 py-0.5 rounded-lg no-underline transition-colors duration-150 capitalize"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── 2. ACTIONS ── */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link
          to={`/playground?api=${encodeURIComponent(service.name)}`}
          className="inline-flex items-center gap-2 bg-[#FF9900] hover:bg-[#FFa500] text-black font-bold
                     px-5 py-2.5 rounded-lg text-sm transition-all duration-200 no-underline
                     hover:shadow-[0_0_16px_rgba(255,153,0,0.4)]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Try in Playground
        </Link>

        {service.url && (
          <button
            onClick={handleCopyUrl}
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10
                       text-gray-300 hover:text-white font-medium px-5 py-2.5 rounded-lg text-sm
                       transition-colors duration-200 cursor-pointer"
            aria-label={urlCopied ? 'URL copied to clipboard' : 'Copy API URL to clipboard'}
          >
            {urlCopied ? (
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
            <span className={urlCopied ? 'text-emerald-400' : ''}>{urlCopied ? 'Copied!' : 'Copy URL'}</span>
          </button>
        )}

        {service.url && (
          <a
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10
                       text-gray-300 hover:text-white font-medium px-5 py-2.5 rounded-lg text-sm
                       transition-colors duration-200 no-underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View API
          </a>
        )}
      </div>

      {/* ── 3. QUICK START ── */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden mb-6">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/8">
          <svg className="w-4 h-4 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <h2 className="text-sm font-semibold text-white">Quick Start</h2>

          {/* Tab buttons */}
          <div className="flex gap-1 ml-auto" role="tablist" aria-label="Code language selector">
            {CODE_TABS.map(tab => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer border-none ${
                  activeTab === tab.key
                    ? 'bg-[#FF9900]/15 text-[#FF9900]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative" role="tabpanel">
          <CopyButton text={codeSnippet} label="Copy" copiedLabel="Copied!" />
          <pre className="p-5 text-xs leading-relaxed overflow-x-auto font-mono text-green-400 bg-black/30 max-h-[340px] overflow-y-auto">
            {codeSnippet}
          </pre>
        </div>
      </div>

      {/* ── 4. PAYMENT INFO ── */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-[#FF9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Payment Info
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-gray-500 block mb-1">Price</span>
            <span className={`font-mono font-bold ${isFree ? 'text-[#34D399]' : 'text-[#FF9900]'}`}>
              {isFree ? 'Free' : `$${service.price_usdc} USDC`}
            </span>
          </div>

          <div>
            <span className="text-xs text-gray-500 block mb-1">Chain</span>
            <span className="text-white font-medium">Base (USDC)</span>
          </div>

          <div>
            <span className="text-xs text-gray-500 block mb-1">Owner</span>
            <span className="font-mono text-gray-300 text-xs">
              {service.owner_address?.slice(0, 6)}...{service.owner_address?.slice(-4)}
            </span>
          </div>

          <div>
            <span className="text-xs text-gray-500 block mb-1">Protocol</span>
            <span className="text-gray-300">HTTP 402 / x402</span>
          </div>
        </div>

        {/* On-chain verification */}
        {service.tx_hash && /^0x[a-fA-F0-9]{64}$/.test(service.tx_hash) && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <a
              href={`https://basescan.org/tx/${service.tx_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#FF9900] hover:text-[#FEBD69] no-underline"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verified on-chain (Basescan) &rarr;
            </a>
          </div>
        )}
      </div>

      {/* ── 5. REVIEWS ── */}
      <section aria-labelledby="reviews-heading">

        {/* Rating distribution */}
        {stats && stats.count > 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 mb-4">
            <div className="flex items-center gap-6 flex-wrap">
              {/* Average score */}
              <div className="text-center shrink-0" aria-label={`Average rating: ${stats.average} out of 5`}>
                <div className="text-4xl font-bold text-white">{stats.average}</div>
                <StarRating rating={stats.average} size="md" />
                <div className="text-xs text-gray-500 mt-1">{stats.count} {t.reviews.title.toLowerCase()}</div>
              </div>
              {/* Distribution bars */}
              <div className="flex-1 min-w-[150px] flex flex-col gap-1.5" aria-label="Rating distribution">
                {[5, 4, 3, 2, 1].map(star => (
                  <DistributionBar
                    key={star}
                    star={star}
                    count={stats.distribution[String(star)] || 0}
                    total={stats.count}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Review form */}
        <div className="mb-6">
          <ReviewForm serviceId={service.id} onSuccess={handleReviewSuccess} />
        </div>

        {/* Reviews list heading */}
        <h2 id="reviews-heading" className="text-lg font-semibold text-white mb-4">
          {t.reviews.title}
          {stats && stats.count > 0 && (
            <span className="text-sm text-gray-500 font-normal ml-2">({stats.count})</span>
          )}
        </h2>

        {/* Reviews list */}
        {loadingReviews ? (
          <div className="text-center py-8" role="status" aria-label="Loading reviews">
            <div className="w-6 h-6 border-2 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin mx-auto" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center text-sm text-gray-500">
            {t.reviews.noReviews}
          </div>
        ) : (
          <>
            <div
              className={`flex flex-col gap-3 transition-opacity duration-200 ${fetchingReviews ? 'opacity-60' : 'opacity-100'}`}
              aria-live="polite"
              aria-busy={fetchingReviews}
            >
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            <Pagination
              page={reviewPage}
              totalPages={totalPages}
              onPageChange={(p) => {
                setReviewPage(p);
                // Scroll to top of reviews section smoothly
                document.getElementById('reviews-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            />
          </>
        )}
      </section>
    </div>
  );
}
