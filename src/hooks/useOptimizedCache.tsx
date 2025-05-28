
import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '@/utils/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheOptions {
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
  enablePersistence?: boolean;
}

const DEFAULT_OPTIONS: Required<CacheOptions> = {
  maxSize: 100,
  ttl: 5 * 60 * 1000, // 5 minutes
  enablePersistence: true,
};

export function useOptimizedCache<T>(
  cacheKey: string,
  options: CacheOptions = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [cache] = useState(new Map<string, CacheEntry<T>>());
  const dbRef = useRef<IDBDatabase | null>(null);
  const initialized = useRef(false);

  // Initialize IndexedDB
  useEffect(() => {
    if (!opts.enablePersistence || initialized.current) return;

    const initDB = async () => {
      try {
        const request = indexedDB.open(`cache_${cacheKey}`, 1);
        
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('entries')) {
            db.createObjectStore('entries', { keyPath: 'key' });
          }
        };

        request.onsuccess = () => {
          dbRef.current = request.result;
          loadFromIndexedDB();
        };
      } catch (error) {
        logger.warn('IndexedDB initialization failed', { error });
      }
    };

    initDB();
    initialized.current = true;
  }, [cacheKey, opts.enablePersistence]);

  const loadFromIndexedDB = useCallback(async () => {
    if (!dbRef.current) return;

    try {
      const transaction = dbRef.current.transaction(['entries'], 'readonly');
      const store = transaction.objectStore('entries');
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result;
        const now = Date.now();

        entries.forEach(({ key, ...entry }) => {
          if (now - entry.timestamp < opts.ttl) {
            cache.set(key, entry);
          }
        });
      };
    } catch (error) {
      logger.warn('Failed to load from IndexedDB', { error });
    }
  }, [cache, opts.ttl]);

  const saveToIndexedDB = useCallback(async (key: string, entry: CacheEntry<T>) => {
    if (!dbRef.current || !opts.enablePersistence) return;

    try {
      const transaction = dbRef.current.transaction(['entries'], 'readwrite');
      const store = transaction.objectStore('entries');
      store.put({ key, ...entry });
    } catch (error) {
      logger.warn('Failed to save to IndexedDB', { error });
    }
  }, [opts.enablePersistence]);

  const evictLRU = useCallback(() => {
    if (cache.size <= opts.maxSize) return;

    // Find least recently used entry
    let lruKey = '';
    let oldestAccess = Date.now();

    for (const [key, entry] of cache.entries()) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      cache.delete(lruKey);
      logger.debug('Evicted LRU cache entry', { key: lruKey });
    }
  }, [cache, opts.maxSize]);

  const get = useCallback((key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > opts.ttl) {
      cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.lastAccessed = now;
    entry.accessCount++;
    cache.set(key, entry);

    return entry.data;
  }, [cache, opts.ttl]);

  const set = useCallback((key: string, data: T): void => {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now,
    };

    cache.set(key, entry);
    evictLRU();
    saveToIndexedDB(key, entry);
  }, [cache, evictLRU, saveToIndexedDB]);

  const invalidate = useCallback((key?: string): void => {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  }, [cache]);

  const getStats = useCallback(() => ({
    size: cache.size,
    maxSize: opts.maxSize,
    hitRate: Array.from(cache.values()).reduce((sum, entry) => sum + entry.accessCount, 0) / cache.size || 0,
  }), [cache, opts.maxSize]);

  return {
    get,
    set,
    invalidate,
    getStats,
  };
}
