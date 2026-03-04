import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_URL } from '../config';
import { useTranslation } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
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

interface Review {
  id: string;
  wallet_address: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface ReviewStats {
  average: number;
  count: number;
  distribution: Record<string, number>;
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
  -H "X-Payment-TX: 0xYOUR_TX_HASH" \\
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
      "X-Payment-TX": txHash,
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
            "X-Payment-TX": tx_hash,
            "X-Payment-Chain": "base",
        },
    ).json()

    print(data)`;
  }

  return '';
}

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loadingService, setLoadingService] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CodeTab>('curl');
  const [urlCopied, setUrlCopied] = useState(false);

  useSEO({
    title: service ? `${service.name} — x402 Bazaar` : 'Service — x402 Bazaar',
    description: service?.description || 'Service detail on x402 Bazaar marketplace.',
  });

  useEffect(() => {
    if (!id) return;

    setService(null);
    setError(null);
    setLoadingService(true);

    // Try direct endpoint first, fall back to full list for compatibility
    fetch(`${API_URL}/api/services/${id}`)
      .then(async r => {
        if (r.status === 404 || r.status === 405) {
          // Fallback: scan the full catalogue
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

  const loadReviews = useCallback(() => {
    if (!id) return;
    setLoadingReviews(true);
    Promise.all([
      fetch(`${API_URL}/api/reviews/${id}`).then(r => r.json()),
      fetch(`${API_URL}/api/reviews/${id}/stats`).then(r => r.json()),
    ])
      .then(([reviewsData, statsData]) => {
        setReviews(reviewsData.data || []);
        setStats(statsData);
      })
      .catch(() => {})
      .finally(() => setLoadingReviews(false));
  }, [id]);

  useEffect(() => {
    loadReviews();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopyUrl = useCallback(async () => {
    if (!service?.url) return;
    try {
      await navigator.clipboard.writeText(service.url);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch {
      // Clipboard API may fail in insecure contexts
    }
  }, [service?.url]);

  if (loadingService) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin mx-auto" />
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
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Back link */}
      <Link to="/services" className="text-xs text-gray-500 hover:text-[#FF9900] no-underline mb-6 block">
        &larr; Back to Services
      </Link>

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
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                  Verified
                </span>
              )}
              {service.verified_status === 'reachable' && (
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                  Auto-tested
                </span>
              )}
            </div>

            {/* Star rating (if reviews exist) */}
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

          {/* Price badge */}
          <span className={`shrink-0 font-mono text-sm font-bold px-3 py-1.5 rounded-lg ${
            isFree
              ? 'bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20'
              : 'bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20'
          }`}>
            {isFree ? 'Free' : `$${service.price_usdc} USDC`}
          </span>
        </div>

        {/* Tags */}
        {service.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {service.tags.map(tag => (
              <span key={tag} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-lg">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* ── 2. ACTIONS ── */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link
          to={`/playground?api=${encodeURIComponent(service.name)}`}
          className="inline-flex items-center gap-2 bg-[#FF9900] hover:bg-[#FFa500] text-black font-bold px-5 py-2.5 rounded-lg text-sm transition-colors no-underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Try in Playground
        </Link>

        {service.url && (
          <button
            onClick={handleCopyUrl}
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {urlCopied ? 'Copied!' : 'Copy URL'}
          </button>
        )}

        {service.url && (
          <a
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors no-underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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
          <div className="flex gap-1 ml-auto">
            {CODE_TABS.map(tab => (
              <button
                key={tab.key}
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

        <div className="relative">
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

      {/* Rating distribution */}
      {stats && stats.count > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 mb-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{stats.average}</div>
              <StarRating rating={stats.average} size="md" />
              <div className="text-xs text-gray-500 mt-1">{stats.count} reviews</div>
            </div>
            <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
              {[5, 4, 3, 2, 1].map(star => {
                const count = stats.distribution[String(star)] || 0;
                const pct = stats.count > 0 ? Math.round((count / stats.count) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 w-3 text-right">{star}</span>
                    <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-[#FBBF24] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-gray-600 w-5 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Review form */}
      <div className="mb-6">
        <ReviewForm serviceId={service.id} onSuccess={loadReviews} />
      </div>

      {/* Reviews list */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          {t.reviews.title}
          {stats && stats.count > 0 && (
            <span className="text-sm text-gray-500 font-normal ml-2">({stats.count})</span>
          )}
        </h2>

        {loadingReviews ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin mx-auto" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center text-sm text-gray-500">
            {t.reviews.noReviews}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
