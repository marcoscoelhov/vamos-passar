
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Highlighter, X } from 'lucide-react';

interface HighlightCreationModalProps {
  selectedText: string;
  note: string;
  onNoteChange: (note: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function HighlightCreationModal({
  selectedText,
  note,
  onNoteChange,
  onSave,
  onCancel,
}: HighlightCreationModalProps) {
  return (
    <Card className="fixed bottom-6 right-6 p-5 shadow-xl z-50 w-80 bg-white border border-gray-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Highlighter className="w-4 h-4 text-amber-600" />
            <span className="font-medium text-gray-900">Adicionar Destaque</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-sm bg-amber-50 p-3 rounded border border-amber-100 max-h-20 overflow-y-auto">
          "{selectedText}"
        </div>
        
        <Textarea
          placeholder="Adicione uma nota (opcional)"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          className="min-h-[60px] border-gray-200 focus:border-amber-300 focus:ring-amber-100"
        />
        
        <div className="flex gap-2">
          <Button onClick={onSave} size="sm" className="flex-1 bg-amber-600 hover:bg-amber-700">
            Salvar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onCancel}
            className="border-gray-200"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </Card>
  );
}
