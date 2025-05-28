
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DbQuestion, DbTopic } from '@/types/course';

interface Course {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export function useCourseOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const showError = useCallback((title: string, description: string) => {
    toast({
      title,
      description,
      variant: 'destructive',
    });
  }, [toast]);

  const showSuccess = useCallback((title: string, description: string) => {
    toast({
      title,
      description,
    });
  }, [toast]);

  const addTopic = async (
    courseId: string, 
    title: string, 
    content: string, 
    parentTopicId?: string
  ) => {
    try {
      // Get the highest order_index for this course and level
      let orderQuery = supabase
        .from('topics')
        .select('order_index')
        .eq('course_id', courseId);

      let level = 0;
      if (parentTopicId) {
        // Get parent topic level
        const { data: parentData, error: parentError } = await supabase
          .from('topics')
          .select('level')
          .eq('id', parentTopicId)
          .single();

        if (parentError) throw parentError;
        level = parentData.level + 1;
        
        orderQuery = orderQuery.eq('parent_topic_id', parentTopicId);
      } else {
        orderQuery = orderQuery.is('parent_topic_id', null);
      }

      const { data: lastTopic } = await orderQuery
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      const newOrderIndex = (lastTopic?.order_index || 0) + 1;

      const { data, error } = await supabase
        .from('topics')
        .insert([
          {
            course_id: courseId,
            title,
            content,
            order_index: newOrderIndex,
            parent_topic_id: parentTopicId || null,
            level,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Tópico adicionado com sucesso!',
      });

      return data;
    } catch (error) {
      console.error('Error adding topic:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o tópico.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const addQuestion = async (
    topicId: string,
    question: string,
    options: string[],
    correctAnswer: number,
    explanation: string,
    difficulty: 'easy' | 'medium' | 'hard'
  ) => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert([
          {
            topic_id: topicId,
            question,
            options,
            correct_answer: correctAnswer,
            explanation,
            difficulty,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Questão adicionada com sucesso!',
      });

      return data;
    } catch (error) {
      console.error('Error adding question:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a questão.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    addTopic,
    addQuestion,
    isLoading,
    showError,
    showSuccess,
  };
}
