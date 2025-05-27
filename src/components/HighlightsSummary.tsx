
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Highlighter } from 'lucide-react';

interface HighlightsSummaryProps {
  highlightCount: number;
}

export function HighlightsSummary({ highlightCount }: HighlightsSummaryProps) {
  if (highlightCount === 0) return null;

  return (
    <Card className="p-6 mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Highlighter className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-semibold">Seus Destaques</h3>
        <Badge variant="outline">{highlightCount}</Badge>
      </div>
      
      <div className="text-sm text-gray-600">
        Clique em qualquer destaque no texto para editar ou remover a nota.
      </div>
    </Card>
  );
}
