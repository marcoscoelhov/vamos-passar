
import { useCallback, useRef } from 'react';
import { logger } from '@/utils/logger';

interface DebounceOptions {
  delay?: number;
  maxWait?: number;
  leading?: boolean;
  trailing?: boolean;
}

export function useOptimizedOperations() {
  const debounceTimers = useRef(new Map<string, NodeJS.Timeout>());
  const throttleLastCall = useRef(new Map<string, number>());

  const debounce = useCallback(<T extends (...args: any[]) => any>(
    key: string,
    func: T,
    options: DebounceOptions = {}
  ) => {
    const { delay = 300, leading = false, trailing = true } = options;

    return (...args: Parameters<T>) => {
      const existingTimer = debounceTimers.current.get(key);
      
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      if (leading && !existingTimer) {
        func(...args);
      }

      if (trailing) {
        const timer = setTimeout(() => {
          func(...args);
          debounceTimers.current.delete(key);
        }, delay);

        debounceTimers.current.set(key, timer);
      }
    };
  }, []);

  const throttle = useCallback(<T extends (...args: any[]) => any>(
    key: string,
    func: T,
    delay: number = 100
  ) => {
    return (...args: Parameters<T>) => {
      const now = Date.now();
      const lastCall = throttleLastCall.current.get(key) || 0;

      if (now - lastCall >= delay) {
        throttleLastCall.current.set(key, now);
        func(...args);
      }
    };
  }, []);

  const batchOperation = useCallback((
    operations: Array<() => Promise<any>>,
    batchSize: number = 3
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        const results = [];
        
        for (let i = 0; i < operations.length; i += batchSize) {
          const batch = operations.slice(i, i + batchSize);
          const batchResults = await Promise.all(batch.map(op => op()));
          results.push(...batchResults);
          
          // Small delay between batches to prevent overwhelming
          if (i + batchSize < operations.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
        
        resolve(results);
      } catch (error) {
        logger.error('Batch operation failed', { error });
        reject(error);
      }
    });
  }, []);

  const memoize = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ) => {
    const cache = new Map();
    
    return (...args: Parameters<T>): ReturnType<T> => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = func(...args);
      cache.set(key, result);
      
      // Prevent memory leaks by limiting cache size
      if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      
      return result;
    };
  }, []);

  return {
    debounce,
    throttle,
    batchOperation,
    memoize,
  };
}
