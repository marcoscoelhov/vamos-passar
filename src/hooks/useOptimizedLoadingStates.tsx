
import { useState, useCallback, useMemo } from 'react';

interface LoadingStates {
  [key: string]: boolean;
}

export function useOptimizedLoadingStates(initialStates: LoadingStates = {}) {
  const [loadingStates, setLoadingStates] = useState<LoadingStates>(initialStates);

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => {
      if (prev[key] === isLoading) return prev; // Evita re-render desnecessário
      return {
        ...prev,
        [key]: isLoading
      };
    });
  }, []);

  const isLoading = useCallback((key: string): boolean => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useMemo((): boolean => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  const loadingKeys = useMemo((): string[] => {
    return Object.keys(loadingStates).filter(key => loadingStates[key]);
  }, [loadingStates]);

  const resetAll = useCallback(() => {
    setLoadingStates({});
  }, []);

  const withLoading = useCallback(async <T,>(
    key: string, 
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    setLoading(key, true);
    try {
      return await asyncFn();
    } finally {
      setLoading(key, false);
    }
  }, [setLoading]);

  const batchSetLoading = useCallback((updates: Record<string, boolean>) => {
    setLoadingStates(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    loadingKeys,
    resetAll,
    withLoading,
    batchSetLoading,
  };
}
