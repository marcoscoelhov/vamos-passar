
import React, { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Topic } from '@/types/course';
import { TopicContentSkeleton } from '@/components/TopicContentSkeleton';
import { logger } from '@/utils/logger';

// Lazy load HighlightableContent
const HighlightableContent = React.lazy(() => 
  import('@/components/HighlightableContent').then(module => {
    logger.debug('HighlightableContent component loaded');
    return { default: module.HighlightableContent };
  }).catch(error => {
    logger.error('Error loading HighlightableContent component', error);
    throw error;
  })
);

interface TopicContentSectionProps {
  currentTopic: Topic;
  userId?: string;
}

export const TopicContentSection = React.memo(function TopicContentSection({
  currentTopic,
  userId
}: TopicContentSectionProps) {
  return (
    <Card className="p-8 mb-8">
      <Suspense fallback={<TopicContentSkeleton />}>
        <HighlightableContent 
          content={currentTopic.content}
          topicId={currentTopic.id}
          userId={userId}
        />
      </Suspense>
    </Card>
  );
});
