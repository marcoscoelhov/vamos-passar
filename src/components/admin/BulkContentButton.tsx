
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus } from 'lucide-react';
import { useCourses } from '@/hooks/useCourses';
import { Course } from '@/types/course';

interface BulkContentButtonProps {
  course: Course;
  onContentAdded: () => void;
}

export function BulkContentButton({ course, onContentAdded }: BulkContentButtonProps) {
  const { addBulkContent, isLoading } = useCourses();

  const handleAddBulkContent = async () => {
    try {
      await addBulkContent(course.id);
      onContentAdded();
    } catch (error) {
      console.error('Error adding bulk content:', error);
    }
  };

  return (
    <Button
      onClick={handleAddBulkContent}
      disabled={isLoading}
      className="w-full mb-6"
      size="lg"
    >
      <BookOpen className="w-5 h-5 mr-2" />
      {isLoading ? 'Adicionando Conteúdo...' : 'Adicionar Conteúdo Completo de Direito'}
    </Button>
  );
}
