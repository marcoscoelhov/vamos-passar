
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Highlighter, MessageSquare, X, Edit } from 'lucide-react';
import { useHighlights } from '@/hooks/useHighlights';
import { Highlight } from '@/types/course';

interface HighlightableContentProps {
  content: string;
  topicId: string;
  userId?: string;
}

export function HighlightableContent({ content, topicId, userId }: HighlightableContentProps) {
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');
  const [editingHighlight, setEditingHighlight] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { highlights, addHighlight, updateHighlight, deleteHighlight } = useHighlights(topicId, userId);

  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map(line => {
        if (line.startsWith('## ')) {
          return `<h2 class="text-2xl font-bold text-gray-900 mb-4 mt-6">${line.substring(3)}</h2>`;
        }
        if (line.startsWith('### ')) {
          return `<h3 class="text-xl font-semibold text-gray-800 mb-3 mt-5">${line.substring(4)}</h3>`;
        }
        if (line.startsWith('> ')) {
          return `<blockquote class="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-700 bg-blue-50 py-2">${line.substring(2)}</blockquote>`;
        }
        if (line.startsWith('- ')) {
          return `<li class="ml-4 mb-1 list-disc">${line.substring(2)}</li>`;
        }
        if (line.trim() === '') {
          return '<br>';
        }
        
        let formattedLine = line
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
        
        return `<p class="mb-4">${formattedLine}</p>`;
      })
      .join('');
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString();
      
      // Get position relative to content
      const contentElement = contentRef.current;
      if (contentElement) {
        const textContent = contentElement.textContent || '';
        const start = textContent.indexOf(selectedText);
        const end = start + selectedText.length;
        
        setSelectedText(selectedText);
        setSelectionRange({ start, end });
        setShowNoteInput(true);
      }
    }
  };

  const handleAddHighlight = async () => {
    if (!selectedText || !selectionRange || !userId) return;

    const contextBefore = (contentRef.current?.textContent || '').substring(
      Math.max(0, selectionRange.start - 50),
      selectionRange.start
    );
    const contextAfter = (contentRef.current?.textContent || '').substring(
      selectionRange.end,
      Math.min((contentRef.current?.textContent || '').length, selectionRange.end + 50)
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
  };

  const handleUpdateHighlight = async (highlightId: string) => {
    const highlight = highlights.find(h => h.id === highlightId);
    if (highlight) {
      await updateHighlight(highlightId, highlight.note || '');
      setEditingHighlight(null);
    }
  };

  const renderContentWithHighlights = () => {
    if (!highlights.length) {
      return (
        <div 
          ref={contentRef}
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatContent(content) }}
          onMouseUp={handleTextSelection}
        />
      );
    }

    // For now, we'll use a simpler approach and just show the original content
    // A more sophisticated implementation would need to map highlights to DOM positions
    return (
      <div ref={contentRef} onMouseUp={handleTextSelection}>
        <div 
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatContent(content) }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderContentWithHighlights()}

      {/* Highlight creation modal */}
      {showNoteInput && (
        <Card className="fixed bottom-4 right-4 p-4 shadow-lg z-50 w-80">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Highlighter className="w-4 h-4 text-yellow-600" />
                <span className="font-medium">Adicionar Destaque</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNoteInput(false);
                  setSelectedText('');
                  setSelectionRange(null);
                  setNote('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="text-sm bg-yellow-50 p-2 rounded border">
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
                onClick={() => {
                  setShowNoteInput(false);
                  setSelectedText('');
                  setSelectionRange(null);
                  setNote('');
                }}
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
                      value={highlight.note || ''}
                      onChange={(e) => {
                        const updatedHighlights = highlights.map(h =>
                          h.id === highlight.id ? { ...h, note: e.target.value } : h
                        );
                        // This would need to be handled properly in the parent component
                      }}
                      placeholder="Adicione uma nota..."
                      className="min-h-[60px]"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdateHighlight(highlight.id)}>
                        Salvar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingHighlight(null)}
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
                        onClick={() => setEditingHighlight(highlight.id)}
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
}
