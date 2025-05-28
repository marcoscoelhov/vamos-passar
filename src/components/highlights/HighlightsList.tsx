
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Highlighter } from 'lucide-react';
import { Highlight } from '@/types/course';
import { HighlightItem } from './HighlightItem';

interface HighlightsListProps {
  highlights: Highlight[];
  isLoading: boolean;
  editingHighlight: string | null;
  editingNote: string;
  isUpdating: boolean;
  isDeleting: boolean;
  onEditHighlight: (highlight: Highlight) => void;
  onSaveEdit: (highlightId: string) => void;
  onCancelEdit: () => void;
  onDeleteHighlight: (highlightId: string) => void;
  onEditingNoteChange: (note: string) => void;
}

export const HighlightsList = React.memo(function HighlightsList({
  highlights,
  isLoading,
  editingHighlight,
  editingNote,
  isUpdating,
  isDeleting,
  onEditHighlight,
  onSaveEdit,
  onCancelEdit,
  onDeleteHighlight,
  onEditingNoteChange,
}: HighlightsListProps) {
  if (highlights.length === 0) return null;

  return (
    <Card className="p-6 mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Highlighter className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-semibold">Seus Destaques</h3>
        <Badge variant="outline">{highlights.length}</Badge>
        {isLoading && (
          <span className="text-sm text-gray-500">Carregando...</span>
        )}
      </div>
      
      <div className="space-y-4">
        {highlights.map((highlight) => (
          <HighlightItem
            key={highlight.id}
            highlight={highlight}
            isEditing={editingHighlight === highlight.id}
            editingNote={editingNote}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            onEdit={() => onEditHighlight(highlight)}
            onSave={() => onSaveEdit(highlight.id)}
            onCancel={onCancelEdit}
            onDelete={() => onDeleteHighlight(highlight.id)}
            onNoteChange={onEditingNoteChange}
          />
        ))}
      </div>
    </Card>
  );
});
