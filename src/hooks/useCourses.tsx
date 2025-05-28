
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCourseData } from './useCourseData';
import { useCourseOperations } from './useCourseOperations';
import { useBulkContent } from './useBulkContent';
import { logger } from '@/utils/logger';

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
        logger.debug('Loading initial courses data');
        await fetchCourses();
        logger.info('Initial courses data loaded successfully');
      } catch (error) {
        logger.error('Error fetching courses', error);
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
      logger.debug('Adding topic to course', { courseId, title, parentTopicId });
      const result = await addTopicOperation(courseId, title, content, parentTopicId);
      
      // Refresh topics for this course
      await fetchTopics(courseId);
      logger.info('Topic added successfully', { topicId: result?.id });
      
      return result;
    } catch (error) {
      logger.error('Error adding topic', error);
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
      logger.debug('Adding question to topic', { topicId, difficulty });
      const result = await addQuestionOperation(topicId, question, options, correctAnswer, explanation, difficulty);
      
      // Refresh questions for this topic
      await fetchQuestions(topicId);
      logger.info('Question added successfully', { questionId: result?.id });
      
      return result;
    } catch (error) {
      logger.error('Error adding question', error);
      throw error;
    }
  };

  const addBulkContent = async (courseId: string) => {
    try {
      logger.debug('Adding bulk content to course', { courseId });
      await addBulkContentOperation(courseId);
      // Refresh topics after bulk content is added
      await fetchTopics(courseId);
      logger.info('Bulk content added successfully', { courseId });
    } catch (error) {
      logger.error('Error adding bulk content', error);
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
