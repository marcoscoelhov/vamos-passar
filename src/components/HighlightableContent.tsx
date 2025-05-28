
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Highlighter, MessageSquare, X, Edit, AlertTriangle } from 'lucide-react';
import { useHighlights } from '@/hooks/useHighlights';
import { Highlight } from '@/types/course';
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { highlights, addHighlight, updateHighlight, deleteHighlight, isLoading, error: highlightsError } = useHighlights(topicId, userId);

  const formatContent = useCallback((content: string) => {
    try {
      if (!content || typeof content !== 'string') {
        logger.warn('Invalid content provided to formatContent', { content });
        return '<p class="text-gray-500 italic">Conteúdo não disponível</p>';
      }

      return content
        .split('\n')
        .map(line => {
          const trimmedLine = line.trim();
          
          if (trimmedLine.startsWith('## ')) {
            return `<h2 class="text-2xl font-bold text-gray-900 mb-4 mt-6">${trimmedLine.substring(3)}</h2>`;
          }
          if (trimmedLine.startsWith('### ')) {
            return `<h3 class="text-xl font-semibold text-gray-800 mb-3 mt-5">${trimmedLine.substring(4)}</h3>`;
          }
          if (trimmedLine.startsWith('> ')) {
            return `<blockquote class="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-700 bg-blue-50 py-2">${trimmedLine.substring(2)}</blockquote>`;
          }
          if (trimmedLine.startsWith('- ')) {
            return `<li class="ml-4 mb-1 list-disc">${trimmedLine.substring(2)}</li>`;
          }
          if (trimmedLine === '') {
            return '<br>';
          }
          
          let formattedLine = trimmedLine
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
          
          return `<p class="mb-4">${formattedLine}</p>`;
        })
        .join('');
    } catch (error) {
      logger.error('Error formatting content', { error, content });
      return '<p class="text-red-500">Erro ao formatar o conteúdo</p>';
    }
  }, []);

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
    if (!selectedText || !selectionRange || !userId || isProcessing) return;

    setIsProcessing(true);
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
    } finally {
      setIsProcessing(false);
    }
  }, [selectedText, selectionRange, userId, note, addHighlight, isProcessing]);

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
    if (isProcessing) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      await updateHighlight(highlightId, editingNote);
      setEditingHighlight(null);
      setEditingNote('');
    } catch (error) {
      logger.error('Error updating highlight', { error });
      setError('Erro ao atualizar destaque. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  }, [editingNote, updateHighlight, isProcessing]);

  const handleCancelEdit = useCallback(() => {
    setEditingHighlight(null);
    setEditingNote('');
    setError(null);
  }, []);

  const handleDeleteHighlight = useCallback(async (highlightId: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      await deleteHighlight(highlightId);
    } catch (error) {
      logger.error('Error deleting highlight', { error });
      setError('Erro ao remover destaque. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  }, [deleteHighlight, isProcessing]);

  const formattedContent = useMemo(() => formatContent(content), [content, formatContent]);

  // Show error state if there's a critical error
  if (highlightsError) {
    return (
      <Card className="p-6 border-red-100">
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <div>
            <h3 className="font-medium">Erro ao carregar destaques</h3>
            <p className="text-sm text-red-500">{highlightsError}</p>
          </div>
        </div>
      </Card>
    );
  }

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

        <div 
          ref={contentRef}
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed select-text"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
          onMouseUp={handleTextSelection}
        />

        {/* Highlight creation modal */}
        {showNoteInput && (
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
                  onClick={handleCancelSelection}
                  disabled={isProcessing}
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
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[60px]"
                disabled={isProcessing}
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddHighlight} 
                  size="sm" 
                  className="flex-1"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Salvando...' : 'Salvar Destaque'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCancelSelection}
                  disabled={isProcessing}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Highlights list */}
        {highlights.length > 0 && (
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
                <div key={highlight.id} className="border-l-4 border-yellow-400 pl-4 py-2">
                  <div className="bg-yellow-50 p-3 rounded text-sm">
                    "{highlight.highlightedText}"
                  </div>
                  
                  {editingHighlight === highlight.id ? (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={editingNote}
                        onChange={(e) => setEditingNote(e.target.value)}
                        placeholder="Adicione uma nota..."
                        className="min-h-[60px]"
                        disabled={isProcessing}
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleSaveEdit(highlight.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? 'Salvando...' : 'Salvar'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={isProcessing}
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
                          onClick={() => handleEditHighlight(highlight)}
                          disabled={isProcessing}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Editar nota
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteHighlight(highlight.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={isProcessing}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </SectionErrorBoundary>
  );
});
