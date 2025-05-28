
import React, { useState, Suspense } from 'react';
import { Course } from '@/types/course';
import { useTopics } from '@/hooks/useTopics';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { logger } from '@/utils/logger';

// Lazy load heavy components
const DocumentImporter = React.lazy(() => 
  import('./DocumentImporter').then(module => {
    logger.debug('DocumentImporter component loaded');
    return { default: module.DocumentImporter };
  }).catch(error => {
    logger.error('Error loading DocumentImporter component', error);
    throw error;
  })
);

const TopicSuggestions = React.lazy(() => 
  import('./TopicSuggestions').then(module => {
    logger.debug('TopicSuggestions component loaded');
    return { default: module.TopicSuggestions };
  }).catch(error => {
    logger.error('Error loading TopicSuggestions component', error);
    throw error;
  })
);

const ManualTopicForm = React.lazy(() => 
  import('./ManualTopicForm').then(module => {
    logger.debug('ManualTopicForm component loaded');
    return { default: module.ManualTopicForm };
  }).catch(error => {
    logger.error('Error loading ManualTopicForm component', error);
    throw error;
  })
);

const TopicPreviewDialog = React.lazy(() => 
  import('./TopicPreviewDialog').then(module => {
    logger.debug('TopicPreviewDialog component loaded');
    return { default: module.TopicPreviewDialog };
  }).catch(error => {
    logger.error('Error loading TopicPreviewDialog component', error);
    throw error;
  })
);

const AccessDeniedCard = React.lazy(() => 
  import('./AccessDeniedCard').then(module => {
    logger.debug('AccessDeniedCard component loaded');
    return { default: module.AccessDeniedCard };
  }).catch(error => {
    logger.error('Error loading AccessDeniedCard component', error);
    throw error;
  })
);

interface TopicFormProps {
  course: Course;
  isAdmin: boolean;
  onTopicAdded: () => void;
}

interface SuggestedTopic {
  title: string;
  content: string;
  level: number;
}

export function TopicForm({ course, isAdmin, onTopicAdded }: TopicFormProps) {
  const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([]);
  const [previewTopic, setPreviewTopic] = useState<SuggestedTopic | null>(null);
  const { addTopic } = useTopics();

  const handleContentExtracted = (extractedContent: string, suggestions: SuggestedTopic[] = []) => {
    logger.debug('Content extracted for topic suggestions', {
      contentLength: extractedContent.length,
      suggestionsCount: suggestions.length
    });
    setSuggestedTopics(suggestions);
  };

  const handleCreateTopicFromSuggestion = async (suggestion: SuggestedTopic) => {
    try {
      logger.debug('Creating topic from suggestion', { title: suggestion.title });
      await addTopic(
        course.id,
        { title: suggestion.title, content: suggestion.content },
        isAdmin,
        undefined // Por enquanto, criar como tópico principal
      );
      
      // Remover da lista de sugestões
      setSuggestedTopics(prev => prev.filter(s => s !== suggestion));
      onTopicAdded();
      logger.info('Topic created successfully from suggestion', { title: suggestion.title });
    } catch (error) {
      logger.error('Error creating topic from suggestion', { error, title: suggestion.title });
    }
  };

  if (!isAdmin) {
    return (
      <Suspense fallback={<LoadingSkeleton variant="card" className="w-full h-32" />}>
        <AccessDeniedCard />
      </Suspense>
    );
  }

  return (
    <div className="space-y-6">
      {/* Importador de Documentos */}
      <Suspense fallback={<LoadingSkeleton variant="card" className="w-full h-48" />}>
        <DocumentImporter onContentExtracted={handleContentExtracted} />
      </Suspense>
      
      {/* Sugestões de Tópicos */}
      <Suspense fallback={<LoadingSkeleton variant="card" className="w-full h-32" />}>
        <TopicSuggestions
          suggestions={suggestedTopics}
          onCreateTopic={handleCreateTopicFromSuggestion}
          onPreviewTopic={setPreviewTopic}
        />
      </Suspense>

      {/* Formulário Manual */}
      <Suspense fallback={<LoadingSkeleton variant="card" className="w-full h-64" />}>
        <ManualTopicForm 
          course={course} 
          isAdmin={isAdmin} 
          onTopicAdded={onTopicAdded} 
        />
      </Suspense>

      {/* Preview Dialog */}
      <Suspense fallback={null}>
        <TopicPreviewDialog 
          topic={previewTopic} 
          onClose={() => setPreviewTopic(null)} 
        />
      </Suspense>
    </div>
  );
}
