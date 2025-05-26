
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface Topic {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface Question {
  id: string;
  topic_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  updated_at: string;
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os cursos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopics = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) {
        throw error;
      }

      setTopics(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os tópicos.',
        variant: 'destructive',
      });
      return [];
    }
  };

  const fetchQuestions = async (topicId: string) => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      setQuestions(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as questões.',
        variant: 'destructive',
      });
      return [];
    }
  };

  const addTopic = async (courseId: string, title: string, content: string) => {
    try {
      // Get the highest order_index for this course
      const { data: lastTopic } = await supabase
        .from('topics')
        .select('order_index')
        .eq('course_id', courseId)
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

      // Refresh topics for this course
      await fetchTopics(courseId);
      
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

      // Refresh questions for this topic
      await fetchQuestions(topicId);
      
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
    courses,
    topics,
    questions,
    isLoading,
    fetchCourses,
    fetchTopics,
    fetchQuestions,
    addTopic,
    addQuestion,
  };
}
