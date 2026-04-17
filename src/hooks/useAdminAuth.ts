import { useState, useCallback, useEffect } from "react";
import { API_URL } from "../config";
import { ADMIN_STORAGE_KEY as STORAGE_KEY } from "../constants/admin";

interface AdminAuthReturn {
  authenticated: boolean;
  showLogin: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  adminFetch: <T = unknown>(path: string, options?: RequestInit) => Promise<T>;
}

/**
 * Admin auth hook. Migrated from sessionStorage to an httpOnly cookie set by
 * the backend at POST /api/admin/session. The cookie is never accessible to
 * JavaScript (httpOnly + Secure + SameSite=Strict), so an XSS anywhere on the
 * frontend cannot exfiltrate the admin token — the previous sessionStorage
 * implementation did NOT protect against this.
 *
 * Back-compat: older browser sessions may still have a token in sessionStorage.
 * On mount we migrate it to a cookie then clear the storage slot.
 */
export function useAdminAuth(): AdminAuthReturn {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState(true);

  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(
        `${API_URL}/admin/community-agent/me`.replace(
          "/admin/community-agent/me",
          "/api/health",
        ),
        {
          method: "GET",
          credentials: "include",
        },
      );
      // A 200 on /api/health doesn't prove the admin cookie is valid; we use a
      // real protected ping below. Keep the open /api/health call lightweight.
      void res;
    } catch {
      /* ignore */
    }
    try {
      const probe = await fetch(`${API_URL}/admin/community-agent/settings`, {
        method: "GET",
        credentials: "include",
      });
      return probe.ok;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Migrate legacy sessionStorage token to a cookie, then drop it.
      const legacy = sessionStorage.getItem(STORAGE_KEY);
      if (legacy) {
        try {
          await fetch(`${API_URL}/api/admin/session`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: legacy }),
          });
        } catch {
          /* ignore, fall through to probe */
        } finally {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      }
      const ok = await checkSession();
      if (!cancelled) {
        setAuthenticated(ok);
        setShowLogin(!ok);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [checkSession]);

  const login = useCallback(async (token: string) => {
    const res = await fetch(`${API_URL}/api/admin/session`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) {
      throw new Error("Invalid admin token");
    }
    setAuthenticated(true);
    setShowLogin(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/admin/session`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      /* ignore — still force local state */
    }
    setAuthenticated(false);
    setShowLogin(true);
  }, []);

  const adminFetch = useCallback(
    async <T = unknown>(path: string, options?: RequestInit): Promise<T> => {
      const url = `${API_URL}/admin/community-agent${path}`;
      const res = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(options?.headers || {}),
        },
      });
      if (res.status === 401 || res.status === 403) {
        setAuthenticated(false);
        setShowLogin(true);
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error || body.message || `Request failed (${res.status})`,
        );
      }
      return res.json() as Promise<T>;
    },
    [],
  );

  return { authenticated, showLogin, login, logout, adminFetch };
}
