import jsPDF from 'jspdf';
import { Topic } from '@/types/course';

export interface FormattedLine {
  text: string;
  type: 'normal' | 'heading' | 'subheading';
}

export const formatContentForPDF = (content: string): FormattedLine[] => {
  const lines = content.split('\n');
  const formattedLines: FormattedLine[] = [];

  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    if (trimmedLine === '') {
      return;
    }
    
    if (trimmedLine.startsWith('## ')) {
      formattedLines.push({
        text: trimmedLine.substring(3),
        type: 'heading'
      });
    } else if (trimmedLine.startsWith('### ')) {
      formattedLines.push({
        text: trimmedLine.substring(4),
        type: 'subheading'
      });
    } else {
      // Remove markdown formatting
      const cleanText = trimmedLine
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/^> /, '') // Remove blockquote
        .replace(/^- /, '• '); // Convert list items to bullets
      
      formattedLines.push({
        text: cleanText,
        type: 'normal'
      });
    }
  });

  return formattedLines;
};

export const generatePDFFromTopics = (topics: Topic[], courseName: string): jsPDF => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 30;
  const lineHeight = 7;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Título do curso
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(courseName, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Índice
  pdf.setFontSize(16);
  pdf.text('Índice', margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  topics.forEach((topic, index) => {
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 30;
    }
    pdf.text(`${index + 1}. ${topic.title}`, margin, yPosition);
    yPosition += lineHeight;
  });

  // Conteúdo dos tópicos
  topics.forEach((topic, topicIndex) => {
    pdf.addPage();
    yPosition = 30;

    // Título do tópico
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const topicTitle = `${topicIndex + 1}. ${topic.title}`;
    pdf.text(topicTitle, margin, yPosition);
    yPosition += 15;

    // Conteúdo
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const contentLines = formatContentForPDF(topic.content);
    
    contentLines.forEach(line => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;
      }

      if (line.type === 'heading') {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        yPosition += 5;
      } else if (line.type === 'subheading') {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        yPosition += 3;
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
      }

      const textLines = pdf.splitTextToSize(line.text, contentWidth);
      textLines.forEach((textLine: string) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 30;
        }
        pdf.text(textLine, margin, yPosition);
        yPosition += lineHeight;
      });

      if (line.type === 'heading' || line.type === 'subheading') {
        yPosition += 2;
      }
    });

    // Questões (sem gabarito)
    if (topic.questions && topic.questions.length > 0) {
      yPosition += 10;
      
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 30;
      }

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Questões de Fixação', margin, yPosition);
      yPosition += 15;

      topic.questions.forEach((question, qIndex) => {
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = 30;
        }

        // Pergunta
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        const questionText = `${qIndex + 1}. ${question.question}`;
        const questionLines = pdf.splitTextToSize(questionText, contentWidth);
        questionLines.forEach((line: string) => {
          pdf.text(line, margin, yPosition);
          yPosition += lineHeight;
        });

        yPosition += 3;

        // Opções (sem mostrar qual é a correta)
        pdf.setFont('helvetica', 'normal');
        question.options.forEach((option, optIndex) => {
          const optionText = `${String.fromCharCode(65 + optIndex)}) ${option}`;
          
          const optionLines = pdf.splitTextToSize(optionText, contentWidth - 10);
          optionLines.forEach((line: string) => {
            pdf.text(line, margin + 5, yPosition);
            yPosition += lineHeight;
          });
        });

        yPosition += 8;
      });
    }
  });

  return pdf;
};
