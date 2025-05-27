
/**
 * Sanitiza e corrige conteúdo HTML malformado
 */
export function sanitizeHtmlContent(content: string): string {
  if (!content) return '';

  // Remove caracteres de controle e espaços desnecessários
  let sanitized = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Corrige parágrafos malformados
  sanitized = sanitized.replace(/<p[^>]*>\s*<\/p>/g, '');
  sanitized = sanitized.replace(/<p[^>]*>(\s*<br[^>]*>\s*)+<\/p>/g, '');
  
  // Corrige tags de quebra de linha duplicadas
  sanitized = sanitized.replace(/(<br[^>]*>\s*){2,}/g, '<br>');
  
  // Remove atributos desnecessários ou perigosos
  sanitized = sanitized.replace(/\s(style|on\w+|javascript:)[^>]*(?=\s|>)/gi, '');
  
  // Corrige estrutura de listas
  sanitized = sanitized.replace(/<li[^>]*>(?!.*<\/li>)/g, (match) => match + '</li>');
  sanitized = sanitized.replace(/<\/li>\s*(?!<li|<\/ul|<\/ol)/g, '</li>');
  
  // Garante que tags abertas sejam fechadas
  const openTags: string[] = [];
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
  let match;
  
  while ((match = tagRegex.exec(sanitized)) !== null) {
    const isClosing = match[0].startsWith('</');
    const tagName = match[1].toLowerCase();
    
    if (isClosing) {
      const index = openTags.lastIndexOf(tagName);
      if (index !== -1) {
        openTags.splice(index, 1);
      }
    } else if (!match[0].endsWith('/>')) {
      // Tags que não se fecham automaticamente
      const selfClosingTags = ['br', 'hr', 'img', 'input', 'meta', 'link'];
      if (!selfClosingTags.includes(tagName)) {
        openTags.push(tagName);
      }
    }
  }
  
  // Fecha tags ainda abertas
  while (openTags.length > 0) {
    const tag = openTags.pop();
    sanitized += `</${tag}>`;
  }
  
  // Remove espaços extras e quebras de linha desnecessárias
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Se o conteúdo não tem tags HTML válidas, envolve em parágrafo
  if (!/<[^>]+>/.test(sanitized) && sanitized.length > 0) {
    sanitized = `<p>${sanitized}</p>`;
  }

  return sanitized;
}

/**
 * Valida se o conteúdo HTML está bem formado
 */
export function validateHtmlContent(content: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!content) {
    return { isValid: true, errors: [] };
  }

  // Verifica se há tags não fechadas
  const openTags: string[] = [];
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
  let match;
  
  while ((match = tagRegex.exec(content)) !== null) {
    const isClosing = match[0].startsWith('</');
    const tagName = match[1].toLowerCase();
    
    if (isClosing) {
      const index = openTags.lastIndexOf(tagName);
      if (index === -1) {
        errors.push(`Tag de fechamento sem abertura: ${tagName}`);
      } else {
        openTags.splice(index, 1);
      }
    } else if (!match[0].endsWith('/>')) {
      const selfClosingTags = ['br', 'hr', 'img', 'input', 'meta', 'link'];
      if (!selfClosingTags.includes(tagName)) {
        openTags.push(tagName);
      }
    }
  }
  
  // Tags ainda abertas
  openTags.forEach(tag => {
    errors.push(`Tag não fechada: ${tag}`);
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Converte markdown básico para HTML
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Code
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  
  // Wrap in paragraphs if not already wrapped
  if (!html.startsWith('<') || !html.includes('<p>')) {
    html = `<p>${html}</p>`;
  }
  
  return html;
}
