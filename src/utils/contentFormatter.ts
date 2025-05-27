
export const formatContent = (content: string) => {
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

export const applyHighlightsToContent = (content: string, highlights: any[], plainTextContent: string) => {
  if (!highlights.length) return content;

  // Sort highlights by position to avoid conflicts
  const sortedHighlights = [...highlights].sort((a, b) => b.positionStart - a.positionStart);
  
  let highlightedContent = content;
  
  sortedHighlights.forEach((highlight) => {
    // Find the exact text in the plain content
    const textToHighlight = plainTextContent.substring(highlight.positionStart, highlight.positionEnd);
    
    // Use a more precise way to find and replace the text in the formatted content
    const regex = new RegExp(textToHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    let matchCount = 0;
    
    highlightedContent = highlightedContent.replace(regex, (match) => {
      matchCount++;
      // Only replace the first occurrence to avoid duplicates
      if (matchCount === 1) {
        return `<span 
          class="bg-yellow-200 px-1 relative cursor-pointer highlight-span" 
          data-highlight-id="${highlight.id}"
          data-note="${highlight.note || ''}"
          title="${highlight.note ? `Nota: ${highlight.note}` : 'Destaque'}"
        >${match}</span>`;
      }
      return match;
    });
  });

  return highlightedContent;
};
