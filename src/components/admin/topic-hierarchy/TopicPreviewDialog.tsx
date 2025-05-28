
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Topic } from '@/types/course';

interface TopicPreviewDialogProps {
  topic: Topic | null;
  onClose: () => void;
}

export const TopicPreviewDialog: React.FC<TopicPreviewDialogProps> = ({
  topic,
  onClose,
}) => {
  return (
    <AlertDialog open={!!topic} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>{topic?.title}</AlertDialogTitle>
        </AlertDialogHeader>
        {topic && (
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: topic.content }}
          />
        )}
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>
            Fechar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
