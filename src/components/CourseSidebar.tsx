
import React, { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';
import { cn } from '@/lib/utils';

export function CourseSidebar() {
  const { currentCourse, currentTopic, setCurrentTopic, updateTopicProgress } = useCourse();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!currentCourse) return null;

  const handleTopicClick = (topic: any) => {
    setCurrentTopic(topic);
  };

  const handleToggleComplete = (topicId: string, completed: boolean) => {
    updateTopicProgress(topicId, !completed);
  };

  const currentTopicIndex = currentCourse.topics.findIndex(t => t.id === currentTopic?.id);
  
  const goToPreviousTopic = () => {
    if (currentTopicIndex > 0) {
      setCurrentTopic(currentCourse.topics[currentTopicIndex - 1]);
    }
  };

  const goToNextTopic = () => {
    if (currentTopicIndex < currentCourse.topics.length - 1) {
      setCurrentTopic(currentCourse.topics[currentTopicIndex + 1]);
    }
  };

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 truncate">
            {currentCourse.title}
          </h2>
          <SidebarTrigger onClick={() => setIsCollapsed(!isCollapsed)} />
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progresso</span>
            <span>{Math.round(currentCourse.progress)}%</span>
          </div>
          <Progress value={currentCourse.progress} className="h-2" />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <div className="space-y-2">
          {currentCourse.topics.map((topic, index) => (
            <div
              key={topic.id}
              className={cn(
                "flex items-center p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50",
                currentTopic?.id === topic.id && "bg-blue-50 border border-blue-200"
              )}
              onClick={() => handleTopicClick(topic)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleComplete(topic.id, topic.completed);
                }}
                className="mr-3 text-gray-400 hover:text-blue-600 transition-colors"
              >
                {topic.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {index + 1}. {topic.title}
                </div>
                {topic.questions && topic.questions.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {topic.questions.length} questão(ões)
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
          <Button
            onClick={goToPreviousTopic}
            disabled={currentTopicIndex <= 0}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>
          
          <Button
            onClick={goToNextTopic}
            disabled={currentTopicIndex >= currentCourse.topics.length - 1}
            size="sm"
            className="flex items-center gap-2"
          >
            Próximo
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
