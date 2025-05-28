
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Edit, X } from 'lucide-react';
import { Highlight } from '@/types/course';

interface HighlightItemProps {
  highlight: Highlight;
  isEditing: boolean;
  editingNote: string;
  isUpdating: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onNoteChange: (note: string) => void;
}

export const HighlightItem = React.memo(function HighlightItem({
  highlight,
  isEditing,
  editingNote,
  isUpdating,
  isDeleting,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onNoteChange,
}: HighlightItemProps) {
  return (
    <div className="border-l-4 border-yellow-400 pl-4 py-2">
      <div className="bg-yellow-50 p-3 rounded text-sm">
        "{highlight.highlightedText}"
      </div>
      
      {isEditing ? (
        <div className="mt-2 space-y-2">
          <Textarea
            value={editingNote}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Adicione uma nota..."
            className="min-h-[60px]"
            disabled={isUpdating}
          />
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={onSave}
              disabled={isUpdating}
            >
              {isUpdating ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onCancel}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <>
          {highlight.note && (
            <div className="mt-2 flex items-start gap-2 text-sm text-gray-600">
              <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{highlight.note}</span>
            </div>
          )}
          
          <div className="mt-2 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              disabled={isUpdating || isDeleting}
            >
              <Edit className="w-3 h-3 mr-1" />
              Editar nota
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700"
              disabled={isUpdating || isDeleting}
            >
              <X className="w-3 h-3 mr-1" />
              {isDeleting ? 'Removendo...' : 'Remover'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
});
