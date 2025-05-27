
import { useState, useCallback } from 'react';
import { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useToast } from '@/hooks/use-toast';
import { Topic } from '@/types/course';

interface UseDragAndDropProps {
  topics: Topic[];
  onReorder: (topics: Topic[]) => Promise<boolean>;
  onMoveToParent: (topicId: string, newParentId: string | null, newLevel: number) => Promise<boolean>;
}

export function useDragAndDrop({ topics, onReorder, onMoveToParent }: UseDragAndDropProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Aqui podemos adicionar lógica para mostrar indicadores visuais
    console.log('Drag over:', event);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setIsDragging(false);

    if (!over || active.id === over.id) {
      return;
    }

    try {
      const activeId = active.id as string;
      const overId = over.id as string;

      // Função para encontrar um tópico por ID recursivamente
      const findTopic = (topics: Topic[], id: string): Topic | null => {
        for (const topic of topics) {
          if (topic.id === id) return topic;
          if (topic.children) {
            const found = findTopic(topic.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      // Função para encontrar o pai de um tópico
      const findParent = (topics: Topic[], targetId: string, parent: Topic | null = null): Topic | null => {
        for (const topic of topics) {
          if (topic.id === targetId) return parent;
          if (topic.children) {
            const found = findParent(topic.children, targetId, topic);
            if (found !== null) return found;
          }
        }
        return null;
      };

      const activeTopic = findTopic(topics, activeId);
      const overTopic = findTopic(topics, overId);

      if (!activeTopic || !overTopic) return;

      // Se o tópico está sendo movido para dentro de outro tópico (mudança de hierarquia)
      if (overId.startsWith('drop-zone-')) {
        const newParentId = overId.replace('drop-zone-', '');
        const newParent = newParentId === 'root' ? null : findTopic(topics, newParentId);
        const newLevel = newParent ? newParent.level + 1 : 0;

        await onMoveToParent(activeId, newParentId === 'root' ? null : newParentId, newLevel);
      } else {
        // Reordenação dentro do mesmo nível
        const activeParent = findParent(topics, activeId);
        const overParent = findParent(topics, overId);

        if (activeParent?.id === overParent?.id) {
          // Mesmo nível - apenas reordenar
          const flattenTopics = (topics: Topic[]): Topic[] => {
            const result: Topic[] = [];
            topics.forEach(topic => {
              result.push(topic);
              if (topic.children) {
                result.push(...flattenTopics(topic.children));
              }
            });
            return result;
          };

          const flatTopics = flattenTopics(topics);
          const oldIndex = flatTopics.findIndex(t => t.id === activeId);
          const newIndex = flatTopics.findIndex(t => t.id === overId);

          if (oldIndex !== -1 && newIndex !== -1) {
            const reorderedTopics = arrayMove(flatTopics, oldIndex, newIndex);
            await onReorder(reorderedTopics);
          }
        }
      }

      toast({
        title: 'Tópico movido',
        description: 'A hierarquia foi atualizada com sucesso.',
      });

    } catch (error) {
      console.error('Erro ao mover tópico:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível mover o tópico.',
        variant: 'destructive',
      });
    }
  }, [topics, onReorder, onMoveToParent, toast]);

  return {
    activeId,
    isDragging,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
