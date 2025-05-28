
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Highlighter, X } from 'lucide-react';

interface HighlightCreationModalProps {
  selectedText: string;
  note: string;
  isAdding: boolean;
  onNoteChange: (note: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const HighlightCreationModal = React.memo(function HighlightCreationModal({
  selectedText,
  note,
  isAdding,
  onNoteChange,
  onSave,
  onCancel,
}: HighlightCreationModalProps) {
  return (
    <Card className="fixed bottom-4 right-4 p-4 shadow-lg z-50 w-80 animate-fade-in">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Highlighter className="w-4 h-4 text-yellow-600" />
            <span className="font-medium">Adicionar Destaque</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isAdding}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-sm bg-yellow-50 p-2 rounded border max-h-20 overflow-y-auto">
          "{selectedText}"
        </div>
        
        <Textarea
          placeholder="Adicione uma nota (opcional)"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          className="min-h-[60px]"
          disabled={isAdding}
        />
        
        <div className="flex gap-2">
          <Button 
            onClick={onSave} 
            size="sm" 
            className="flex-1"
            disabled={isAdding}
          >
            {isAdding ? 'Salvando...' : 'Salvar Destaque'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onCancel}
            disabled={isAdding}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </Card>
  );
});
