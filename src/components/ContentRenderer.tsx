
import React, { useRef } from 'react';
import { formatContent, applyHighlightsToContent } from '@/utils/contentFormatter';
import { Highlight } from '@/types/course';

interface ContentRendererProps {
  content: string;
  highlights: Highlight[];
  onTextSelection: () => void;
  onHighlightClick: (event: React.MouseEvent) => void;
}

export function ContentRenderer({ content, highlights, onTextSelection, onHighlightClick }: ContentRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const renderContentWithHighlights = () => {
    const formattedContent = formatContent(content);
    const highlightedContent = applyHighlightsToContent(formattedContent, highlights, content);
    
    return (
      <div 
        ref={contentRef}
        className="prose prose-lg max-w-none text-gray-700 leading-relaxed select-text"
        dangerouslySetInnerHTML={{ __html: highlightedContent }}
        onMouseUp={onTextSelection}
        onClick={onHighlightClick}
        style={{ userSelect: 'text' }}
      />
    );
  };

  return renderContentWithHighlights();
}
