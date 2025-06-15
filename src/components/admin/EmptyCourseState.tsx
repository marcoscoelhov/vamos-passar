
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyCourseStateProps {
  hasFilters: boolean;
  onCreateCourse: () => void;
}

export function EmptyCourseState({ hasFilters, onCreateCourse }: EmptyCourseStateProps) {
  return (
    <Card className="p-12 text-center">
      <div className="text-slate-400 text-6xl mb-4">📚</div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        Nenhum curso encontrado
      </h3>
      <p className="text-slate-600 mb-4">
        {hasFilters
          ? 'Tente ajustar os filtros para encontrar cursos.'
          : 'Comece criando seu primeiro curso.'
        }
      </p>
      {!hasFilters && (
        <Button onClick={onCreateCourse}>
          <Plus className="w-4 h-4 mr-2" />
          Criar Primeiro Curso
        </Button>
      )}
    </Card>
  );
}
