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
  data: AppData;
  services: AppServices;
  refresh: () => Promise<void>;
  /** Run a service action then refresh the snapshot. */
  act: (fn: (s: AppServices) => Promise<void>) => Promise<void>;
}

const ServicesContext = createContext<Ctx | null>(null);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const services = useMemo(makeServices, []);
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    setData(await services.loadAll());
  }, [services]);

  useEffect(() => {
    let cancelled = false;
    services
      .loadAll()
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setHydrated(true);
        }
      })
      .catch(() => setHydrated(true));
    return () => {
      cancelled = true;
    };
  }, [services]);

  const act = useCallback(
    async (fn: (s: AppServices) => Promise<void>) => {
      await fn(services);
      await refresh();
    },
    [services, refresh],
  );

  const value = useMemo(
    () => ({ hydrated, data, services, refresh, act }),
    [hydrated, data, services, refresh, act],
  );

  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error('useApp must be used inside ServicesProvider');
  return ctx;
}
