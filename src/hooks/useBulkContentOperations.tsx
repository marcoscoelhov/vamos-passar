
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getQuestionsForTopic } from '@/data/questionsData';
import { lawContentData } from '@/data/lawContent';
import { logger } from '@/utils/logger';

interface UseBulkContentOperationsProps {
  addTopic: (courseId: string, title: string, content: string, parentTopicId?: string) => Promise<any>;
  addQuestion: (topicId: string, question: string, options: string[], correctAnswer: number, explanation: string, difficulty: 'easy' | 'medium' | 'hard') => Promise<any>;
}

export function useBulkContentOperations({ addTopic, addQuestion }: UseBulkContentOperationsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addQuestionsForTopic = async (topicId: string) => {
    const questionsData = getQuestionsForTopic(topicId);
    
    for (const questionData of questionsData) {
      await addQuestion(
        topicId,
        questionData.question,
        questionData.options,
        questionData.correctAnswer,
        questionData.explanation,
        questionData.difficulty
      );
    }
  };

  const createTopicWithSubtopics = async (
    courseId: string, 
    topicData: any, 
    parentTopicId?: string
  ) => {
    // Create main topic
    const mainTopic = await addTopic(
      courseId, 
      topicData.title, 
      topicData.content, 
      parentTopicId
    );

    // Create subtopics if they exist
    if (topicData.subtopics) {
      const subtopicPromises = Object.values(topicData.subtopics).map(async (subtopicData: any) => {
        const subtopic = await addTopic(
          courseId,
          subtopicData.title,
          subtopicData.content,
          mainTopic.id
        );
        
        // Add questions for this subtopic
        await addQuestionsForTopic(subtopic.id);
        
        return subtopic;
      });

      await Promise.all(subtopicPromises);
    }

    return mainTopic;
  };

  const addBulkContent = async (courseId: string) => {
    try {
      setIsLoading(true);
      logger.debug('Starting bulk content addition', { courseId });

      // Create all law topics with their subtopics
      await createTopicWithSubtopics(courseId, lawContentData.constitucional);
      await createTopicWithSubtopics(courseId, lawContentData.civil);
      await createTopicWithSubtopics(courseId, lawContentData.penal);
      await createTopicWithSubtopics(courseId, lawContentData.administrativo);

      logger.info('Bulk content added successfully', { courseId });
      toast({
        title: 'Sucesso',
        description: 'Conteúdo de direito adicionado com sucesso!',
      });

    } catch (error) {
      logger.error('Error adding bulk content', { courseId, error });
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar conteúdo.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addBulkContent,
    isLoading,
  };
}
