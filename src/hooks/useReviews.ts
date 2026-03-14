import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../config';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  wallet_address: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ReviewsPage {
  success: boolean;
  count: number;
  page: number;
  limit: number;
  data: Review[];
}

export interface ReviewStats {
  average: number;
  count: number;
  distribution: Record<string, number>;
}

export interface SubmitReviewPayload {
  service_id: string;
  rating: number;
  comment?: string;
  walletAddress: string;
}

// ── Fetchers ───────────────────────────────────────────────────────────────────

async function fetchReviews(serviceId: string, page: number, limit: number): Promise<ReviewsPage> {
  const res = await fetch(
    `${API_URL}/api/reviews/${serviceId}?page=${page}&limit=${limit}`,
  );
  if (!res.ok) throw new Error(`Failed to fetch reviews (${res.status})`);
  return res.json();
}

async function fetchReviewStats(serviceId: string): Promise<ReviewStats> {
  const res = await fetch(`${API_URL}/api/reviews/${serviceId}/stats`);
  if (!res.ok) throw new Error(`Failed to fetch review stats (${res.status})`);
  return res.json();
}

async function submitReview(payload: SubmitReviewPayload): Promise<void> {
  const { service_id, rating, comment, walletAddress } = payload;
  const res = await fetch(`${API_URL}/api/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Wallet-Address': walletAddress,
    },
    body: JSON.stringify({
      service_id,
      rating,
      comment: comment?.trim() || undefined,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to submit review');
  }
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 5;

/**
 * Fetch paginated reviews for a service.
 * @param serviceId — UUID of the service
 * @param page      — 1-based page number (default: 1)
 */
export function useReviews(serviceId: string | undefined, page = 1) {
  return useQuery<ReviewsPage>({
    queryKey: ['reviews', serviceId, page],
    queryFn: () => fetchReviews(serviceId!, page, PAGE_SIZE),
    enabled: !!serviceId,
    staleTime: 60 * 1000, // 1 minute
    placeholderData: (prev) => prev,
  });
}

/**
 * Fetch aggregate review stats (average, count, distribution) for a service.
 * @param serviceId — UUID of the service
 */
export function useReviewStats(serviceId: string | undefined) {
  return useQuery<ReviewStats>({
    queryKey: ['reviewStats', serviceId],
    queryFn: () => fetchReviewStats(serviceId!),
    enabled: !!serviceId,
    staleTime: 60 * 1000,
  });
}

// Réponse du endpoint batch : pas de `distribution` (champ optionnel)
type BatchStatsResponse = Record<string, { average: number; count: number }>;

async function fetchBatchReviewStats(ids: string[]): Promise<BatchStatsResponse> {
  const res = await fetch(
    `${API_URL}/api/reviews/stats/batch?ids=${ids.join(',')}`,
  );
  if (!res.ok) throw new Error(`Failed to fetch batch review stats (${res.status})`);
  return res.json();
}

/**
 * Fetch review stats for multiple services via a single batch request.
 * Une seule requête vers `/api/reviews/stats/batch?ids=id1,id2,...`
 * L'API retourne `{ [service_id]: { average, count } }`.
 *
 * @param serviceIds — array of service UUIDs
 * @returns Map<serviceId, ReviewStats>
 */
export function useAllReviewStats(serviceIds: string[]): Map<string, ReviewStats> {
  const key = serviceIds.join(',');

  const { data } = useQuery<BatchStatsResponse>({
    queryKey: ['reviewStatsBatch', key],
    queryFn: () => fetchBatchReviewStats(serviceIds),
    enabled: serviceIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes — le catalogue tolère des données légèrement périmées
  });

  const map = new Map<string, ReviewStats>();
  if (data) {
    for (const [id, stats] of Object.entries(data)) {
      if (stats.count > 0) {
        map.set(id, {
          average: stats.average,
          count: stats.count,
          distribution: {},
        });
      }
    }
  }
  return map;
}

/**
 * Mutation hook to submit a review.
 * Invalidates both reviews and reviewStats queries on success.
 */
export function useSubmitReview(serviceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, SubmitReviewPayload>({
    mutationFn: submitReview,
    onSuccess: () => {
      // Invalidate all pages for this service + stats
      queryClient.invalidateQueries({ queryKey: ['reviews', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['reviewStats', serviceId] });
    },
  });
}
