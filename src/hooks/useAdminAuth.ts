import { useState, useCallback } from 'react';
import { API_URL } from '../config';
import { ADMIN_STORAGE_KEY as STORAGE_KEY } from '../constants/admin';

interface AdminAuthReturn {
  token: string | null;
  showLogin: boolean;
  login: (token: string) => void;
  logout: () => void;
  adminFetch: <T = unknown>(path: string, options?: RequestInit) => Promise<T>;
}

export function useAdminAuth(): AdminAuthReturn {
  const [token, setToken] = useState<string | null>(
    () => sessionStorage.getItem(STORAGE_KEY)
  );
  const [showLogin, setShowLogin] = useState(!sessionStorage.getItem(STORAGE_KEY));

  const login = useCallback((t: string) => {
    sessionStorage.setItem(STORAGE_KEY, t);
    setToken(t);
    setShowLogin(false);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setShowLogin(true);
  }, []);

  const adminFetch = useCallback(async <T = unknown>(path: string, options?: RequestInit): Promise<T> => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const url = `${API_URL}/admin/community-agent${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': stored || '',
        ...(options?.headers || {}),
      },
    });
    if (res.status === 401 || res.status === 403) {
      sessionStorage.removeItem(STORAGE_KEY);
      setToken(null);
      setShowLogin(true);
      throw new Error('Unauthorized');
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || body.message || `Request failed (${res.status})`);
    }
    return res.json() as Promise<T>;
  }, []);

  return { token, showLogin, login, logout, adminFetch };
}
