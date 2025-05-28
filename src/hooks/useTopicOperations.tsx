
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useTopicOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updateTopicTitle = useCallback(async (topicId: string, newTitle: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('topics')
        .update({ title: newTitle.trim() })
        .eq('id', topicId);

      if (error) throw error;

      toast({
        title: 'Tópico atualizado',
        description: 'O título do tópico foi atualizado com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar tópico:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o título do tópico.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deleteTopic = useCallback(async (topicId: string) => {
    setIsLoading(true);
    try {
      // Primeiro, verificar se o tópico tem subtópicos
      const { data: children, error: childrenError } = await supabase
        .from('topics')
        .select('id')
        .eq('parent_topic_id', topicId);

      if (childrenError) throw childrenError;

      if (children && children.length > 0) {
        toast({
          title: 'Não é possível excluir',
          description: 'Este tópico possui subtópicos. Exclua os subtópicos primeiro.',
          variant: 'destructive',
        });
        return false;
      }

      // Excluir questões relacionadas primeiro
      const { error: questionsError } = await supabase
        .from('questions')
        .delete()
        .eq('topic_id', topicId);

      if (questionsError) throw questionsError;

      // Excluir o tópico
      const { error: topicError } = await supabase
        .from('topics')
        .delete()
        .eq('id', topicId);

      if (topicError) throw topicError;

      toast({
        title: 'Tópico excluído',
        description: 'O tópico foi excluído com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('Erro ao excluir tópico:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o tópico.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    updateTopicTitle,
    deleteTopic,
  };
}
