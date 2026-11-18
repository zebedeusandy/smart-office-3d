import { useCallback, useEffect, useState } from "react";
import { officeService } from "@/services/office-service";
import type { DashboardSnapshot, OfficeSnapshot } from "@/types/office";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useServiceQuery = <T,>(
  load: () => Promise<T>,
  cache: { current: T | null },
) => {
  const [state, setState] = useState<AsyncState<T>>(() =>
    cache.current
      ? { data: cache.current, loading: false, error: null }
      : { data: null, loading: true, error: null },
  );
  const [request, setRequest] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (request === 0 && cache.current) {
      setState({ data: cache.current, loading: false, error: null });
      return;
    }

    setState((previous) => ({
      data: previous.data,
      loading: true,
      error: null,
    }));

    load()
      .then((result) => {
        cache.current = result;
        if (!cancelled) {
          setState({ data: result, loading: false, error: null });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState((previous) => ({
            data: previous.data,
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "The office service did not respond.",
          }));
        }
      });

    return () => {
      cancelled = true;
    };
    // `load` and `cache` are module-level singletons.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  const reload = useCallback(() => setRequest((value) => value + 1), []);

  return { ...state, reload };
};

const snapshotCache: { current: OfficeSnapshot | null } = { current: null };
const dashboardCache: { current: DashboardSnapshot | null } = { current: null };

export function useOfficeSnapshot() {
  return useServiceQuery(officeService.fetchSnapshot, snapshotCache);
}

export function useDashboardData() {
  return useServiceQuery(officeService.fetchDashboard, dashboardCache);
}
