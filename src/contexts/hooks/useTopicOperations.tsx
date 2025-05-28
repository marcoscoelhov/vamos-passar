
import { useCallback } from 'react';
import { Topic, Question, DbQuestion } from '@/types/course';
import { mapDbQuestionToQuestion } from '@/utils/dataMappers';
import { logger } from '@/utils/logger';

interface UseTopicOperationsProps {
  fetchQuestions: (topicId: string) => Promise<DbQuestion[]>;
  questionsCache: Map<string, Question[]>;
  setQuestionsCache: (cache: Map<string, Question[]>) => void;
  setIsLoadingQuestions: (loading: boolean) => void;
  setCurrentTopic: (topic: Topic | null) => void;
  setError: (message: string) => void;
  clearError: () => void;
}

export function useTopicOperations({
  fetchQuestions,
  questionsCache,
  setQuestionsCache,
  setIsLoadingQuestions,
  setCurrentTopic,
  setError,
  clearError,
}: UseTopicOperationsProps) {
  const handleSetCurrentTopic = useCallback(async (topic: Topic) => {
    try {
      clearError();
      // Load questions for this topic if not already loaded or cached
      if ((!topic.questions || topic.questions.length === 0) && !questionsCache.has(topic.id)) {
        setIsLoadingQuestions(true);
        try {
          const dbQuestions: DbQuestion[] = await fetchQuestions(topic.id);
          const mappedQuestions = dbQuestions ? dbQuestions.map(mapDbQuestionToQuestion) : [];
          topic.questions = mappedQuestions;
          
          // Update cache
          setQuestionsCache(prev => new Map(prev).set(topic.id, mappedQuestions));
          
          logger.debug('Questions loaded for topic', { topicId: topic.id, questionCount: mappedQuestions.length });
        } catch (error) {
          logger.error('Error loading questions for topic', { topicId: topic.id, error });
          // Continue with empty questions array
          topic.questions = [];
        } finally {
          setIsLoadingQuestions(false);
        }
      } else if (questionsCache.has(topic.id)) {
        // Use cached questions
        topic.questions = questionsCache.get(topic.id)!;
      }
      
      setCurrentTopic(topic);
      logger.debug('Current topic set', { topicId: topic.id, title: topic.title });
    } catch (error) {
      logger.error('Error setting current topic', { topicId: topic.id, error });
      setError('Erro ao carregar tópico');
    }
  }, [fetchQuestions, questionsCache, setQuestionsCache, setIsLoadingQuestions, setCurrentTopic, setError, clearError]);

  return { handleSetCurrentTopic };
}
