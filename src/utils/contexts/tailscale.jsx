import { createContext, useCallback, useMemo, useState, useSyncExternalStore } from "react";

// Kept stable so browsers that used the old custom.js toggle keep their setting.
const STORAGE_KEY = "homepage-use-tailscale-links";

function getStoredUseTailscale() {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEY) === "true";
  }
  return false;
}

function subscribeToStoredUseTailscale(onStoreChange) {
  const handleStorage = (event) => {
    if (event.key === STORAGE_KEY) onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

export const TailscaleContext = createContext();

export function TailscaleProvider({ initialUseTailscale, children }) {
  // The server snapshot is false because this value ends up in rendered hrefs:
  // the first client render must match the prerendered HTML, and the stored
  // preference is only adopted once hydration is done.
  const storedUseTailscale = useSyncExternalStore(subscribeToStoredUseTailscale, getStoredUseTailscale, () => false);
  const [override, setOverride] = useState(initialUseTailscale);
  const useTailscale = override ?? storedUseTailscale;

  const setUseTailscale = useCallback((next) => {
    setOverride(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }, []);

  const value = useMemo(() => ({ useTailscale, setUseTailscale }), [useTailscale, setUseTailscale]);

  return <TailscaleContext.Provider value={value}>{children}</TailscaleContext.Provider>;
}
