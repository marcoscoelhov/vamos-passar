
import { StatusUpdateCallback } from './documentProcessing';

export interface PDFStructureElement {
  text: string;
  fontSize: number;
  fontName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  bold: boolean;
  italic: boolean;
}

export interface PDFPage {
  pageNumber: number;
  elements: PDFStructureElement[];
  width: number;
  height: number;
}

export interface ProcessedPDFContent {
  htmlContent: string;
  structuredData: PDFPage[];
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
  };
}

export const processAdvancedPDF = async (
  file: File, 
  updateStatus: StatusUpdateCallback
): Promise<ProcessedPDFContent> => {
  updateStatus('processing', 10, 'Carregando biblioteca PDF avançada...');
  
  try {
    // Importar pdfjs-dist para análise estrutural
    const pdfjsLib = await import('pdfjs-dist');
    
    // Configurar worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    updateStatus('processing', 25, 'Analisando estrutura do PDF...');
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    updateStatus('processing', 40, 'Extraindo metadados...');
    
    // Extrair metadados
    const metadata = await pdf.getMetadata();
    const processedMetadata = {
      title: metadata.info?.Title || '',
      author: metadata.info?.Author || '',
      subject: metadata.info?.Subject || '',
      keywords: metadata.info?.Keywords || '',
      creator: metadata.info?.Creator || '',
      producer: metadata.info?.Producer || '',
      creationDate: metadata.info?.CreationDate || '',
      modificationDate: metadata.info?.ModDate || '',
    };
    
    updateStatus('processing', 50, 'Processando páginas...');
    
    const pages: PDFPage[] = [];
    let allHtmlContent = '';
    
    // Processar cada página
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });
      
      // Extrair conteúdo de texto com posições
      const textContent = await page.getTextContent();
      const elements: PDFStructureElement[] = [];
      
      textContent.items.forEach((item: any) => {
        if (item.str && item.str.trim()) {
          elements.push({
            text: item.str,
            fontSize: item.height || 12,
            fontName: item.fontName || 'default',
            x: item.transform[4],
            y: item.transform[5],
            width: item.width || 0,
            height: item.height || 12,
            bold: item.fontName?.toLowerCase().includes('bold') || false,
            italic: item.fontName?.toLowerCase().includes('italic') || false,
          });
        }
      });
      
      pages.push({
        pageNumber: pageNum,
        elements,
        width: viewport.width,
        height: viewport.height,
      });
      
      updateStatus('processing', 50 + (pageNum / pdf.numPages) * 30, 
        `Processando página ${pageNum} de ${pdf.numPages}...`);
    }
    
    updateStatus('processing', 85, 'Analisando estrutura hierárquica...');
    
    // Analisar estrutura e gerar HTML
    allHtmlContent = analyzeStructureAndGenerateHTML(pages);
    
    updateStatus('processing', 95, 'Finalizando processamento...');
    
    return {
      htmlContent: allHtmlContent,
      structuredData: pages,
      metadata: processedMetadata,
    };
    
  } catch (error) {
    console.error('Erro no processamento avançado de PDF:', error);
    throw new Error('Erro ao processar PDF com análise avançada: ' + (error as Error).message);
  }
};

const analyzeStructureAndGenerateHTML = (pages: PDFPage[]): string => {
  let html = '';
  const allElements: PDFStructureElement[] = [];
  
  // Combinar todos os elementos de todas as páginas
  pages.forEach(page => {
    allElements.push(...page.elements.map(el => ({
      ...el,
      // Normalizar coordenada Y para ordenação correta
      y: page.height - el.y
    })));
  });
  
  // Ordenar por posição (Y primeiro, depois X)
  allElements.sort((a, b) => {
    if (Math.abs(a.y - b.y) < 5) { // Mesma linha (tolerância de 5px)
      return a.x - b.x;
    }
    return a.y - b.y;
  });
  
  // Analisar tipos de elementos
  const fontSizes = allElements.map(el => el.fontSize);
  const avgFontSize = fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length;
  const maxFontSize = Math.max(...fontSizes);
  
  // Determinar thresholds para títulos
  const titleThreshold = Math.max(avgFontSize * 1.5, avgFontSize + 2);
  const subtitleThreshold = Math.max(avgFontSize * 1.2, avgFontSize + 1);
  
  let currentParagraph = '';
  let lastY = -1;
  const lineHeight = avgFontSize * 1.2;
  
  allElements.forEach((element, index) => {
    const isNewLine = lastY === -1 || Math.abs(element.y - lastY) > lineHeight * 0.5;
    const isTitle = element.fontSize >= titleThreshold || 
                   (element.bold && element.fontSize >= subtitleThreshold);
    const isSubtitle = !isTitle && (element.bold || element.fontSize >= subtitleThreshold);
    
    // Se mudou de linha, processar o conteúdo anterior
    if (isNewLine && currentParagraph.trim()) {
      const trimmedParagraph = currentParagraph.trim();
      
      // Determinar se o parágrafo anterior era um título
      const previousElement = index > 0 ? allElements[index - 1] : null;
      const wasTitle = previousElement && 
        (previousElement.fontSize >= titleThreshold || 
         (previousElement.bold && previousElement.fontSize >= subtitleThreshold));
      
      if (wasTitle) {
        if (previousElement && previousElement.fontSize >= titleThreshold) {
          html += `<h1>${trimmedParagraph}</h1>\n`;
        } else {
          html += `<h2>${trimmedParagraph}</h2>\n`;
        }
      } else {
        // Verificar se é uma lista
        if (trimmedParagraph.match(/^[\d\w][\.\)\-]\s/) || 
            trimmedParagraph.match(/^[•\-\*]\s/)) {
          html += `<li>${trimmedParagraph.replace(/^[\d\w][\.\)\-]\s|^[•\-\*]\s/, '')}</li>\n`;
        } else if (trimmedParagraph.length > 0) {
          html += `<p>${trimmedParagraph}</p>\n`;
        }
      }
      
      currentParagraph = '';
    }
    
    // Adicionar texto atual
    if (isNewLine) {
      currentParagraph = element.text;
    } else {
      currentParagraph += ' ' + element.text;
    }
    
    lastY = element.y;
  });
  
  // Processar último parágrafo
  if (currentParagraph.trim()) {
    const trimmedParagraph = currentParagraph.trim();
    if (trimmedParagraph.match(/^[\d\w][\.\)\-]\s/) || 
        trimmedParagraph.match(/^[•\-\*]\s/)) {
      html += `<li>${trimmedParagraph.replace(/^[\d\w][\.\)\-]\s|^[•\-\*]\s/, '')}</li>\n`;
    } else {
      html += `<p>${trimmedParagraph}</p>\n`;
    }
  }
  
  // Envolver listas em tags ul
  html = html.replace(/(<li>.*?<\/li>\n)+/gs, '<ul>\n$&</ul>\n');
  
  return html;
};

export const detectPDFBookmarks = async (file: File): Promise<string[]> => {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const outline = await pdf.getOutline();
    const bookmarks: string[] = [];
    
    const extractBookmarks = (items: any[], level = 0) => {
      items?.forEach(item => {
        if (item.title) {
          bookmarks.push('  '.repeat(level) + item.title);
        }
        if (item.items) {
          extractBookmarks(item.items, level + 1);
        }
      });
    };
    
    if (outline) {
      extractBookmarks(outline);
    }
    
    return bookmarks;
  } catch (error) {
    console.error('Erro ao extrair bookmarks:', error);
    return [];
  }
};
