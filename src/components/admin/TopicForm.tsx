
import React, { useState } from 'react';
import { Course } from '@/types/course';
import { DocumentImporter } from './DocumentImporter';
import { TopicSuggestions } from './TopicSuggestions';
import { ManualTopicForm } from './ManualTopicForm';
import { TopicPreviewDialog } from './TopicPreviewDialog';
import { AccessDeniedCard } from './AccessDeniedCard';
import { useTopics } from '@/hooks/useTopics';

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
    setSuggestedTopics(suggestions);
  };

  const handleCreateTopicFromSuggestion = async (suggestion: SuggestedTopic) => {
    try {
      await addTopic(
        course.id,
        { title: suggestion.title, content: suggestion.content },
        isAdmin,
        undefined // Por enquanto, criar como tópico principal
      );
      
      // Remover da lista de sugestões
      setSuggestedTopics(prev => prev.filter(s => s !== suggestion));
      onTopicAdded();
    } catch (error) {
      console.error('Error creating topic from suggestion:', error);
    }
  };

  if (!isAdmin) {
    return <AccessDeniedCard />;
  }

  return (
    <div className="space-y-6">
      {/* Importador de Documentos */}
      <DocumentImporter onContentExtracted={handleContentExtracted} />
      
      {/* Sugestões de Tópicos */}
      <TopicSuggestions
        suggestions={suggestedTopics}
        onCreateTopic={handleCreateTopicFromSuggestion}
        onPreviewTopic={setPreviewTopic}
      />

      {/* Formulário Manual */}
      <ManualTopicForm 
        course={course} 
        isAdmin={isAdmin} 
        onTopicAdded={onTopicAdded} 
      />

      {/* Preview Dialog */}
      <TopicPreviewDialog 
        topic={previewTopic} 
        onClose={() => setPreviewTopic(null)} 
      />
    </div>
  );
}
