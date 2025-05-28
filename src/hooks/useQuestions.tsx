
import { useState } from 'react';
import { useCourses } from './useCourses';
import { Question, DbQuestion } from '@/types/course';
import { mapDbQuestionToQuestion } from '@/utils/dataMappers';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export function useQuestions() {
  const [isLoading, setIsLoading] = useState(false);
  const { addQuestion: addQuestionToDb, fetchQuestions } = useCourses();
  const { toast } = useToast();

  const addQuestion = async (
    topicId: string,
    questionData: Omit<Question, 'id'>,
    isAdmin: boolean
  ) => {
    if (!isAdmin) {
      throw new Error('Apenas administradores podem adicionar questões');
    }

    setIsLoading(true);
    try {
      await addQuestionToDb(
        topicId,
        questionData.question,
        questionData.options,
        questionData.correctAnswer,
        questionData.explanation,
        questionData.difficulty
      );

      toast({
        title: 'Questão adicionada',
        description: 'A questão foi adicionada com sucesso.',
      });

      return true;
    } catch (error) {
      logger.error('Error adding question', { topicId, questionData: questionData.question, error });
      toast({
        title: 'Erro ao adicionar questão',
        description: 'Não foi possível adicionar a questão.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuestionsForTopic = async (topicId: string): Promise<Question[]> => {
    try {
      const dbQuestions: DbQuestion[] = await fetchQuestions(topicId);
      return dbQuestions.map(mapDbQuestionToQuestion);
    } catch (error) {
      logger.error('Error loading questions', { topicId, error });
      return [];
    }
  };

  return {
    addQuestion,
    loadQuestionsForTopic,
    isLoading,
  };
}
