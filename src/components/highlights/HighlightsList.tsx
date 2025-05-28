
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Highlighter } from 'lucide-react';
import { Highlight } from '@/types/course';
import { HighlightItem } from './HighlightItem';

interface HighlightsListProps {
  highlights: Highlight[];
  editingHighlight: string | null;
  editingNote: string;
  onEditStart: (highlight: Highlight) => void;
  onEditSave: (highlightId: string) => void;
  onEditCancel: () => void;
  onEditNoteChange: (note: string) => void;
  onDelete: (highlightId: string) => void;
}

export function HighlightsList({
  highlights,
  editingHighlight,
  editingNote,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditNoteChange,
  onDelete,
}: HighlightsListProps) {
  if (highlights.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 pt-12 border-t border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <Highlighter className="w-5 h-5 text-amber-600" />
        <h3 className="text-xl font-serif font-semibold text-gray-900">Seus Destaques</h3>
        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
          {highlights.length}
        </Badge>
      </div>
      
      <div className="space-y-6">
        {highlights.map((highlight) => (
          <HighlightItem
            key={highlight.id}
            highlight={highlight}
            isEditing={editingHighlight === highlight.id}
            editingNote={editingNote}
            onEditStart={() => onEditStart(highlight)}
            onEditSave={() => onEditSave(highlight.id)}
            onEditCancel={onEditCancel}
            onEditNoteChange={onEditNoteChange}
            onDelete={() => onDelete(highlight.id)}
          />
        ))}
      </div>
    </div>
  );
}
