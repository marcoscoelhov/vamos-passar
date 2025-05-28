
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Topic } from '@/types/course';

export function useTopicHierarchyOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const moveTopicToParent = useCallback(async (
    topicId: string, 
    newParentId: string | null,
    newLevel: number
  ) => {
    setIsLoading(true);
    try {
      // Calcular novo order_index
      let orderQuery = supabase
        .from('topics')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1);

      if (newParentId) {
        orderQuery = orderQuery.eq('parent_topic_id', newParentId);
      } else {
        orderQuery = orderQuery.is('parent_topic_id', null);
      }

      const { data: lastTopic } = await orderQuery.single();
      const newOrderIndex = (lastTopic?.order_index || 0) + 1;

      const { error } = await supabase
        .from('topics')
        .update({
          parent_topic_id: newParentId,
          level: newLevel,
          order_index: newOrderIndex
        })
        .eq('id', topicId);

      if (error) throw error;

      toast({
        title: 'Tópico movido',
        description: 'A hierarquia do tópico foi atualizada com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('Erro ao mover tópico:', error);
      toast({
        title: 'Erro ao mover',
        description: 'Não foi possível mover o tópico.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const reorderTopics = useCallback(async (topicIds: string[]) => {
    setIsLoading(true);
    try {
      const updates = topicIds.map((id, index) => ({
        id,
        order_index: index + 1
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('topics')
          .update({ order_index: update.order_index })
          .eq('id', update.id);

        if (error) throw error;
      }

      toast({
        title: 'Ordem atualizada',
        description: 'A ordem dos tópicos foi atualizada com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('Erro ao reordenar tópicos:', error);
      toast({
        title: 'Erro ao reordenar',
        description: 'Não foi possível reordenar os tópicos.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const duplicateTopic = useCallback(async (
    originalTopic: Topic,
    courseId: string,
    newParentId?: string
  ) => {
    setIsLoading(true);
    try {
      // Calcular order_index para o novo tópico
      let orderQuery = supabase
        .from('topics')
        .select('order_index')
        .eq('course_id', courseId)
        .order('order_index', { ascending: false })
        .limit(1);

      if (newParentId) {
        orderQuery = orderQuery.eq('parent_topic_id', newParentId);
      } else {
        orderQuery = orderQuery.is('parent_topic_id', null);
      }

      const { data: lastTopic } = await orderQuery.single();
      const newOrderIndex = (lastTopic?.order_index || 0) + 1;

      const { data: newTopic, error } = await supabase
        .from('topics')
        .insert({
          course_id: courseId,
          title: `${originalTopic.title} (Cópia)`,
          content: originalTopic.content,
          parent_topic_id: newParentId || originalTopic.parentTopicId || null,
          level: newParentId ? originalTopic.level : originalTopic.level,
          order_index: newOrderIndex
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Tópico duplicado',
        description: 'O tópico foi duplicado com sucesso.',
      });

      return newTopic;
    } catch (error) {
      console.error('Erro ao duplicar tópico:', error);
      toast({
        title: 'Erro ao duplicar',
        description: 'Não foi possível duplicar o tópico.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    moveTopicToParent,
    reorderTopics,
    duplicateTopic,
  };
}
