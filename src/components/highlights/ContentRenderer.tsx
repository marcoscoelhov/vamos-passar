
import React, { useCallback } from 'react';

interface ContentRendererProps {
  content: string;
  onMouseUp: () => void;
}

export function ContentRenderer({ content, onMouseUp }: ContentRendererProps) {
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

  const formattedContent = formatContent(content);

  return (
    <div 
      className="content-prose select-text"
      dangerouslySetInnerHTML={{ __html: formattedContent }}
      onMouseUp={onMouseUp}
    />
  );
}
