
import { logger } from '@/utils/logger';

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
    
    // Configurações avançadas do mammoth para melhor preservação de formatação
    const options = {
      arrayBuffer,
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Heading 4'] => h4:fresh",
        "p[style-name='Heading 5'] => h5:fresh",
        "p[style-name='Heading 6'] => h6:fresh",
        "p[style-name='Title'] => h1:fresh",
        "p[style-name='Subtitle'] => h2:fresh",
        "r[style-name='Strong'] => strong",
        "r[style-name='Emphasis'] => em"
      ],
      convertImage: mammoth.images.imgElement(function(image: any) {
        return image.read("base64").then(function(imageBuffer: string) {
          return {
            src: "data:" + image.contentType + ";base64," + imageBuffer
          };
        });
      }),
      preserveLineBreaks: true,
      includeDefaultStyleMap: true
    };
    
    const result = await mammoth.convertToHtml(options);
    
    if (result.messages.length > 0) {
      logger.warn('Avisos durante a conversão de documento Word', { 
        fileName: file.name,
        messageCount: result.messages.length,
        messages: result.messages
      });
    }
    
    updateStatus('processing', 75, 'Processamento concluído');
    
    return result.value;
  } catch (error) {
    logger.error('Erro ao processar documento Word', { fileName: file.name, error });
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
    
    logger.info('PDF document processed successfully', { 
      fileName: file.name,
      pageCount: data.numpages,
      textLength: data.text.length
    });
    
    return htmlContent;
  } catch (error) {
    logger.error('Erro ao processar PDF', { fileName: file.name, error });
    throw new Error('Erro ao processar PDF. Verifique se o arquivo não está corrompido ou protegido por senha.');
  }
};

export const extractTopicsFromContent = (content: string, updateStatus: StatusUpdateCallback, fileName?: string): SuggestedTopic[] => {
  updateStatus('extracting', 80, 'Identificando estrutura de tópicos...');
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  
  const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const topics: SuggestedTopic[] = [];
  
  // Se temos cabeçalhos, processar normalmente
  if (headings.length > 0) {
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
  }
  
  // Se não há tópicos estruturados ou se há conteúdo sem cabeçalhos, usar nome do arquivo
  if (topics.length === 0 && content.trim()) {
    const fileNameWithoutExtension = fileName 
      ? fileName.replace(/\.(docx|pdf)$/i, '') 
      : 'Documento Importado';
    
    topics.push({
      title: fileNameWithoutExtension,
      content: content.trim(),
      level: 0
    });
  }
  
  logger.info('Topics extracted from content', { 
    fileName,
    headingCount: headings.length,
    topicsExtracted: topics.length
  });
  
  return topics;
};
