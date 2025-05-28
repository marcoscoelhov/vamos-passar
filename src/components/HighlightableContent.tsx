
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Highlighter, MessageSquare, X, Edit } from 'lucide-react';
import { useHighlights } from '@/hooks/useHighlights';
import { Highlight } from '@/types/course';
import { InlineContentEditor } from './InlineContentEditor';

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

  const formatContent = useCallback((content: string) => {
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
  }, []);

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

  // Use currentContent (which may be updated by editor) instead of the original content prop
  const formattedContent = useMemo(() => formatContent(currentContent), [currentContent, formatContent]);

  return (
    <div className="space-y-6">
      {/* Inline Content Editor - only show for admins */}
      {isAdmin && (
        <InlineContentEditor
          topicId={topicId}
          content={currentContent}
          isAdmin={isAdmin}
          onContentUpdated={handleContentUpdated}
        />
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
            />
            
            <div className="flex gap-2">
              <Button onClick={handleAddHighlight} size="sm" className="flex-1">
                Salvar Destaque
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCancelSelection}
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
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveEdit(highlight.id)}>
                        Salvar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCancelEdit}
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
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar nota
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteHighlight(highlight.id)}
                        className="text-red-600 hover:text-red-700"
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
  );
});
