
import { useState } from 'react';
import { useCourses } from './useCourses';
import { useToast } from '@/hooks/use-toast';

export function useTopics() {
  const [isLoading, setIsLoading] = useState(false);
  const { addTopic: addTopicToDb } = useCourses();
  const { toast } = useToast();

  const addTopic = async (
    courseId: string,
    topicData: { title: string; content: string },
    isAdmin: boolean
  ) => {
    if (!isAdmin) {
      throw new Error('Apenas administradores podem adicionar tópicos');
    }

    setIsLoading(true);
    try {
      await addTopicToDb(courseId, topicData.title, topicData.content);
      
      toast({
        title: 'Tópico adicionado',
        description: 'O tópico foi adicionado com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('Error adding topic:', error);
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
