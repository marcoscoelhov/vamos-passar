
import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface QuestionFormHeaderProps {
  isAdmin: boolean;
}

export function QuestionFormHeader({ isAdmin }: QuestionFormHeaderProps) {
  if (!isAdmin) {
    return (
      <Card className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
        <p className="text-gray-600">
          Apenas administradores podem adicionar novas questões.
        </p>
      </Card>
    );
  }

  return null;
}
