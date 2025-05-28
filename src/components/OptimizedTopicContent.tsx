
import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Topic } from '@/types/course';
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary';
import { OptimizedLoadingSkeleton } from '@/components/OptimizedLoadingSkeleton';
import { OptimizedEmptyState } from '@/components/OptimizedEmptyState';
import { logger } from '@/utils/logger';
import { FilePlus } from 'lucide-react';

interface OptimizedTopicContentProps {
  topic: Topic | null;
  isLoading: boolean;
  onEdit?: () => void;
}

export const OptimizedTopicContent = React.memo(function OptimizedTopicContent({
  topic,
  isLoading,
  onEdit
}: OptimizedTopicContentProps) {
  const hasContent = useMemo(() => 
    topic && topic.content && topic.content.trim() !== '', 
    [topic]
  );

  if (isLoading) {
    return <OptimizedLoadingSkeleton variant="content" />;
  }

  if (!topic) {
    return (
      <OptimizedEmptyState
        title="Nenhum tópico selecionado"
        description="Selecione um tópico na barra lateral para visualizar seu conteúdo"
        icon={<FilePlus className="w-12 h-12" />}
      />
    );
  }

  if (!hasContent) {
    return (
      <OptimizedEmptyState
        title="Tópico sem conteúdo"
        description="Este tópico não possui conteúdo para exibir"
        action={onEdit ? {
          label: "Adicionar conteúdo",
          onClick: onEdit
        } : undefined}
      />
    );
  }

  return (
    <SectionErrorBoundary sectionName="Conteúdo do tópico">
      <Card className="p-6">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-2xl font-bold mb-4">{topic.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: topic.content }} />
        </div>
      </Card>
    </SectionErrorBoundary>
  );
});
