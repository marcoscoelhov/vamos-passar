
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

interface QuestionFormActionsProps {
  isLoading: boolean;
  isFormValid: boolean;
}

export function QuestionFormActions({ isLoading, isFormValid }: QuestionFormActionsProps) {
  return (
    <Button
      type="submit"
      disabled={isLoading || !isFormValid}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Adicionando...
        </>
      ) : (
        <>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Questão
        </>
      )}
    </Button>
  );
}
