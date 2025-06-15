
import React from 'react';
import { Card } from '@/components/ui/card';
import { FileSpreadsheet } from 'lucide-react';

export function CourseReportsSectionEmpty() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Relatórios do Curso</h2>
        <p className="text-gray-600 mt-1">Visualize relatórios detalhados</p>
      </div>

      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileSpreadsheet className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Relatórios Avançados
        </h3>
        <p className="text-gray-600">
          Sistema de relatórios em desenvolvimento.
        </p>
      </Card>
    </div>
  );
}
