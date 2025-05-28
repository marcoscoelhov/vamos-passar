
import { useState } from 'react';
import { useCourses } from './useCourses';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export function useTopics() {
  const [isLoading, setIsLoading] = useState(false);
  const { addTopic: addTopicToDb } = useCourses();
  const { toast } = useToast();

  const addTopic = async (
    courseId: string,
    topicData: { title: string; content: string },
    isAdmin: boolean,
    parentTopicId?: string
  ) => {
    if (!isAdmin) {
      throw new Error('Apenas administradores podem adicionar tópicos');
    }

    setIsLoading(true);
    try {
      await addTopicToDb(courseId, topicData.title, topicData.content, parentTopicId);
      
      toast({
        title: 'Tópico adicionado',
        description: parentTopicId ? 'O subtópico foi adicionado com sucesso.' : 'O tópico foi adicionado com sucesso.',
      });

      return true;
    } catch (error) {
      logger.error('Error adding topic', { courseId, topicTitle: topicData.title, parentTopicId, error });
      toast({
        title: 'Erro ao adicionar tópico',
        description: 'Não foi possível adicionar o tópico.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addTopic,
    isLoading,
  };
}
