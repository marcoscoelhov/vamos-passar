
import React, { useCallback } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronRight as ChevronRightIcon, BookOpen, FileText } from 'lucide-react';
import { Topic } from '@/types/course';
import { cn } from '@/lib/utils';

interface TopicItemProps {
  topic: Topic;
  index: number;
  isCurrentTopic: boolean;
  expandedTopics: Set<string>;
  onTopicClick: (topic: Topic) => void;
  onToggleComplete: (topicId: string, completed: boolean) => void;
  onToggleExpanded: (topicId: string) => void;
}

export const TopicItem = React.memo(function TopicItem({ 
  topic, 
  index, 
  isCurrentTopic, 
  expandedTopics, 
  onTopicClick, 
  onToggleComplete, 
  onToggleExpanded 
}: TopicItemProps) {
  const hasChildren = topic.children && topic.children.length > 0;
  const isExpanded = expandedTopics.has(topic.id);
  const indentLevel = topic.level;

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
          "group relative flex items-center rounded-xl transition-all duration-200 cursor-pointer",
          "hover:bg-white hover:shadow-md border border-transparent",
          isCurrentTopic && "bg-white shadow-md border-blue-200 ring-1 ring-blue-100",
          !isCurrentTopic && "hover:border-gray-200"
        )}
        style={{ marginLeft: `${indentLevel * 16}px` }}
      >
        {/* Background gradient for current topic */}
        {isCurrentTopic && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent rounded-xl opacity-50" />
        )}
        
        {/* Left border indicator for current topic */}
        {isCurrentTopic && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r" />
        )}

        <div className="relative flex items-center w-full p-4">
          {/* Expand/Collapse button */}
          {hasChildren && (
            <button
              onClick={handleToggleExpanded}
              className={cn(
                "mr-3 p-1 rounded-lg transition-all duration-200 flex-shrink-0",
                "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
                isCurrentTopic && "text-blue-500 hover:text-blue-600"
              )}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
          )}
          
          {/* Topic icon */}
          <div className={cn(
            "mr-3 p-2 rounded-lg transition-all duration-200 flex-shrink-0",
            isCurrentTopic 
              ? "bg-blue-100 text-blue-600" 
              : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500"
          )}>
            {hasChildren ? (
              <BookOpen className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
          </div>
          
          {/* Content area */}
          <div 
            className="flex-1 min-w-0 mr-3"
            onClick={handleTopicClick}
          >
            <div className={cn(
              "font-medium transition-colors duration-200 truncate",
              isCurrentTopic 
                ? "text-blue-900" 
                : "text-gray-900 group-hover:text-blue-700"
            )}>
              {topic.level === 0 && `${index + 1}. `}
              {topic.title}
            </div>
            {topic.questions && topic.questions.length > 0 && (
              <div className={cn(
                "text-xs mt-1 transition-colors duration-200",
                isCurrentTopic 
                  ? "text-blue-600" 
                  : "text-gray-500 group-hover:text-blue-500"
              )}>
                {topic.questions.length} questão(ões) disponíveis
              </div>
            )}
          </div>
          
          {/* Completion checkbox */}
          <button
            onClick={handleToggleComplete}
            className={cn(
              "p-1 rounded-lg transition-all duration-200 flex-shrink-0",
              "hover:bg-gray-100",
              topic.completed && "hover:bg-green-50"
            )}
          >
            {topic.completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className={cn(
                "w-5 h-5 transition-colors duration-200",
                isCurrentTopic 
                  ? "text-blue-400" 
                  : "text-gray-400 group-hover:text-blue-400"
              )} />
            )}
          </button>
        </div>
      </div>
      
      {/* Children topics */}
      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-1">
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
