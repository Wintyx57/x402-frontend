import { useState, useCallback } from "react";

const STORAGE_KEY = "x402-simple-mode";
export const SKALE_CHAIN_ID = 1187947933;

function persist(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    /* private browsing — silently ignore */
  }
}

/**
 * Simple mode hides crypto jargon and auto-selects SKALE.
 * Advanced mode shows full blockchain UI.
 * Defaults to Simple for mainstream adoption.
 */
export function useSimpleMode() {
  const [isSimple, setIsSimple] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === null ? true : stored === "true";
    } catch {
      return true;
    }
  });

  const toggle = useCallback(() => {
    setIsSimple((prev) => {
      const next = !prev;
      persist(next);
      return next;
    });
  }, []);

  const setMode = useCallback((simple: boolean) => {
    persist(simple);
    setIsSimple(simple);
  }, []);

  return { isSimple, toggle, setMode, SKALE_CHAIN_ID };
}
