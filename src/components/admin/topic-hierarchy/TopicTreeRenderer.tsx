
import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Topic } from '@/types/course';
import { SortableTopicItem } from './SortableTopicItem';

interface TopicTreeRendererProps {
  topics: Topic[];
  level: number;
  expandedTopics: Set<string>;
  editingTopic: string | null;
  editTitle: string;
  isSavingEdit: boolean;
  onToggleExpand: (topicId: string) => void;
  onStartEdit: (topicId: string, title: string) => void;
  onSaveEdit: (topicId: string, newTitle: string) => void;
  onCancelEdit: () => void;
  onSetEditTitle: (title: string) => void;
  onDeleteTopic: (topicId: string) => void;
  onAddSubtopic: (parentId: string) => void;
  onPreviewTopic: (topic: Topic) => void;
  onDuplicateTopic: (topic: Topic) => void;
  onFixContent: (topic: Topic) => void;
}

export const TopicTreeRenderer: React.FC<TopicTreeRendererProps> = ({
  topics,
  level = 0,
  expandedTopics,
  editingTopic,
  editTitle,
  isSavingEdit,
  onToggleExpand,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onSetEditTitle,
  onDeleteTopic,
  onAddSubtopic,
  onPreviewTopic,
  onDuplicateTopic,
  onFixContent,
}) => {
  const topicIds = topics.map(topic => topic.id);
  
  return (
    <SortableContext items={topicIds} strategy={verticalListSortingStrategy}>
      {topics.map(topic => (
        <SortableTopicItem
          key={topic.id}
          topic={topic}
          level={level}
          isExpanded={expandedTopics.has(topic.id)}
          isEditing={editingTopic === topic.id}
          editTitle={editTitle}
          isSaving={isSavingEdit}
          onToggleExpand={onToggleExpand}
          onStartEdit={onStartEdit}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onSetEditTitle={onSetEditTitle}
          onDeleteTopic={onDeleteTopic}
          onAddSubtopic={onAddSubtopic}
          onPreviewTopic={onPreviewTopic}
          onDuplicateTopic={onDuplicateTopic}
          onFixContent={onFixContent}
        >
          {topic.children && topic.children.length > 0 && (
            <TopicTreeRenderer
              topics={topic.children}
              level={level + 1}
              expandedTopics={expandedTopics}
              editingTopic={editingTopic}
              editTitle={editTitle}
              isSavingEdit={isSavingEdit}
              onToggleExpand={onToggleExpand}
              onStartEdit={onStartEdit}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onSetEditTitle={onSetEditTitle}
              onDeleteTopic={onDeleteTopic}
              onAddSubtopic={onAddSubtopic}
              onPreviewTopic={onPreviewTopic}
              onDuplicateTopic={onDuplicateTopic}
              onFixContent={onFixContent}
            />
          )}
        </SortableTopicItem>
      ))}
    </SortableContext>
  );
};
