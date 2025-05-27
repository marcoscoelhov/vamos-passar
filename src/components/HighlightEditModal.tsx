
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Edit, X } from 'lucide-react';
import { Highlight } from '@/types/course';

interface HighlightEditModalProps {
  highlight: Highlight;
  onSave: (highlightId: string, note: string) => void;
  onDelete: (highlightId: string) => void;
  onCancel: () => void;
}

export function HighlightEditModal({ highlight, onSave, onDelete, onCancel }: HighlightEditModalProps) {
  const [note, setNote] = useState(highlight.note || '');

  useEffect(() => {
    setNote(highlight.note || '');
  }, [highlight]);

  const handleSave = () => {
    onSave(highlight.id, note);
  };

  const handleDelete = () => {
    onDelete(highlight.id);
  };

  return (
    <Card className="fixed bottom-4 right-4 p-4 shadow-lg z-50 w-80">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Editar Destaque</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-sm bg-yellow-50 p-2 rounded border">
          "{highlight.highlightedText}"
        </div>
        
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Adicione uma nota..."
          className="min-h-[60px]"
        />
        
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} className="flex-1">
            Salvar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-3 h-3 mr-1" />
            Remover
          </Button>
        </div>
      </div>
    </Card>
  );
}
