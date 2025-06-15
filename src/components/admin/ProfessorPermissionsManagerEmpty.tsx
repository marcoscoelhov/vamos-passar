
import React from 'react';
import { Card } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export function ProfessorPermissionsManagerEmpty() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Permissões</h2>
        <p className="text-gray-600 mt-1">Controle as permissões dos professores</p>
      </div>

      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Sistema de Permissões
        </h3>
        <p className="text-gray-600">
          O sistema de permissões para professores será implementado em breve.
        </p>
      </Card>
    </div>
  );
}
