
import React, { useMemo, useCallback } from 'react';
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

const TopicItem = React.memo(function TopicItem({ 
  topic, 
  index, 
  isCurrentTopic, 
  expandedTopics, 
  onTopicClick, 
  onToggleComplete, 
  onToggleExpanded 
}: {
  topic: Topic;
  index: number;
  isCurrentTopic: boolean;
  expandedTopics: Set<string>;
  onTopicClick: (topic: Topic) => void;
  onToggleComplete: (topicId: string, completed: boolean) => void;
  onToggleExpanded: (topicId: string) => void;
}) {
  const hasChildren = topic.children && topic.children.length > 0;
  const isExpanded = expandedTopics.has(topic.id);
  const indentLevel = topic.level * 20;

  const handleTopicClick = useCallback(() => {
    onTopicClick(topic);
  }, [onTopicClick, topic]);

  const handleToggleComplete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(topic.id, topic.completed);
  }, [onToggleComplete, topic.id, topic.completed]);

  const handleToggleExpanded = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpanded(topic.id);
  }, [onToggleExpanded, topic.id]);

  return (
    <div>
      <div
        className={cn(
          "flex items-center p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50",
          isCurrentTopic && "bg-blue-50 border border-blue-200"
        )}
        style={{ marginLeft: `${indentLevel}px` }}
      >
        {hasChildren && (
          <button
            onClick={handleToggleExpanded}
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
          onClick={handleToggleComplete}
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
          onClick={handleTopicClick}
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
            <TopicItem
              key={child.id}
              topic={child}
              index={childIndex}
              isCurrentTopic={child.id === topic.id}
              expandedTopics={expandedTopics}
              onTopicClick={onTopicClick}
              onToggleComplete={onToggleComplete}
              onToggleExpanded={onToggleExpanded}
            />
          )}
        </div>
      )}
    </div>
  );
});

export const CourseSidebar = React.memo(function CourseSidebar() {
  const { currentCourse, currentTopic, setCurrentTopic, updateTopicProgress } = useCourse();
  const { state, toggleSidebar } = useSidebar();
  const [expandedTopics, setExpandedTopics] = React.useState<Set<string>>(new Set());

  const flatTopics = useMemo(() => 
    currentCourse ? flattenTopicHierarchy(currentCourse.topics) : [], 
    [currentCourse?.topics]
  );

  const currentTopicIndex = useMemo(() => 
    flatTopics.findIndex(t => t.id === currentTopic?.id), 
    [flatTopics, currentTopic?.id]
  );

  const handleTopicClick = useCallback(async (topic: Topic) => {
    setCurrentTopic(topic);
  }, [setCurrentTopic]);

  const handleToggleComplete = useCallback((topicId: string, completed: boolean) => {
    updateTopicProgress(topicId, !completed);
  }, [updateTopicProgress]);

  const toggleExpanded = useCallback((topicId: string) => {
    setExpandedTopics(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(topicId)) {
        newExpanded.delete(topicId);
      } else {
        newExpanded.add(topicId);
      }
      return newExpanded;
    });
  }, []);

  const goToPreviousTopic = useCallback(async () => {
    if (currentTopicIndex > 0) {
      const previousTopic = flatTopics[currentTopicIndex - 1];
      await setCurrentTopic(previousTopic);
    }
  }, [currentTopicIndex, flatTopics, setCurrentTopic]);

  const goToNextTopic = useCallback(async () => {
    if (currentTopicIndex < flatTopics.length - 1) {
      // Auto-mark current topic as completed when advancing
      if (currentTopic && !currentTopic.completed) {
        await updateTopicProgress(currentTopic.id, true);
      }
      
      const nextTopic = flatTopics[currentTopicIndex + 1];
      await setCurrentTopic(nextTopic);
    }
  }, [currentTopicIndex, flatTopics, currentTopic, updateTopicProgress, setCurrentTopic]);

  if (!currentCourse) return null;

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
              <TopicItem
                key={topic.id}
                topic={topic}
                index={index}
                isCurrentTopic={currentTopic?.id === topic.id}
                expandedTopics={expandedTopics}
                onTopicClick={handleTopicClick}
                onToggleComplete={handleToggleComplete}
                onToggleExpanded={toggleExpanded}
              />
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
          <Menu className="w-4 w-4" />
        </Button>
      )}
    </>
  );
});
