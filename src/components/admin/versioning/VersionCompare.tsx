
import React from 'react';
import { Button } from '@/components/ui/button';
import { GitBranch } from 'lucide-react';

export function VersionCompare() {
  return (
    <div className="text-center py-8">
      <GitBranch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Comparar Versões</h3>
      <p className="text-gray-600 mb-4">
        Selecione duas versões para ver as diferenças lado a lado
      </p>
      <Button variant="outline">Selecionar Versões</Button>
    </div>
  );
}
