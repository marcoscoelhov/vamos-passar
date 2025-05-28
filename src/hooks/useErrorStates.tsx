
import { useState, useCallback } from 'react';

interface ErrorState {
  message: string;
  code?: string;
  timestamp: number;
}

interface ErrorStates {
  [key: string]: ErrorState | null;
}

export function useErrorStates(initialStates: ErrorStates = {}) {
  const [errorStates, setErrorStates] = useState<ErrorStates>(initialStates);

  const setError = useCallback((key: string, message: string, code?: string) => {
    setErrorStates(prev => ({
      ...prev,
      [key]: {
        message,
        code,
        timestamp: Date.now()
      }
    }));
  }, []);

  const clearError = useCallback((key: string) => {
    setErrorStates(prev => ({
      ...prev,
      [key]: null
    }));
  }, []);

  const hasError = useCallback((key: string): boolean => {
    return errorStates[key] !== null;
  }, [errorStates]);

  const getError = useCallback((key: string): ErrorState | null => {
    return errorStates[key] || null;
  }, [errorStates]);

  const hasAnyError = useCallback((): boolean => {
    return Object.values(errorStates).some(error => error !== null);
  }, [errorStates]);

  const clearAllErrors = useCallback(() => {
    setErrorStates({});
  }, []);

  const withErrorHandling = useCallback(async <T,>(
    key: string,
    asyncFn: () => Promise<T>,
    customErrorMessage?: string
  ): Promise<T | null> => {
    clearError(key);
    try {
      return await asyncFn();
    } catch (error) {
      const message = customErrorMessage || 
        (error instanceof Error ? error.message : 'Erro desconhecido');
      setError(key, message);
      return null;
    }
  }, [setError, clearError]);

  return {
    errorStates,
    setError,
    clearError,
    hasError,
    getError,
    hasAnyError,
    clearAllErrors,
    withErrorHandling,
  };
}
