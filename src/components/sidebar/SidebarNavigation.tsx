
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Topic } from '@/types/course';

interface SidebarNavigationProps {
  currentTopicIndex: number;
  flatTopicsLength: number;
  currentTopic: Topic | null;
  onGoToPrevious: () => void;
  onGoToNext: () => void;
}

export function SidebarNavigation({ 
  currentTopicIndex, 
  flatTopicsLength, 
  currentTopic, 
  onGoToPrevious, 
  onGoToNext 
}: SidebarNavigationProps) {
  const showAdvanceNote = currentTopicIndex < flatTopicsLength - 1 && 
                         currentTopic && 
                         !currentTopic.completed;

  return (
    <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-gray-200">
      <div className="flex justify-between gap-2">
        <Button
          onClick={onGoToPrevious}
          disabled={currentTopicIndex <= 0}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 flex-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>
        
        <Button
          onClick={onGoToNext}
          disabled={currentTopicIndex >= flatTopicsLength - 1}
          size="sm"
          className="flex items-center gap-2 flex-1"
        >
          <span className="hidden sm:inline">Próximo</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      
      {showAdvanceNote && (
        <div className="text-xs text-gray-500 text-center mt-2">
          Avançar marcará este tópico como concluído
        </div>
      )}
    </div>
  );
}
