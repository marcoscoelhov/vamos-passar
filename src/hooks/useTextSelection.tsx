
import { useState } from 'react';
import { Highlight } from '@/types/course';

export function useTextSelection(plainTextContent: string, highlights: Highlight[]) {
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || !selection.toString().trim()) {
      return null;
    }

    const selectedText = selection.toString().trim();
    
    // Get the range and find the actual position in the DOM
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    
    // Find the text content before the selection to calculate position
    let textBefore = '';
    const walker = document.createTreeWalker(
      container.nodeType === Node.TEXT_NODE ? container.parentElement : container,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let currentNode;
    while (currentNode = walker.nextNode()) {
      if (currentNode === range.startContainer) {
        textBefore += currentNode.textContent?.substring(0, range.startOffset) || '';
        break;
      } else {
        textBefore += currentNode.textContent || '';
      }
    }
    
    // Calculate positions in plain text
    const start = textBefore.length;
    const end = start + selectedText.length;
    
    // Validate that the selection exists in plain content
    const expectedText = plainTextContent.substring(start, end);
    if (expectedText !== selectedText) {
      console.log('Selection mismatch, trying alternative method');
      
      // Fallback: find the text in plain content
      const fallbackStart = plainTextContent.indexOf(selectedText);
      if (fallbackStart === -1) {
        console.log('Selected text not found in plain content');
        window.getSelection()?.removeAllRanges();
        return null;
      }
      
      const fallbackEnd = fallbackStart + selectedText.length;
      
      // Check if selection overlaps with existing highlights
      const overlapping = highlights.some(highlight => 
        (fallbackStart < highlight.positionEnd && fallbackEnd > highlight.positionStart)
      );
      
      if (overlapping) {
        console.log('Selection overlaps with existing highlight');
        window.getSelection()?.removeAllRanges();
        return null;
      }
      
      console.log('Selected text:', selectedText, 'Position:', fallbackStart, '-', fallbackEnd);
      setSelectedText(selectedText);
      setSelectionRange({ start: fallbackStart, end: fallbackEnd });
      return { selectedText, start: fallbackStart, end: fallbackEnd };
    }
    
    // Check if selection overlaps with existing highlights
    const overlapping = highlights.some(highlight => 
      (start < highlight.positionEnd && end > highlight.positionStart)
    );
    
    if (overlapping) {
      console.log('Selection overlaps with existing highlight');
      window.getSelection()?.removeAllRanges();
      return null;
    }
    
    console.log('Selected text:', selectedText, 'Position:', start, '-', end);
    setSelectedText(selectedText);
    setSelectionRange({ start, end });
    return { selectedText, start, end };
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
