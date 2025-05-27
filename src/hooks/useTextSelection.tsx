
import { useState } from 'react';
import { Highlight } from '@/types/course';

export function useTextSelection(plainTextContent: string, highlights: Highlight[]) {
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim();
      
      // Find the position in the plain text content
      const start = plainTextContent.indexOf(selectedText);
      const end = start + selectedText.length;
      
      if (start === -1) {
        console.log('Selected text not found in plain content');
        window.getSelection()?.removeAllRanges();
        return;
      }
      
      // Check if selection overlaps with existing highlights
      const overlapping = highlights.some(highlight => 
        (start < highlight.positionEnd && end > highlight.positionStart)
      );
      
      if (overlapping) {
        console.log('Selection overlaps with existing highlight');
        window.getSelection()?.removeAllRanges();
        return;
      }
      
      console.log('Selected text:', selectedText, 'Position:', start, '-', end);
      setSelectedText(selectedText);
      setSelectionRange({ start, end });
      return { selectedText, start, end };
    }
    return null;
  };

  const clearSelection = () => {
    setSelectedText('');
    setSelectionRange(null);
    window.getSelection()?.removeAllRanges();
  };

  return {
    selectedText,
    selectionRange,
    handleTextSelection,
    clearSelection,
  };
}
