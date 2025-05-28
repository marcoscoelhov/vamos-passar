
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCourseData } from './useCourseData';
import { useCourseOperations } from './useCourseOperations';
import { useBulkContent } from './useBulkContent';

export function useCourses() {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const {
    courses,
    topics,
    questions,
    loadingStates,
    fetchCourses,
    fetchTopics,
    fetchQuestions,
    invalidateCache,
  } = useCourseData();

  const {
    addTopic: addTopicOperation,
    addQuestion: addQuestionOperation,
    showError,
    showSuccess,
  } = useCourseOperations();

  const { addBulkContent: addBulkContentOperation, isLoading: bulkContentLoading } = useBulkContent({
    addTopic: addTopicOperation,
    addQuestion: addQuestionOperation,
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchCourses();
      } catch (error) {
        console.error('Error fetching courses:', error);
        showError('Erro', 'Não foi possível carregar os cursos.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [fetchCourses, showError]);

  const addTopic = async (
    courseId: string, 
    title: string, 
    content: string, 
    parentTopicId?: string
  ) => {
    try {
      const result = await addTopicOperation(courseId, title, content, parentTopicId);
      
      // Refresh topics for this course
      await fetchTopics(courseId);
      
      return result;
    } catch (error) {
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
      const result = await addQuestionOperation(topicId, question, options, correctAnswer, explanation, difficulty);
      
      // Refresh questions for this topic
      await fetchQuestions(topicId);
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  const addBulkContent = async (courseId: string) => {
    try {
      await addBulkContentOperation(courseId);
      // Refresh topics after bulk content is added
      await fetchTopics(courseId);
    } catch (error) {
      throw error;
    }
  };

  const memoizedReturn = useMemo(() => ({
    courses,
    topics,
    questions,
    isLoading: isLoading || bulkContentLoading,
    loadingStates,
    fetchCourses,
    fetchTopics,
    fetchQuestions,
    invalidateCache,
    addTopic,
    addQuestion,
    addBulkContent,
  }), [
    courses,
    topics,
    questions,
    isLoading,
    bulkContentLoading,
    loadingStates,
    fetchCourses,
    fetchTopics,
    fetchQuestions,
    invalidateCache,
    addTopic,
    addQuestion,
    addBulkContent,
  ]);

  return memoizedReturn;
}
