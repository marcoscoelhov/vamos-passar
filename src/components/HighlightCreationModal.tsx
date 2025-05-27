
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Highlighter, X } from 'lucide-react';

interface HighlightCreationModalProps {
  selectedText: string;
  onSave: (note: string) => void;
  onCancel: () => void;
}

export function HighlightCreationModal({ selectedText, onSave, onCancel }: HighlightCreationModalProps) {
  const [note, setNote] = useState('');

  const handleSave = () => {
    onSave(note);
    setNote('');
  };

  return (
    <Card className="fixed bottom-4 right-4 p-4 shadow-lg z-50 w-80">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Highlighter className="w-4 h-4 text-yellow-600" />
            <span className="font-medium">Adicionar Destaque</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-sm bg-yellow-50 p-2 rounded border">
          "{selectedText}"
        </div>
        
        <Textarea
          placeholder="Adicione uma nota (opcional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-[60px]"
        />
        
        <div className="flex gap-2">
          <Button onClick={handleSave} size="sm" className="flex-1">
            Salvar Destaque
          </Button>
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </Card>
  );
}
