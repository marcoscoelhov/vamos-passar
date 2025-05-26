
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export function useUserProgress(userId?: string) {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchProgress = async (courseId?: string) => {
    if (!userId) return;

    try {
      setIsLoading(true);
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
        throw error;
      }

      setProgress(data || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markTopicCompleted = async (topicId: string, completed: boolean = true) => {
    if (!userId) return;

    try {
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
        throw error;
      }

      toast({
        title: completed ? 'Tópico concluído!' : 'Progresso atualizado',
        description: completed ? 'Parabéns pelo progresso!' : 'Progresso salvo.',
      });

      // Update local state
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

      return data;
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o progresso.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const saveQuestionAttempt = async (
    questionId: string,
    selectedAnswer: number,
    isCorrect: boolean
  ) => {
    if (!userId) return;

    try {
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
        throw error;
      }

      setAttempts(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error saving question attempt:', error);
      throw error;
    }
  };

  const getTopicProgress = (topicId: string) => {
    return progress.find(p => p.topic_id === topicId);
  };

  const isTopicCompleted = (topicId: string) => {
    const topicProgress = getTopicProgress(topicId);
    return topicProgress?.completed || false;
  };

  useEffect(() => {
    if (userId) {
      fetchProgress();
    }
  }, [userId]);

  return {
    progress,
    attempts,
    isLoading,
    fetchProgress,
    markTopicCompleted,
    saveQuestionAttempt,
    getTopicProgress,
    isTopicCompleted,
  };
}
