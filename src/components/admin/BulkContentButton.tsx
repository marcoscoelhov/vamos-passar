
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { useCourses } from '@/hooks/useCourses';
import { Course } from '@/types/course';
import { logger } from '@/utils/logger';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary';

interface BulkContentButtonProps {
  course: Course;
  onContentAdded: () => void;
}

export const BulkContentButton = React.memo(function BulkContentButton({ 
  course, 
  onContentAdded 
}: BulkContentButtonProps) {
  const { addBulkContent, isLoading } = useCourses();

  const handleAddBulkContent = async () => {
    try {
      logger.debug('Adding bulk content to course', { courseId: course.id });
      await addBulkContent(course.id);
      logger.info('Bulk content added successfully', { courseId: course.id });
      onContentAdded();
    } catch (error) {
      logger.error('Error adding bulk content', { courseId: course.id, error });
    }
  };

  return (
    <SectionErrorBoundary sectionName="Botão de conteúdo em massa">
      <Button
        onClick={handleAddBulkContent}
        disabled={isLoading}
        className="w-full mb-6"
        size="lg"
      >
        {isLoading ? (
          <LoadingSpinner size="sm" className="mr-2" />
        ) : (
          <BookOpen className="w-5 h-5 mr-2" />
        )}
        {isLoading ? 'Adicionando Conteúdo...' : 'Adicionar Conteúdo Completo de Direito'}
      </Button>
    </SectionErrorBoundary>
  );
});
