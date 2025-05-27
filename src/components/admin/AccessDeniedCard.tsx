
import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export function AccessDeniedCard() {
  return (
    <Card className="p-6 text-center">
      <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
      <p className="text-gray-600">
        Apenas administradores podem adicionar novos tópicos.
      </p>
    </Card>
  );
}
