
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SuggestedTopic {
  title: string;
  content: string;
  level: number;
}

interface TopicPreviewDialogProps {
  topic: SuggestedTopic | null;
  onClose: () => void;
}

export function TopicPreviewDialog({ topic, onClose }: TopicPreviewDialogProps) {
  return (
    <Dialog open={!!topic} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{topic?.title}</DialogTitle>
        </DialogHeader>
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: topic?.content || '' }}
        />
      </DialogContent>
    </Dialog>
  );
}
