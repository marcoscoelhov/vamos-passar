
import React, { useMemo, useCallback } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';
import { useSidebar } from '@/components/ui/sidebar';
import { Topic } from '@/types/course';
import { flattenTopicHierarchy } from '@/utils/dataMappers';
import { TopicItem } from '@/components/sidebar/TopicItem';
import { SidebarNavigation } from '@/components/sidebar/SidebarNavigation';
import { SidebarFloatingButton } from '@/components/sidebar/SidebarFloatingButton';

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

          <SidebarNavigation
            currentTopicIndex={currentTopicIndex}
            flatTopics={flatTopics}
            currentTopic={currentTopic}
            onPreviousTopic={goToPreviousTopic}
            onNextTopic={goToNextTopic}
          />
        </SidebarContent>
      </Sidebar>

      {/* Botão flutuante para mostrar sidebar quando ela está oculta */}
      {state === 'collapsed' && (
        <SidebarFloatingButton onToggleSidebar={toggleSidebar} />
      )}
    </>
  );
});
