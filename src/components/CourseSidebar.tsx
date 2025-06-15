
import React, { useMemo, useCallback } from 'react';
import { useCourse } from '@/contexts/CourseContext';
import { Topic } from '@/types/course';
import { flattenTopicHierarchy } from '@/utils/dataMappers';
import { TopicItem } from './sidebar/TopicItem';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarNavigation } from './sidebar/SidebarNavigation';
import { CollapsedSidebarButton } from './sidebar/CollapsedSidebarButton';

interface CourseSidebarProps {
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export const CourseSidebar = React.memo(function CourseSidebar({ isMobile = false, onCloseMobile }: CourseSidebarProps) {
  const { currentCourse, currentTopic, setCurrentTopic, updateTopicProgress } = useCourse();
  const [expandedTopics, setExpandedTopics] = React.useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = React.useState(false);

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
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  }, [setCurrentTopic, isMobile, onCloseMobile]);

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

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed]);

  if (!currentCourse) return null;

  return (
    <>
      {/* Professional Sidebar */}
      <div className={`
        ${isCollapsed ? 'w-0 overflow-hidden' : 'w-80'} 
        h-screen bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 
        flex flex-col shadow-lg transition-all duration-300 ease-in-out
        ${isMobile ? 'absolute z-50' : 'relative'}
      `}>
        <SidebarHeader
          currentCourse={currentCourse}
          isMobile={isMobile}
          onCloseMobile={onCloseMobile}
          onToggleSidebar={toggleSidebar}
        />

        {/* Content with custom scrollbar */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto custom-scrollbar px-2 py-4">
            <div className="space-y-1">
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
              flatTopicsLength={flatTopics.length}
              currentTopic={currentTopic}
              onGoToPrevious={goToPreviousTopic}
              onGoToNext={goToNextTopic}
            />
          </div>
        </div>
      </div>

      <CollapsedSidebarButton
        isCollapsed={isCollapsed}
        isMobile={isMobile}
        onToggleSidebar={toggleSidebar}
      />
    </>
  );
});
