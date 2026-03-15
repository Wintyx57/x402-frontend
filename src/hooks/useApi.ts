import { useState, useCallback, useRef, useEffect } from 'react';
import { API_URL } from '../config';

interface UseApiReturn<T = unknown> {
  execute: (endpoint: string, options?: RequestInit & { timeout?: number }) => Promise<T>;
  loading: boolean;
  error: string | null;
  data: T | null;
  reset: () => void;
}

/**
 * Custom hook for API calls with loading, error, retry, and abort controller.
 * Use for mutations and one-off fetches. For cached GET requests, prefer React Query hooks.
 */
export function useApi<T = unknown>(): UseApiReturn<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(async (endpoint: string, options: RequestInit & { timeout?: number } = {}): Promise<T> => {
    // Abort any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const { timeout = 15000, ...fetchOptions } = options;

    setLoading(true);
    setError(null);

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
      const res = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.message || `Request failed (${res.status})`);
      }

      const result: T = await res.json();
      setData(result);
      setLoading(false);
      return result;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      }
      setLoading(false);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { execute, loading, error, data, reset };
}
