
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Edit, X } from 'lucide-react';
import { Highlight } from '@/types/course';

interface HighlightItemProps {
  highlight: Highlight;
  isEditing: boolean;
  editingNote: string;
  onEditStart: () => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditNoteChange: (note: string) => void;
  onDelete: () => void;
}

export function HighlightItem({
  highlight,
  isEditing,
  editingNote,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditNoteChange,
  onDelete,
}: HighlightItemProps) {
  return (
    <div className="border-l-3 border-amber-200 pl-6 py-3">
      <div className="bg-amber-50 p-4 rounded border border-amber-100 text-gray-800 font-serif leading-relaxed">
        "{highlight.highlightedText}"
      </div>
      
      {isEditing ? (
        <div className="mt-3 space-y-3">
          <Textarea
            value={editingNote}
            onChange={(e) => onEditNoteChange(e.target.value)}
            placeholder="Adicione uma nota..."
            className="min-h-[60px] border-gray-200"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={onEditSave} className="bg-amber-600 hover:bg-amber-700">
              Salvar
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onEditCancel}
              className="border-gray-200"
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <>
          {highlight.note && (
            <div className="mt-3 flex items-start gap-3 text-gray-600">
              <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
              <span className="text-sm leading-relaxed">{highlight.note}</span>
            </div>
          )}
          
          <div className="mt-3 flex gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditStart}
              className="text-xs text-gray-500 hover:text-gray-700 p-1 h-auto"
            >
              <Edit className="w-3 h-3 mr-1" />
              Editar nota
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-xs text-red-500 hover:text-red-700 p-1 h-auto"
            >
              <X className="w-3 h-3 mr-1" />
              Remover
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
