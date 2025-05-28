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
          return `<h2 class="text-3xl font-serif font-semibold text-gray-900 mb-6 mt-12 leading-tight">${trimmedLine.substring(3)}</h2>`;
        }
        if (trimmedLine.startsWith('### ')) {
          return `<h3 class="text-2xl font-serif font-semibold text-gray-800 mb-5 mt-10 leading-tight">${trimmedLine.substring(4)}</h3>`;
        }
        if (trimmedLine.startsWith('> ')) {
          return `<blockquote class="border-l-3 border-gray-200 pl-6 my-8 italic text-gray-600 text-lg leading-relaxed">${trimmedLine.substring(2)}</blockquote>`;
        }
        if (trimmedLine.startsWith('- ')) {
          return `<li class="ml-6 mb-2 text-lg leading-relaxed">${trimmedLine.substring(2)}</li>`;
        }
        if (trimmedLine === '') {
          return '<br>';
        }
        
        let formattedLine = trimmedLine
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
        
        return `<p class="mb-6 text-lg leading-relaxed">${formattedLine}</p>`;
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

      <div 
        ref={contentRef}
        className="content-prose select-text"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
        onMouseUp={handleTextSelection}
      />

      {/* Highlight creation modal - more subtle */}
      {showNoteInput && (
        <Card className="fixed bottom-6 right-6 p-5 shadow-xl z-50 w-80 bg-white border border-gray-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Highlighter className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-gray-900">Adicionar Destaque</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelSelection}
                className="p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="text-sm bg-amber-50 p-3 rounded border border-amber-100 max-h-20 overflow-y-auto">
              "{selectedText}"
            </div>
            
            <Textarea
              placeholder="Adicione uma nota (opcional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[60px] border-gray-200 focus:border-amber-300 focus:ring-amber-100"
            />
            
            <div className="flex gap-2">
              <Button onClick={handleAddHighlight} size="sm" className="flex-1 bg-amber-600 hover:bg-amber-700">
                Salvar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCancelSelection}
                className="border-gray-200"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Highlights list - cleaner design */}
      {highlights.length > 0 && (
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
              <div key={highlight.id} className="border-l-3 border-amber-200 pl-6 py-3">
                <div className="bg-amber-50 p-4 rounded border border-amber-100 text-gray-800 font-serif leading-relaxed">
                  "{highlight.highlightedText}"
                </div>
                
                {editingHighlight === highlight.id ? (
                  <div className="mt-3 space-y-3">
                    <Textarea
                      value={editingNote}
                      onChange={(e) => setEditingNote(e.target.value)}
                      placeholder="Adicione uma nota..."
                      className="min-h-[60px] border-gray-200"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveEdit(highlight.id)} className="bg-amber-600 hover:bg-amber-700">
                        Salvar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCancelEdit}
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
                        onClick={() => handleEditHighlight(highlight)}
                        className="text-xs text-gray-500 hover:text-gray-700 p-1 h-auto"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar nota
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteHighlight(highlight.id)}
                        className="text-xs text-red-500 hover:text-red-700 p-1 h-auto"
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
        </div>
      )}
    </div>
  );
});
