
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Topic } from '@/types/course';

interface SidebarNavigationProps {
  currentTopicIndex: number;
  flatTopics: Topic[];
  currentTopic: Topic | null;
  onPreviousTopic: () => Promise<void>;
  onNextTopic: () => Promise<void>;
}

export const SidebarNavigation = React.memo(function SidebarNavigation({
  currentTopicIndex,
  flatTopics,
  currentTopic,
  onPreviousTopic,
  onNextTopic
}: SidebarNavigationProps) {
  const handlePreviousTopic = useCallback(async () => {
    await onPreviousTopic();
  }, [onPreviousTopic]);

  const handleNextTopic = useCallback(async () => {
    await onNextTopic();
  }, [onNextTopic]);

  return (
    <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-gray-200">
      <div className="flex justify-between gap-2">
        <Button
          onClick={handlePreviousTopic}
          disabled={currentTopicIndex <= 0}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 flex-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>
        
        <Button
          onClick={handleNextTopic}
          disabled={currentTopicIndex >= flatTopics.length - 1}
          size="sm"
          className="flex items-center gap-2 flex-1"
        >
          <span className="hidden sm:inline">Próximo</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      
      {currentTopicIndex < flatTopics.length - 1 && currentTopic && !currentTopic.completed && (
        <div className="text-xs text-gray-500 text-center mt-2">
          Avançar marcará este tópico como concluído
        </div>
      )}
    </div>
  );
});
