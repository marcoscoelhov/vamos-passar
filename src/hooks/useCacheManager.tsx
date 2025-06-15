
import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface CacheConfig {
  maxAge: number; // em milissegundos
  maxSize: number; // número máximo de entradas
  preloadKeys: string[]; // chaves para pré-carregar
}

const DEFAULT_CONFIG: CacheConfig = {
  maxAge: 30 * 60 * 1000, // 30 minutos
  maxSize: 100,
  preloadKeys: ['courses', 'topics', 'user-progress']
};

export function useCacheManager(config: Partial<CacheConfig> = {}) {
  const queryClient = useQueryClient();
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Limpar cache expirado
  const clearExpiredCache = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    const now = Date.now();

    queries.forEach(query => {
      const dataUpdatedAt = query.state.dataUpdatedAt;
      if (dataUpdatedAt && (now - dataUpdatedAt) > finalConfig.maxAge) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
  }, [queryClient, finalConfig.maxAge]);

  // Gerenciar tamanho do cache
  const manageCacheSize = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    if (queries.length > finalConfig.maxSize) {
      // Ordenar por último acesso e remover as mais antigas
      const sortedQueries = queries
        .sort((a, b) => (a.state.dataUpdatedAt || 0) - (b.state.dataUpdatedAt || 0))
        .slice(0, queries.length - finalConfig.maxSize);

      sortedQueries.forEach(query => {
        queryClient.removeQueries({ queryKey: query.queryKey });
      });
    }
  }, [queryClient, finalConfig.maxSize]);

  // Pré-carregar dados importantes
  const preloadData = useCallback(async () => {
    for (const key of finalConfig.preloadKeys) {
      // Verificar se já está no cache
      const cachedData = queryClient.getQueryData([key]);
      if (!cachedData) {
        // Marcar para refetch em background
        queryClient.prefetchQuery({
          queryKey: [key],
          queryFn: () => Promise.resolve(null), // Placeholder
          staleTime: finalConfig.maxAge,
        });
      }
    }
  }, [queryClient, finalConfig.preloadKeys, finalConfig.maxAge]);

  // Otimizar queries relacionadas
  const optimizeRelatedQueries = useCallback((baseKey: string, data: any) => {
    // Se atualizamos um curso, invalidar queries relacionadas
    if (baseKey.includes('course')) {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
    }
    
    // Se atualizamos tópicos, invalidar progresso
    if (baseKey.includes('topic')) {
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
    }
  }, [queryClient]);

  // Configurar cache inteligente
  useEffect(() => {
    // Executar limpeza a cada 5 minutos
    const cleanupInterval = setInterval(() => {
      clearExpiredCache();
      manageCacheSize();
    }, 5 * 60 * 1000);

    // Pré-carregar dados na inicialização
    preloadData();

    return () => clearInterval(cleanupInterval);
  }, [clearExpiredCache, manageCacheSize, preloadData]);

  return {
    clearExpiredCache,
    manageCacheSize,
    preloadData,
    optimizeRelatedQueries,
    
    // Método para forçar refresh de dados específicos
    refreshData: (queryKey: string[]) => {
      queryClient.invalidateQueries({ queryKey });
    },
    
    // Método para definir dados no cache
    setCache: (queryKey: string[], data: any) => {
      queryClient.setQueryData(queryKey, data);
    },
    
    // Método para obter estatísticas do cache
    getCacheStats: () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      return {
        totalQueries: queries.length,
        activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
        staleQueries: queries.filter(q => q.isStale()).length,
        errorQueries: queries.filter(q => q.state.status === 'error').length,
      };
    }
  };
}
