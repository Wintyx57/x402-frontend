import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_URL } from '../config';
import { useTranslation } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';

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

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loadingService, setLoadingService] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useSEO({
    title: service ? `${service.name} — x402 Bazaar` : 'Service — x402 Bazaar',
    description: service?.description || 'Service detail on x402 Bazaar marketplace.',
  });

  useEffect(() => {
    if (!id) return;

    // Reset state for new ID
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setService(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingService(true);

    fetch(`${API_URL}/api/services`)
      .then(r => r.json())
      .then((data: Service[]) => {
        const found = data.find(s => s.id === id);
        if (!found) { setError('Service not found'); return; }
        setService(found);
      })
      .catch(() => setError('Failed to load service'))
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReviews();
  }, [id]); // loadReviews depends on id, so call when id changes

  if (loadingService) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 mb-4">{error || 'Service not found'}</p>
        <Link to="/services" className="text-[#FF9900] hover:text-[#FEBD69] no-underline text-sm">
          &larr; Back to Services
        </Link>
      </div>
    );
  }

  const isFree = Number(service.price_usdc) === 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Back */}
      <Link to="/services" className="text-xs text-gray-500 hover:text-[#FF9900] no-underline mb-6 block">
        &larr; Back to Services
      </Link>

      {/* Service header */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{service.name}</h1>
            {stats && stats.count > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={stats.average} size="sm" />
                <span className="text-xs text-gray-400">{stats.average} ({stats.count} {t.reviews.title.toLowerCase()})</span>
              </div>
            )}
            <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
          </div>
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

        {/* Meta */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 text-xs text-gray-600">
          <span>By <span className="font-mono">{service.owner_address?.slice(0, 6)}...{service.owner_address?.slice(-4)}</span></span>
          {service.tx_hash && /^0x[a-fA-F0-9]{64}$/.test(service.tx_hash) && (
            <a
              href={`https://basescan.org/tx/${service.tx_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF9900] no-underline hover:text-[#FEBD69]"
            >
              Verified on-chain &rarr;
            </a>
          )}
          {service.url && (
            <a
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF9900] no-underline hover:text-[#FEBD69]"
            >
              View API &rarr;
            </a>
          )}
        </div>
      </div>

      {/* Rating distribution */}
      {stats && stats.count > 0 && (
        <div className="glass-card rounded-xl p-5 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{stats.average}</div>
              <StarRating rating={stats.average} size="md" />
              <div className="text-xs text-gray-500 mt-1">{stats.count} reviews</div>
            </div>
            <div className="flex-1 min-w-[150px] flex flex-col gap-1">
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
          <div className="glass-card rounded-xl p-8 text-center text-sm text-gray-500">
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
