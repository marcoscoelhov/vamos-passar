
import React, { useCallback } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';
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
