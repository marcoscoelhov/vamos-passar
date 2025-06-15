
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { FileText } from 'lucide-react';
import { Course } from '@/types/course';
import { TopicHierarchyManager } from './TopicHierarchyManager';
import { DocumentImporter } from './DocumentImporter';
import { TopicSuggestions } from './TopicSuggestions';
import { TopicPreviewDialog } from './TopicPreviewDialog';
import { useTopics } from '@/hooks/useTopics';
import { AccessDeniedCard } from './AccessDeniedCard';

interface TopicManagementProps {
  course: Course;
  isAdmin: boolean;
  onContentAdded: () => void;
}

interface SuggestedTopic {
  title: string;
  content: string;
  level: number;
}

export function TopicManagement({ course, isAdmin, onContentAdded }: TopicManagementProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([]);
  const [previewTopic, setPreviewTopic] = useState<SuggestedTopic | null>(null);
  const { addTopic } = useTopics();

  const handleTopicAdded = () => {
    setRefreshKey(prev => prev + 1);
    onContentAdded();
  };

  const handleContentExtracted = (extractedContent: string, suggestions: SuggestedTopic[] = []) => {
    setSuggestedTopics(suggestions);
  };

  const handleCreateTopicFromSuggestion = async (suggestion: SuggestedTopic) => {
    try {
      await addTopic(
        course.id,
        { title: suggestion.title, content: suggestion.content },
        isAdmin,
        undefined
      );
      setSuggestedTopics(prev => prev.filter(s => s.title !== suggestion.title));
      handleTopicAdded();
    } catch (error) {
      console.error('Error creating topic from suggestion:', error);
    }
  };
  
  if (!isAdmin) {
    return <AccessDeniedCard />;
  }

  return (
    <>
      <div className="space-y-6">
        <DocumentImporter onContentExtracted={handleContentExtracted} />
        
        <TopicSuggestions
          suggestions={suggestedTopics}
          onCreateTopic={handleCreateTopicFromSuggestion}
          onPreviewTopic={setPreviewTopic}
        />

        <TopicHierarchyManager 
          key={refreshKey}
          course={course} 
          isAdmin={isAdmin}
          onTopicUpdated={handleTopicAdded}
        />
        
        <TopicPreviewDialog 
          topic={previewTopic} 
          onClose={() => setPreviewTopic(null)} 
        />
      </div>

      <ScrollToTop />
    </>
  );
}
