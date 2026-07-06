/**
 * Services provider — hydrates app data and exposes { data, services, refresh }.
 * After every service action, call refresh() (or use `act`) to re-snapshot.
 * Adapter selection: local (default) vs supabase via EXPO_PUBLIC_DATA_PROVIDER.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppData, AppServices, EMPTY_DATA } from '@/services/types';
import { LocalServices } from '@/services/local';

function makeServices(): AppServices {
  const provider = process.env.EXPO_PUBLIC_DATA_PROVIDER ?? 'local';
  if (provider === 'supabase') {
    // Lazy require so the prototype never pays for it.
    const { SupabaseServices } = require('@/services/supabase') as {
      SupabaseServices: new () => AppServices;
    };
    return new SupabaseServices();
  }
  return new LocalServices();
}

interface Ctx {
  hydrated: boolean;
  /** Initial data load failed (e.g. network) — splash offers retry. */
  hydrationFailed: boolean;
  data: AppData;
  services: AppServices;
  refresh: () => Promise<void>;
  /**
   * Run a service action then refresh the snapshot.
   * Returns false (and surfaces a banner) on failure — callers that navigate
   * afterwards MUST check the result so users never advance past a lost write.
   */
  act: (fn: (s: AppServices) => Promise<void>) => Promise<boolean>;
  /** Last surfaced error message, shown by the global banner. */
  error: string | null;
  clearError: () => void;
  retryHydration: () => Promise<void>;
}

const ServicesContext = createContext<Ctx | null>(null);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const services = useMemo(makeServices, []);
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [hydrated, setHydrated] = useState(false);
  const [hydrationFailed, setHydrationFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setData(await services.loadAll());
  }, [services]);

  const hydrate = useCallback(async () => {
    try {
      setData(await services.loadAll());
      setHydrationFailed(false);
    } catch {
      // Never silently show a first-run state to an existing user.
      setHydrationFailed(true);
    } finally {
      setHydrated(true);
    }
  }, [services]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const act = useCallback(
    async (fn: (s: AppServices) => Promise<void>): Promise<boolean> => {
      try {
        await fn(services);
        await refresh();
        return true;
      } catch (e) {
        setError(
          e instanceof Error && e.message
            ? e.message
            : 'Something went wrong. Your last change may not have saved, please try again.',
        );
        return false;
      }
    },
    [services, refresh],
  );

  const clearError = useCallback(() => setError(null), []);
  const retryHydration = useCallback(async () => {
    setHydrated(false);
    await hydrate();
  }, [hydrate]);

  const value = useMemo(
    () => ({
      hydrated,
      hydrationFailed,
      data,
      services,
      refresh,
      act,
      error,
      clearError,
      retryHydration,
    }),
    [hydrated, hydrationFailed, data, services, refresh, act, error, clearError, retryHydration],
  );

  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error('useApp must be used inside ServicesProvider');
  return ctx;
}
