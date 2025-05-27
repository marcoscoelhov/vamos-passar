
export interface SuggestedTopic {
  title: string;
  content: string;
  level: number;
}

export interface ProcessingStatus {
  stage: 'uploading' | 'processing' | 'extracting' | 'complete';
  progress: number;
  message: string;
}

export type StatusUpdateCallback = (stage: ProcessingStatus['stage'], progress: number, message: string) => void;

export const processWordDocument = async (file: File, updateStatus: StatusUpdateCallback): Promise<string> => {
  updateStatus('processing', 25, 'Carregando biblioteca de processamento...');
  
  try {
    const mammoth = await import('mammoth');
    
    updateStatus('processing', 50, 'Extraindo conteúdo do documento...');
    
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    
    if (result.messages.length > 0) {
      console.warn('Avisos durante a conversão:', result.messages);
    }
    
    updateStatus('processing', 75, 'Processamento concluído');
    
    return result.value;
  } catch (error) {
    console.error('Erro ao processar documento Word:', error);
    throw new Error('Erro ao processar documento Word. Verifique se o arquivo não está corrompido.');
  }
};

export const processPDFDocument = async (file: File, updateStatus: StatusUpdateCallback): Promise<string> => {
  updateStatus('processing', 25, 'Carregando biblioteca PDF...');
  
  try {
    const pdfParse = await import('pdf-parse');
    
    updateStatus('processing', 50, 'Extraindo texto do PDF...');
    
    const arrayBuffer = await file.arrayBuffer();
    const data = await pdfParse.default(arrayBuffer);
    
    updateStatus('processing', 75, 'Formatando conteúdo extraído...');
    
    const lines = data.text.split('\n').filter(line => line.trim() !== '');
    let htmlContent = '';
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.length < 100 && 
          (trimmedLine === trimmedLine.toUpperCase() || 
           trimmedLine.match(/^[A-Z][^.]*$/))) {
        htmlContent += `<h2>${trimmedLine}</h2>\n`;
      } else {
        htmlContent += `<p>${trimmedLine}</p>\n`;
      }
    });
    
    return htmlContent;
  } catch (error) {
    console.error('Erro ao processar PDF:', error);
    throw new Error('Erro ao processar PDF. Verifique se o arquivo não está corrompido ou protegido por senha.');
  }
};

export const extractTopicsFromContent = (content: string, updateStatus: StatusUpdateCallback): SuggestedTopic[] => {
  updateStatus('extracting', 80, 'Identificando estrutura de tópicos...');
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  
  const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const topics: SuggestedTopic[] = [];
  
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.charAt(1)) - 1;
    let topicContent = '';
    
    let nextSibling = heading.nextElementSibling;
    while (nextSibling && !nextSibling.matches('h1, h2, h3, h4, h5, h6')) {
      topicContent += nextSibling.outerHTML || nextSibling.textContent || '';
      nextSibling = nextSibling.nextElementSibling;
    }
    
    if (heading.textContent && topicContent.trim()) {
      topics.push({
        title: heading.textContent.trim(),
        content: topicContent.trim(),
        level: level
      });
    }
  });
  
  if (topics.length === 0 && content.trim()) {
    topics.push({
      title: 'Conteúdo Importado',
      content: content.trim(),
      level: 0
    });
  }
  
  return topics;
};
