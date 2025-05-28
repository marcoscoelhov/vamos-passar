
import React, { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { useOptimizedHighlights } from '@/hooks/useOptimizedHighlights';
import { Highlight } from '@/types/course';
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary';
import { HighlightCreationModal } from './highlights/HighlightCreationModal';
import { HighlightsList } from './highlights/HighlightsList';
import { FormattedContent } from './highlights/FormattedContent';
import { logger } from '@/utils/logger';

interface HighlightableContentProps {
  content: string;
  topicId: string;
  userId?: string;
}

export const HighlightableContent = React.memo(function HighlightableContent({ 
  content, 
  topicId, 
  userId 
}: HighlightableContentProps) {
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');
  const [editingHighlight, setEditingHighlight] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { 
    highlights, 
    addHighlight, 
    updateHighlight, 
    deleteHighlight, 
    isLoading,
    isAdding,
    isUpdating,
    isDeleting
  } = useOptimizedHighlights({
    topicId,
    userId,
    enableRealTimeUpdates: true
  });

  const handleTextSelection = useCallback(() => {
    try {
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
          setError(null);
        }
      }
    } catch (error) {
      logger.error('Error handling text selection', { error });
      setError('Erro ao selecionar texto');
    }
  }, [userId]);

  const handleAddHighlight = useCallback(async () => {
    if (!selectedText || !selectionRange || !userId || isAdding) return;

    setError(null);

    try {
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
    } catch (error) {
      logger.error('Error adding highlight', { error });
      setError('Erro ao salvar destaque. Tente novamente.');
    }
  }, [selectedText, selectionRange, userId, note, addHighlight, isAdding]);

  const handleCancelSelection = useCallback(() => {
    setShowNoteInput(false);
    setSelectedText('');
    setSelectionRange(null);
    setNote('');
    setError(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  const handleEditHighlight = useCallback((highlight: Highlight) => {
    setEditingHighlight(highlight.id);
    setEditingNote(highlight.note || '');
    setError(null);
  }, []);

  const handleSaveEdit = useCallback(async (highlightId: string) => {
    if (isUpdating) return;
    
    setError(null);

    try {
      await updateHighlight(highlightId, editingNote);
      setEditingHighlight(null);
      setEditingNote('');
    } catch (error) {
      logger.error('Error updating highlight', { error });
      setError('Erro ao atualizar destaque. Tente novamente.');
    }
  }, [editingNote, updateHighlight, isUpdating]);

  const handleCancelEdit = useCallback(() => {
    setEditingHighlight(null);
    setEditingNote('');
    setError(null);
  }, []);

  const handleDeleteHighlight = useCallback(async (highlightId: string) => {
    if (isDeleting) return;
    
    setError(null);

    try {
      await deleteHighlight(highlightId);
    } catch (error) {
      logger.error('Error deleting highlight', { error });
      setError('Erro ao remover destaque. Tente novamente.');
    }
  }, [deleteHighlight, isDeleting]);

  return (
    <SectionErrorBoundary sectionName="Conteúdo destacável">
      <div className="space-y-6">
        {error && (
          <Card className="p-3 border-red-200 bg-red-50">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        )}

        <FormattedContent
          content={content}
          onTextSelection={handleTextSelection}
          contentRef={contentRef}
        />

        {showNoteInput && (
          <HighlightCreationModal
            selectedText={selectedText}
            note={note}
            isAdding={isAdding}
            onNoteChange={setNote}
            onSave={handleAddHighlight}
            onCancel={handleCancelSelection}
          />
        )}

        <HighlightsList
          highlights={highlights}
          isLoading={isLoading}
          editingHighlight={editingHighlight}
          editingNote={editingNote}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
          onEditHighlight={handleEditHighlight}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onDeleteHighlight={handleDeleteHighlight}
          onEditingNoteChange={setEditingNote}
        />
      </div>
    </SectionErrorBoundary>
  );
});
