'use client';
import { useState, useCallback } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(initialData: T | null = null) {
  const [state, setState] = useState<FetchState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const request = useCallback(async (url: string, options?: RequestInit) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setState({ data: null, loading: false, error: json.message || 'Terjadi kesalahan' });
        return { success: false, data: null, message: json.message };
      }
      setState({ data: json.data, loading: false, error: null });
      return { success: true, data: json.data, message: json.message };
    } catch (err) {
      const msg = 'Koneksi gagal. Periksa internet kamu.';
      setState({ data: null, loading: false, error: msg });
      return { success: false, data: null, message: msg };
    }
  }, []);

  const get = useCallback((url: string) => request(url), [request]);
  const post = useCallback((url: string, body: unknown) =>
    request(url, { method: 'POST', body: JSON.stringify(body) }), [request]);
  const put = useCallback((url: string, body: unknown) =>
    request(url, { method: 'PUT', body: JSON.stringify(body) }), [request]);
  const del = useCallback((url: string) =>
    request(url, { method: 'DELETE' }), [request]);
  const patch = useCallback((url: string, body?: unknown) =>
    request(url, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }), [request]);

  return { ...state, get, post, put, del, patch };
}
