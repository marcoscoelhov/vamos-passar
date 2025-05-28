
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Highlight, DbHighlight } from '@/types/course';
import { useCacheManager } from './useCacheManager';
import { useOptimizedLoadingStates } from './useOptimizedLoadingStates';
import { logger } from '@/utils/logger';

interface OptimizedHighlightsOptions {
  topicId?: string;
  userId?: string;
  enableRealTimeUpdates?: boolean;
}

export function useOptimizedHighlights({
  topicId,
  userId,
  enableRealTimeUpdates = false
}: OptimizedHighlightsOptions) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const { toast } = useToast();
  const cache = useCacheManager<Highlight[]>();
  const { setLoading, isLoading, withLoading } = useOptimizedLoadingStates();

  const cacheKey = useMemo(() => 
    topicId && userId ? `highlights_${topicId}_${userId}` : null, 
    [topicId, userId]
  );

  const mapDbHighlightToHighlight = useCallback((dbHighlight: DbHighlight): Highlight => ({
    id: dbHighlight.id,
    userId: dbHighlight.user_id,
    topicId: dbHighlight.topic_id,
    highlightedText: dbHighlight.highlighted_text,
    contextBefore: dbHighlight.context_before || undefined,
    contextAfter: dbHighlight.context_after || undefined,
    positionStart: dbHighlight.position_start,
    positionEnd: dbHighlight.position_end,
    note: dbHighlight.note || undefined,
    createdAt: dbHighlight.created_at,
    updatedAt: dbHighlight.updated_at,
  }), []);

  const fetchHighlights = useCallback(async (forceRefresh = false) => {
    if (!topicId || !userId || !cacheKey) return;

    // Check cache first
    if (!forceRefresh) {
      const cached = cache.getCacheEntry(cacheKey);
      if (cached) {
        setHighlights(cached);
        logger.debug('Highlights loaded from cache', { topicId, userId, count: cached.length });
        return cached;
      }
    }

    return withLoading('fetch', async () => {
      const { data, error } = await supabase
        .from('user_highlights')
        .select('*')
        .eq('topic_id', topicId)
        .eq('user_id', userId)
        .order('position_start', { ascending: true });

      if (error) throw error;

      const mappedHighlights = (data || []).map(mapDbHighlightToHighlight);
      
      // Update cache and state
      cache.setCacheEntry(cacheKey, mappedHighlights);
      setHighlights(mappedHighlights);
      
      logger.debug('Highlights fetched and cached', { topicId, userId, count: mappedHighlights.length });
      return mappedHighlights;
    });
  }, [topicId, userId, cacheKey, cache, mapDbHighlightToHighlight, withLoading]);

  const addHighlight = useCallback(async (
    highlightedText: string,
    positionStart: number,
    positionEnd: number,
    contextBefore?: string,
    contextAfter?: string,
    note?: string
  ) => {
    if (!topicId || !userId || !cacheKey) return;

    return withLoading('add', async () => {
      const { data, error } = await supabase
        .from('user_highlights')
        .insert([{
          user_id: userId,
          topic_id: topicId,
          highlighted_text: highlightedText,
          context_before: contextBefore,
          context_after: contextAfter,
          position_start: positionStart,
          position_end: positionEnd,
          note,
        }])
        .select()
        .single();

      if (error) throw error;

      const newHighlight = mapDbHighlightToHighlight(data);
      
      // Optimistically update state and cache
      const updatedHighlights = [...highlights, newHighlight].sort((a, b) => a.positionStart - b.positionStart);
      setHighlights(updatedHighlights);
      cache.setCacheEntry(cacheKey, updatedHighlights);

      toast({
        title: 'Destaque adicionado',
        description: 'Seu destaque foi salvo com sucesso.',
      });

      logger.info('Highlight added successfully', { topicId, userId, highlightId: newHighlight.id });
      return newHighlight;
    });
  }, [topicId, userId, cacheKey, highlights, mapDbHighlightToHighlight, cache, toast, withLoading]);

  const updateHighlight = useCallback(async (highlightId: string, note: string) => {
    if (!userId || !cacheKey) return;

    return withLoading('update', async () => {
      const { data, error } = await supabase
        .from('user_highlights')
        .update({ note, updated_at: new Date().toISOString() })
        .eq('id', highlightId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      const updatedHighlight = mapDbHighlightToHighlight(data);
      
      // Optimistically update state and cache
      const updatedHighlights = highlights.map(h => h.id === highlightId ? updatedHighlight : h);
      setHighlights(updatedHighlights);
      cache.setCacheEntry(cacheKey, updatedHighlights);

      toast({
        title: 'Destaque atualizado',
        description: 'Sua nota foi salva com sucesso.',
      });

      logger.info('Highlight updated successfully', { highlightId, userId });
      return updatedHighlight;
    });
  }, [userId, cacheKey, highlights, mapDbHighlightToHighlight, cache, toast, withLoading]);

  const deleteHighlight = useCallback(async (highlightId: string) => {
    if (!userId || !cacheKey) return;

    return withLoading('delete', async () => {
      const { error } = await supabase
        .from('user_highlights')
        .delete()
        .eq('id', highlightId)
        .eq('user_id', userId);

      if (error) throw error;

      // Optimistically update state and cache
      const updatedHighlights = highlights.filter(h => h.id !== highlightId);
      setHighlights(updatedHighlights);
      cache.setCacheEntry(cacheKey, updatedHighlights);

      toast({
        title: 'Destaque removido',
        description: 'O destaque foi removido com sucesso.',
      });

      logger.info('Highlight deleted successfully', { highlightId, userId });
    });
  }, [userId, cacheKey, highlights, cache, toast, withLoading]);

  const invalidateCache = useCallback(() => {
    if (cacheKey) {
      cache.invalidateCache(cacheKey);
      logger.debug('Highlights cache invalidated', { cacheKey });
    }
  }, [cache, cacheKey]);

  // Set up real-time updates if enabled
  useEffect(() => {
    if (!enableRealTimeUpdates || !topicId || !userId) return;

    const channel = supabase
      .channel(`highlights_${topicId}_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_highlights',
          filter: `topic_id=eq.${topicId}`,
        },
        () => {
          logger.debug('Real-time update received, refreshing highlights');
          fetchHighlights(true);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [enableRealTimeUpdates, topicId, userId, fetchHighlights]);

  // Load highlights on mount
  useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  return useMemo(() => ({
    highlights,
    isLoading: isLoading('fetch'),
    isAdding: isLoading('add'),
    isUpdating: isLoading('update'),
    isDeleting: isLoading('delete'),
    addHighlight,
    updateHighlight,
    deleteHighlight,
    fetchHighlights,
    invalidateCache,
  }), [
    highlights,
    isLoading,
    addHighlight,
    updateHighlight,
    deleteHighlight,
    fetchHighlights,
    invalidateCache,
  ]);
}
