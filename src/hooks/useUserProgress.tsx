
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

interface ProgressCache {
  [courseId: string]: {
    data: UserProgress[];
    timestamp: number;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useUserProgress(userId?: string) {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cache, setCache] = useState<ProgressCache>({});
  const { toast } = useToast();

  const isCacheValid = useCallback((courseId: string): boolean => {
    const cached = cache[courseId];
    if (!cached) return false;
    
    const isValid = Date.now() - cached.timestamp < CACHE_DURATION;
    logger.debug('Cache validation', { courseId, isValid, age: Date.now() - cached.timestamp });
    return isValid;
  }, [cache]);

  const fetchProgress = useCallback(async (courseId?: string) => {
    if (!userId) {
      logger.warn('fetchProgress called without userId');
      return;
    }

    // Check cache first
    if (courseId && isCacheValid(courseId)) {
      const cached = cache[courseId];
      setProgress(cached.data);
      logger.info('Progress loaded from cache', { courseId, count: cached.data.length });
      return;
    }

    try {
      setIsLoading(true);
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

      if (error) {
        logger.error('Error fetching progress', error);
        throw error;
      }

      const progressData = data || [];
      setProgress(progressData);

      // Update cache
      if (courseId) {
        setCache(prev => ({
          ...prev,
          [courseId]: {
            data: progressData,
            timestamp: Date.now()
          }
        }));
      }

      logger.info('Progress fetched successfully', { count: progressData.length });
    } catch (error) {
      logger.error('Error fetching progress', error);
      toast({
        title: 'Erro ao carregar progresso',
        description: 'Não foi possível carregar seu progresso.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, cache, isCacheValid, toast]);

  const markTopicCompleted = useCallback(async (topicId: string, completed: boolean = true) => {
    if (!userId) {
      logger.warn('markTopicCompleted called without userId');
      return;
    }

    try {
      logger.info('Marking topic as completed', { topicId, completed });

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

      if (error) {
        logger.error('Error updating progress', error);
        throw error;
      }

      toast({
        title: completed ? 'Tópico concluído!' : 'Progresso atualizado',
        description: completed ? 'Parabéns pelo progresso!' : 'Progresso salvo.',
      });

      // Update local state and clear cache
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

      // Clear cache to force refresh
      setCache({});

      logger.info('Topic progress updated successfully', { topicId, completed });
      return data;
    } catch (error) {
      logger.error('Error updating progress', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o progresso.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [userId, toast]);

  const saveQuestionAttempt = useCallback(async (
    questionId: string,
    selectedAnswer: number,
    isCorrect: boolean
  ) => {
    if (!userId) {
      logger.warn('saveQuestionAttempt called without userId');
      return;
    }

    try {
      logger.info('Saving question attempt', { questionId, selectedAnswer, isCorrect });

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

      if (error) {
        logger.error('Error saving question attempt', error);
        throw error;
      }

      setAttempts(prev => [...prev, data]);
      logger.info('Question attempt saved successfully', { questionId });
      return data;
    } catch (error) {
      logger.error('Error saving question attempt', error);
      throw error;
    }
  }, [userId]);

  const progressMemo = useMemo(() => {
    const getTopicProgress = (topicId: string) => {
      return progress.find(p => p.topic_id === topicId);
    };

    const isTopicCompleted = (topicId: string) => {
      const topicProgress = getTopicProgress(topicId);
      return topicProgress?.completed || false;
    };

    return { getTopicProgress, isTopicCompleted };
  }, [progress]);

  useEffect(() => {
    if (userId) {
      fetchProgress();
    }
  }, [userId, fetchProgress]);

  return {
    progress,
    attempts,
    isLoading,
    fetchProgress,
    markTopicCompleted,
    saveQuestionAttempt,
    ...progressMemo,
  };
}
