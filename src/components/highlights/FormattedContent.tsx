
import React, { useMemo, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface FormattedContentProps {
  content: string;
  onTextSelection: () => void;
  contentRef: React.RefObject<HTMLDivElement>;
}

export const FormattedContent = React.memo(function FormattedContent({
  content,
  onTextSelection,
  contentRef,
}: FormattedContentProps) {
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

  const formattedContent = useMemo(() => formatContent(content), [content, formatContent]);

  return (
    <div 
      ref={contentRef}
      className="prose prose-lg max-w-none text-gray-700 leading-relaxed select-text"
      dangerouslySetInnerHTML={{ __html: formattedContent }}
      onMouseUp={onTextSelection}
    />
  );
});
