
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getQuestionsForTopic } from '@/data/questionsData';
import { lawContentData } from '@/data/lawContent';
import { logger } from '@/utils/logger';
import { useOptimizedLoadingStates } from './useOptimizedLoadingStates';

interface UseBulkContentOperationsProps {
  addTopic: (courseId: string, title: string, content: string, parentTopicId?: string) => Promise<any>;
  addQuestion: (topicId: string, question: string, options: string[], correctAnswer: number, explanation: string, difficulty: 'easy' | 'medium' | 'hard') => Promise<any>;
}

export function useBulkContentOperations({ addTopic, addQuestion }: UseBulkContentOperationsProps) {
  const { loadingStates, setLoading, withLoading } = useOptimizedLoadingStates({
    bulkContent: false,
    topics: false,
    questions: false
  });
  const { toast } = useToast();

  const addQuestionsForTopic = useCallback(async (topicId: string) => {
    setLoading('questions', true);
    try {
      const questionsData = getQuestionsForTopic(topicId);
      logger.debug('Adding questions for topic', { 
        topicId, 
        questionCount: questionsData.length 
      });
      
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
      
      logger.info('Questions added successfully', { 
        topicId, 
        count: questionsData.length 
      });
    } catch (error) {
      logger.error('Error adding questions for topic', { topicId, error });
    } finally {
      setLoading('questions', false);
    }
  }, [addQuestion, setLoading]);

  const createTopicWithSubtopics = useCallback(async (
    courseId: string, 
    topicData: any, 
    parentTopicId?: string
  ) => {
    setLoading('topics', true);
    try {
      // Create main topic
      logger.debug('Creating main topic', { 
        courseId, 
        title: topicData.title,
        hasParent: !!parentTopicId 
      });
      
      const mainTopic = await addTopic(
        courseId, 
        topicData.title, 
        topicData.content, 
        parentTopicId
      );

      // Create subtopics if they exist
      if (topicData.subtopics) {
        const subtopicPromises = Object.values(topicData.subtopics).map(async (subtopicData: any) => {
          logger.debug('Creating subtopic', { 
            parentId: mainTopic.id, 
            title: subtopicData.title 
          });
          
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
      
      logger.info('Topic with subtopics created successfully', { 
        topicId: mainTopic.id, 
        subtopicCount: topicData.subtopics ? Object.values(topicData.subtopics).length : 0 
      });

      return mainTopic;
    } catch (error) {
      logger.error('Error creating topic with subtopics', { courseId, title: topicData.title, error });
      throw error;
    } finally {
      setLoading('topics', false);
    }
  }, [addTopic, addQuestionsForTopic, setLoading]);

  const addBulkContent = useCallback(async (courseId: string) => {
    return withLoading('bulkContent', async () => {
      try {
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
      }
    });
  }, [withLoading, createTopicWithSubtopics, toast]);

  return {
    addBulkContent,
    isLoading: loadingStates.bulkContent,
    loadingTopics: loadingStates.topics,
    loadingQuestions: loadingStates.questions
  };
}
