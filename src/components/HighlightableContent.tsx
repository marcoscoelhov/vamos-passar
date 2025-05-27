
import React, { useState } from 'react';
import { useHighlights } from '@/hooks/useHighlights';
import { useTextSelection } from '@/hooks/useTextSelection';
import { ContentRenderer } from './ContentRenderer';
import { HighlightCreationModal } from './HighlightCreationModal';
import { HighlightEditModal } from './HighlightEditModal';
import { HighlightsSummary } from './HighlightsSummary';

interface HighlightableContentProps {
  content: string;
  topicId: string;
  userId?: string;
}

export function HighlightableContent({ content, topicId, userId }: HighlightableContentProps) {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<string | null>(null);
  
  const { highlights, addHighlight, updateHighlight, deleteHighlight } = useHighlights(topicId, userId);
  const { selectedText, selectionRange, handleTextSelection, clearSelection } = useTextSelection(content, highlights);

  const onTextSelection = () => {
    const result = handleTextSelection();
    if (result) {
      setShowNoteInput(true);
    }
  };

  const handleAddHighlight = async (note: string) => {
    if (!selectedText || !selectionRange || !userId) return;

    console.log('Adding highlight:', selectedText, selectionRange);

    const contextBefore = content.substring(
      Math.max(0, selectionRange.start - 50),
      selectionRange.start
    );
    const contextAfter = content.substring(
      selectionRange.end,
      Math.min(content.length, selectionRange.end + 50)
    );

    await addHighlight(
      selectedText,
      selectionRange.start,
      selectionRange.end,
      contextBefore,
      contextAfter,
      note
    );

    // Reset state
    setShowNoteInput(false);
    clearSelection();
  };

  const handleUpdateHighlight = async (highlightId: string, note: string) => {
    await updateHighlight(highlightId, note);
    setEditingHighlight(null);
  };

  const handleDeleteHighlight = async (highlightId: string) => {
    await deleteHighlight(highlightId);
    setEditingHighlight(null);
  };

  const handleHighlightClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('highlight-span')) {
      const highlightId = target.getAttribute('data-highlight-id');
      if (highlightId) {
        setEditingHighlight(highlightId);
      }
    }
  };

  const handleCancel = () => {
    setShowNoteInput(false);
    clearSelection();
  };

  const editingHighlightData = editingHighlight 
    ? highlights.find(h => h.id === editingHighlight)
    : null;

  return (
    <div className="space-y-6">
      <ContentRenderer
        content={content}
        highlights={highlights}
        onTextSelection={onTextSelection}
        onHighlightClick={handleHighlightClick}
      />

      {/* Highlight creation modal */}
      {showNoteInput && selectedText && (
        <HighlightCreationModal
          selectedText={selectedText}
          onSave={handleAddHighlight}
          onCancel={handleCancel}
        />
      )}

      {/* Highlight editing modal */}
      {editingHighlight && editingHighlightData && (
        <HighlightEditModal
          highlight={editingHighlightData}
          onSave={handleUpdateHighlight}
          onDelete={handleDeleteHighlight}
          onCancel={() => setEditingHighlight(null)}
        />
      )}

      {/* Highlights summary */}
      <HighlightsSummary highlightCount={highlights.length} />
    </div>
  );
}
