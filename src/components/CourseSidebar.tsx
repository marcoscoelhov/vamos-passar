
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Menu, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Topic } from '@/types/course';
import { flattenTopicHierarchy } from '@/utils/dataMappers';

export function CourseSidebar() {
  const { currentCourse, currentTopic, setCurrentTopic, updateTopicProgress } = useCourse();
  const { state, toggleSidebar } = useSidebar();
  const [expandedTopics, setExpandedTopics] = React.useState<Set<string>>(new Set());

  if (!currentCourse) return null;

  const handleTopicClick = async (topic: Topic) => {
    setCurrentTopic(topic);
  };

  const handleToggleComplete = (topicId: string, completed: boolean) => {
    updateTopicProgress(topicId, !completed);
  };

  const toggleExpanded = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const flatTopics = flattenTopicHierarchy(currentCourse.topics);
  const currentTopicIndex = flatTopics.findIndex(t => t.id === currentTopic?.id);
  
  const goToPreviousTopic = async () => {
    if (currentTopicIndex > 0) {
      const previousTopic = flatTopics[currentTopicIndex - 1];
      await setCurrentTopic(previousTopic);
    }
  };

  const goToNextTopic = async () => {
    if (currentTopicIndex < flatTopics.length - 1) {
      // Auto-mark current topic as completed when advancing
      if (currentTopic && !currentTopic.completed) {
        await updateTopicProgress(currentTopic.id, true);
      }
      
      const nextTopic = flatTopics[currentTopicIndex + 1];
      await setCurrentTopic(nextTopic);
    }
  };

  const renderTopicItem = (topic: Topic, index: number) => {
    const hasChildren = topic.children && topic.children.length > 0;
    const isExpanded = expandedTopics.has(topic.id);
    const indentLevel = topic.level * 20;

    return (
      <div key={topic.id}>
        <div
          className={cn(
            "flex items-center p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50",
            currentTopic?.id === topic.id && "bg-blue-50 border border-blue-200"
          )}
          style={{ marginLeft: `${indentLevel}px` }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(topic.id);
              }}
              className="mr-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleComplete(topic.id, topic.completed);
            }}
            className="mr-3 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
          >
            {topic.completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
          
          <div 
            className="flex-1 min-w-0"
            onClick={() => handleTopicClick(topic)}
          >
            <div className="text-sm font-medium text-gray-900 truncate">
              {topic.level === 0 ? `${index + 1}. ` : ''}{topic.title}
            </div>
            {topic.questions && topic.questions.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                {topic.questions.length} questão(ões)
              </div>
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {topic.children!.map((child, childIndex) => 
              renderTopicItem(child, childIndex)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Sidebar className="border-r border-gray-200 bg-white">
        <SidebarHeader className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 truncate">
              {currentCourse.title}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0 hover:bg-gray-100 flex-shrink-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
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
            {currentCourse.topics.map((topic, index) => 
              renderTopicItem(topic, index)
            )}
          </div>

          <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between gap-2">
              <Button
                onClick={goToPreviousTopic}
                disabled={currentTopicIndex <= 0}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 flex-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Anterior</span>
              </Button>
              
              <Button
                onClick={goToNextTopic}
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
        </SidebarContent>
      </Sidebar>

      {/* Botão flutuante para mostrar sidebar quando ela está oculta */}
      {state === 'collapsed' && (
        <Button
          onClick={toggleSidebar}
          className="fixed top-20 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          size="sm"
        >
          <Menu className="w-4 h-4" />
        </Button>
      )}
    </>
  );
}
