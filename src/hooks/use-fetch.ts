'use client';

import { useState, useEffect, useCallback } from 'react';

export function useFetch<T>(url: string | null, deps: any[] = []): { data: T | null; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const refetch = useCallback(() => setRefetchKey((k) => k + 1), []);

  const depKey = JSON.stringify({ url, deps, refetchKey });

  const doFetch = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error('Request failed');
      const d = await r.json();
      setData(d);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [url, depKey, setLoading, setData, setError]);

  useEffect(() => {
    doFetch();
  }, [doFetch]);

  return { data, loading, error, refetch };
}
