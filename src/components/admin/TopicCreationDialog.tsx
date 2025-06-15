
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ManualTopicForm } from './ManualTopicForm';
import { Course, Topic } from '@/types/course';

interface TopicCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  isAdmin: boolean;
  onTopicAdded: () => void;
  parentTopicId?: string | null;
}

function findTopic(topics: Topic[], topicId: string): Topic | null {
  for (const topic of topics) {
    if (topic.id === topicId) {
      return topic;
    }
    if (topic.children) {
      const found = findTopic(topic.children, topicId);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function TopicCreationDialog({
  open,
  onOpenChange,
  course,
  isAdmin,
  onTopicAdded,
  parentTopicId,
}: TopicCreationDialogProps) {
  
  const parentTopic = parentTopicId ? findTopic(course.topics, parentTopicId) : null;
  
  const handleTopicCreated = () => {
    onTopicAdded();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {parentTopicId ? 'Adicionar Subtópico' : 'Criar Novo Tópico'}
          </DialogTitle>
          <DialogDescription>
            {parentTopicId 
              ? `Criando um subtópico para "${parentTopic?.title}".`
              : 'Preencha os detalhes para criar um novo tópico principal no curso.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-2">
            <ManualTopicForm
              course={course}
              isAdmin={isAdmin}
              onTopicAdded={handleTopicCreated}
              initialParentTopicId={parentTopicId || undefined}
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
