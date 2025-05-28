
import { useMemo } from 'react';
import { validateHtmlContent } from '@/utils/contentSanitizer';

export function useContentValidation(content: string) {
  return useMemo(() => {
    if (!content) {
      return { isValid: false, errors: ['Conteúdo vazio'] };
    }
    
    return validateHtmlContent(content);
  }, [content]);
}
