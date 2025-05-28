
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useHighlights } from '@/hooks/useHighlights';
import { Highlight } from '@/types/course';
import { InlineContentEditor } from './InlineContentEditor';
import { HighlightCreationModal } from './highlights/HighlightCreationModal';
import { HighlightsList } from './highlights/HighlightsList';
import { ContentRenderer } from './highlights/ContentRenderer';

interface HighlightableContentProps {
  content: string;
  topicId: string;
  userId?: string;
  isAdmin?: boolean;
  onContentUpdated?: (newContent: string) => void;
}

export const HighlightableContent = React.memo(function HighlightableContent({ 
  content, 
  topicId, 
  userId,
  isAdmin = false,
  onContentUpdated
}: HighlightableContentProps) {
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');
  const [editingHighlight, setEditingHighlight] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState('');
  const [currentContent, setCurrentContent] = useState(content);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { highlights, addHighlight, updateHighlight, deleteHighlight } = useHighlights(topicId, userId);

  const handleContentUpdated = useCallback((newContent: string) => {
    setCurrentContent(newContent);
    if (onContentUpdated) {
      onContentUpdated(newContent);
    }
  }, [onContentUpdated]);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !selection.toString().trim() || !userId) return;

    const selectedText = selection.toString().trim();
    const range = selection.getRangeAt(0);
    
    // Get position relative to content
    const contentElement = contentRef.current;
    if (contentElement) {
      const textContent = contentElement.textContent || '';
      const start = textContent.indexOf(selectedText);
      
      if (start !== -1) {
        const end = start + selectedText.length;
        
        setSelectedText(selectedText);
        setSelectionRange({ start, end });
        setShowNoteInput(true);
      }
    }
  }, [userId]);

  const handleAddHighlight = useCallback(async () => {
    if (!selectedText || !selectionRange || !userId) return;

    const contentElement = contentRef.current;
    const textContent = contentElement?.textContent || '';
    
    const contextBefore = textContent.substring(
      Math.max(0, selectionRange.start - 50),
      selectionRange.start
    );
    const contextAfter = textContent.substring(
      selectionRange.end,
      Math.min(textContent.length, selectionRange.end + 50)
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
    setSelectedText('');
    setSelectionRange(null);
    setShowNoteInput(false);
    setNote('');
    window.getSelection()?.removeAllRanges();
  }, [selectedText, selectionRange, userId, note, addHighlight]);

  const handleCancelSelection = useCallback(() => {
    setShowNoteInput(false);
    setSelectedText('');
    setSelectionRange(null);
    setNote('');
    window.getSelection()?.removeAllRanges();
  }, []);

  const handleEditHighlight = useCallback((highlight: Highlight) => {
    setEditingHighlight(highlight.id);
    setEditingNote(highlight.note || '');
  }, []);

  const handleSaveEdit = useCallback(async (highlightId: string) => {
    await updateHighlight(highlightId, editingNote);
    setEditingHighlight(null);
    setEditingNote('');
  }, [editingNote, updateHighlight]);

  const handleCancelEdit = useCallback(() => {
    setEditingHighlight(null);
    setEditingNote('');
  }, []);

  return (
    <div className="space-y-12">
      {/* Inline Content Editor - only show for admins */}
      {isAdmin && (
        <div className="mb-8">
          <InlineContentEditor
            topicId={topicId}
            content={currentContent}
            isAdmin={isAdmin}
            onContentUpdated={handleContentUpdated}
          />
        </div>
      )}

      <div ref={contentRef}>
        <ContentRenderer 
          content={currentContent}
          onMouseUp={handleTextSelection}
        />
      </div>

      {/* Highlight creation modal */}
      {showNoteInput && (
        <HighlightCreationModal
          selectedText={selectedText}
          note={note}
          onNoteChange={setNote}
          onSave={handleAddHighlight}
          onCancel={handleCancelSelection}
        />
      )}

      {/* Highlights list */}
      <HighlightsList
        highlights={highlights}
        editingHighlight={editingHighlight}
        editingNote={editingNote}
        onEditStart={handleEditHighlight}
        onEditSave={handleSaveEdit}
        onEditCancel={handleCancelEdit}
        onEditNoteChange={setEditingNote}
        onDelete={deleteHighlight}
      />
    </div>
  );
});
