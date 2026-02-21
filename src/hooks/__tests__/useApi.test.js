import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApi } from '../useApi';

// Mock the config module
vi.mock('../../config', () => ({
  API_URL: 'http://localhost:3000',
}));

describe('useApi', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start with loading false, error null, and data null', () => {
    const { result } = renderHook(() => useApi());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
  });

  it('should set loading to true during execute', async () => {
    let resolvePromise;
    globalThis.fetch.mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve; })
    );

    const { result } = renderHook(() => useApi());

    let executePromise;
    act(() => {
      executePromise = result.current.execute('/api/test').catch(() => {});
    });

    // Loading should be true while waiting
    expect(result.current.loading).toBe(true);

    // Resolve the fetch
    await act(async () => {
      resolvePromise({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
      await executePromise;
    });

    expect(result.current.loading).toBe(false);
  });

  it('should return data on successful fetch', async () => {
    const mockData = { id: 1, name: 'Test Service' };
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() => useApi());

    await act(async () => {
      const returnedData = await result.current.execute('/api/test');
      expect(returnedData).toEqual(mockData);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should build URL from API_URL when endpoint is relative', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useApi());

    await act(async () => {
      await result.current.execute('/api/services');
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/services',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('should use absolute URL directly when endpoint starts with http', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useApi());

    await act(async () => {
      await result.current.execute('https://external.api.com/data');
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://external.api.com/data',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('should handle network errors', async () => {
    globalThis.fetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useApi());

    await act(async () => {
      try {
        await result.current.execute('/api/test');
      } catch (err) {
        expect(err.message).toBe('Network error');
      }
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
  });

  it('should handle non-ok response with error body', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Bad Request' }),
    });

    const { result } = renderHook(() => useApi());

    await act(async () => {
      try {
        await result.current.execute('/api/test');
      } catch (err) {
        expect(err.message).toBe('Bad Request');
      }
    });

    expect(result.current.error).toBe('Bad Request');
    expect(result.current.loading).toBe(false);
  });

  it('should handle non-ok response with message body', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Internal Server Error' }),
    });

    const { result } = renderHook(() => useApi());

    await act(async () => {
      try {
        await result.current.execute('/api/test');
      } catch (err) {
        expect(err.message).toBe('Internal Server Error');
      }
    });

    expect(result.current.error).toBe('Internal Server Error');
  });

  it('should handle non-ok response when JSON parsing fails', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.reject(new Error('not JSON')),
    });

    const { result } = renderHook(() => useApi());

    await act(async () => {
      try {
        await result.current.execute('/api/test');
      } catch (err) {
        expect(err.message).toBe('Request failed (502)');
      }
    });

    expect(result.current.error).toBe('Request failed (502)');
  });

  it('should abort on unmount', async () => {
    let _resolvePromise;
    globalThis.fetch.mockImplementation(
      () => new Promise((resolve) => { _resolvePromise = resolve; })
    );

    const { result, unmount } = renderHook(() => useApi());

    act(() => {
      result.current.execute('/api/test').catch(() => {});
    });

    // Unmount should trigger abort
    unmount();

    // The abort controller should have been triggered
    // We verify by checking fetch was called with an AbortSignal
    const signal = globalThis.fetch.mock.calls[0][1].signal;
    expect(signal.aborted).toBe(true);
  });

  it('should reset state when reset is called', async () => {
    const mockData = { id: 1 };
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() => useApi());

    // First execute to set data
    await act(async () => {
      await result.current.execute('/api/test');
    });

    expect(result.current.data).toEqual(mockData);

    // Now reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
  });
});
