
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCacheManager } from './useCacheManager';
import { useOptimizedLoadingStates } from './useOptimizedLoadingStates';
import { logger } from '@/utils/logger';

interface UserProgress {
  id: string;
  user_id: string;
  topic_id: string;
  completed: boolean;
  completed_at: string | null;
}

interface QuestionAttempt {
  id: string;
  user_id: string;
  question_id: string;
  selected_answer: number;
  is_correct: boolean;
  attempted_at: string;
}

interface ProgressStats {
  totalTopics: number;
  completedTopics: number;
  progressPercentage: number;
  streakDays: number;
  lastActivity: string | null;
}

export function useMemoryOptimizedProgress(userId?: string) {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);
  const [stats, setStats] = useState<ProgressStats>({
    totalTopics: 0,
    completedTopics: 0,
    progressPercentage: 0,
    streakDays: 0,
    lastActivity: null,
  });
  
  const { toast } = useToast();
  const progressCache = useCacheManager<UserProgress[]>();
  const attemptsCache = useCacheManager<QuestionAttempt[]>();
  const { setLoading, isLoading, withLoading } = useOptimizedLoadingStates();

  // Memoized progress lookup for performance
  const progressMap = useMemo(() => {
    return new Map(progress.map(p => [p.topic_id, p]));
  }, [progress]);

  const attemptsMap = useMemo(() => {
    const map = new Map<string, QuestionAttempt[]>();
    attempts.forEach(attempt => {
      const questionAttempts = map.get(attempt.question_id) || [];
      questionAttempts.push(attempt);
      map.set(attempt.question_id, questionAttempts);
    });
    return map;
  }, [attempts]);

  const fetchProgress = useCallback(async (courseId?: string, forceRefresh = false) => {
    if (!userId) return;

    const cacheKey = courseId ? `progress_${userId}_${courseId}` : `progress_${userId}`;

    // Check cache first
    if (!forceRefresh) {
      const cached = progressCache.getCacheEntry(cacheKey);
      if (cached) {
        setProgress(cached);
        logger.debug('Progress loaded from cache', { userId, courseId, count: cached.length });
        return cached;
      }
    }

    return withLoading('progress', async () => {
      logger.info('Fetching user progress', { userId, courseId });

      let query = supabase
        .from('user_progress')
        .select(`
          *,
          topics!inner(
            id,
            title,
            course_id
          )
        `)
        .eq('user_id', userId);

      if (courseId) {
        query = query.eq('topics.course_id', courseId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const progressData = data || [];
      
      // Update cache and state
      progressCache.setCacheEntry(cacheKey, progressData);
      setProgress(progressData);

      // Calculate stats
      const completedCount = progressData.filter(p => p.completed).length;
      const totalCount = progressData.length;
      const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
      
      setStats(prev => ({
        ...prev,
        totalTopics: totalCount,
        completedTopics: completedCount,
        progressPercentage: Math.round(percentage),
      }));

      logger.info('Progress fetched successfully', { 
        userId, 
        courseId, 
        total: totalCount,
        completed: completedCount,
        percentage: percentage.toFixed(1)
      });
      
      return progressData;
    });
  }, [userId, progressCache, withLoading]);

  const markTopicCompleted = useCallback(async (topicId: string, completed: boolean = true) => {
    if (!userId) return;

    return withLoading('update', async () => {
      logger.info('Marking topic as completed', { topicId, completed, userId });

      const { data, error } = await supabase
        .from('user_progress')
        .upsert(
          {
            user_id: userId,
            topic_id: topicId,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          },
          {
            onConflict: 'user_id,topic_id',
          }
        )
        .select()
        .single();

      if (error) throw error;

      // Optimistic update
      setProgress(prev => {
        const existingIndex = prev.findIndex(p => p.topic_id === topicId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = data;
          return updated;
        } else {
          return [...prev, data];
        }
      });

      // Update stats optimistically
      setStats(prev => {
        const wasCompleted = progressMap.get(topicId)?.completed || false;
        let completedDiff = 0;
        
        if (completed && !wasCompleted) completedDiff = 1;
        else if (!completed && wasCompleted) completedDiff = -1;
        
        const newCompleted = prev.completedTopics + completedDiff;
        const newPercentage = prev.totalTopics > 0 ? (newCompleted / prev.totalTopics) * 100 : 0;
        
        return {
          ...prev,
          completedTopics: newCompleted,
          progressPercentage: Math.round(newPercentage),
          lastActivity: new Date().toISOString(),
        };
      });

      // Clear cache to force refresh on next fetch
      progressCache.invalidateCache();

      toast({
        title: completed ? 'Tópico concluído!' : 'Progresso atualizado',
        description: completed ? 'Parabéns pelo progresso!' : 'Progresso salvo.',
      });

      logger.info('Topic progress updated successfully', { topicId, completed, userId });
      return data;
    });
  }, [userId, progressMap, progressCache, toast, withLoading]);

  const saveQuestionAttempt = useCallback(async (
    questionId: string,
    selectedAnswer: number,
    isCorrect: boolean
  ) => {
    if (!userId) return;

    return withLoading('attempt', async () => {
      logger.info('Saving question attempt', { questionId, selectedAnswer, isCorrect, userId });

      const { data, error } = await supabase
        .from('user_question_attempts')
        .insert([
          {
            user_id: userId,
            question_id: questionId,
            selected_answer: selectedAnswer,
            is_correct: isCorrect,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Optimistic update
      setAttempts(prev => [...prev, data]);

      // Clear attempts cache
      attemptsCache.invalidateCache();

      logger.info('Question attempt saved successfully', { questionId, userId });
      return data;
    });
  }, [userId, attemptsCache, withLoading]);

  // Optimized lookup functions
  const getTopicProgress = useCallback((topicId: string) => {
    return progressMap.get(topicId);
  }, [progressMap]);

  const isTopicCompleted = useCallback((topicId: string) => {
    return progressMap.get(topicId)?.completed || false;
  }, [progressMap]);

  const getQuestionAttempts = useCallback((questionId: string) => {
    return attemptsMap.get(questionId) || [];
  }, [attemptsMap]);

  const getLastAttempt = useCallback((questionId: string) => {
    const attempts = getQuestionAttempts(questionId);
    return attempts.length > 0 ? attempts[attempts.length - 1] : null;
  }, [getQuestionAttempts]);

  // Load initial data
  useEffect(() => {
    if (userId) {
      fetchProgress();
    }
  }, [userId, fetchProgress]);

  return useMemo(() => ({
    progress,
    attempts,
    stats,
    isLoading: isLoading('progress'),
    isUpdating: isLoading('update'),
    isSavingAttempt: isLoading('attempt'),
    fetchProgress,
    markTopicCompleted,
    saveQuestionAttempt,
    getTopicProgress,
    isTopicCompleted,
    getQuestionAttempts,
    getLastAttempt,
  }), [
    progress,
    attempts,
    stats,
    isLoading,
    fetchProgress,
    markTopicCompleted,
    saveQuestionAttempt,
    getTopicProgress,
    isTopicCompleted,
    getQuestionAttempts,
    getLastAttempt,
  ]);
}
