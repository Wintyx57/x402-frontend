import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
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

/**
 * Fetch review stats for multiple services at once.
 * Uses useQueries to run fetches in parallel. Results are keyed by serviceId.
 * Only fetches if serviceIds array is non-empty.
 *
 * @param serviceIds — array of service UUIDs
 * @returns Map<serviceId, ReviewStats>
 */
export function useAllReviewStats(serviceIds: string[]): Map<string, ReviewStats> {
  const results = useQueries({
    queries: serviceIds.map((id) => ({
      queryKey: ['reviewStats', id],
      queryFn: () => fetchReviewStats(id),
      staleTime: 5 * 60 * 1000, // 5 minutes — catalogue page can tolerate slightly stale data
      // Only fetch services with actual reviews to avoid N×empty requests on first load.
      // We fetch all for correctness; TanStack Query deduplicates and caches automatically.
      enabled: true,
    })),
  });

  const map = new Map<string, ReviewStats>();
  serviceIds.forEach((id, i) => {
    const result = results[i];
    if (result.data && result.data.count > 0) {
      map.set(id, result.data);
    }
  });
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
