
import { useState, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useCacheManager<T>() {
  const [cache] = useState(new Map<string, CacheEntry<T>>());

  const isValidCacheEntry = useCallback((entry: CacheEntry<T> | undefined): boolean => {
    if (!entry) return false;
    return Date.now() - entry.timestamp < CACHE_DURATION;
  }, []);

  const getCacheEntry = useCallback((key: string): T | null => {
    const cachedEntry = cache.get(key);
    if (isValidCacheEntry(cachedEntry)) {
      return cachedEntry!.data;
    }
    return null;
  }, [cache, isValidCacheEntry]);

  const setCacheEntry = useCallback((key: string, data: T): void => {
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }, [cache]);

  const invalidateCache = useCallback((key?: string): void => {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  }, [cache]);

  return {
    getCacheEntry,
    setCacheEntry,
    invalidateCache,
  };
}
