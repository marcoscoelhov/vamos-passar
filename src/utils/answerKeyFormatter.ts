
import jsPDF from 'jspdf';
import { Topic } from '@/types/course';

export const generateAnswerKeyPDF = (topic: Topic): jsPDF => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 30;
  const lineHeight = 7;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Título
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Gabarito - ${topic.title}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  if (!topic.questions || topic.questions.length === 0) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Nenhuma questão disponível para este tópico.', margin, yPosition);
    return pdf;
  }

  // Questões e respostas
  topic.questions.forEach((question, index) => {
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = 30;
    }

    // Número da questão
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Questão ${index + 1}`, margin, yPosition);
    yPosition += 10;

    // Pergunta
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const questionLines = pdf.splitTextToSize(question.question, contentWidth);
    questionLines.forEach((line: string) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;
      }
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
    yPosition += 5;

    // Opções com a resposta correta destacada
    question.options.forEach((option, optIndex) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;
      }

      const letter = String.fromCharCode(65 + optIndex);
      const isCorrect = optIndex === question.correctAnswer;
      
      if (isCorrect) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }

      const optionText = `${letter}) ${option}${isCorrect ? ' ✓ CORRETA' : ''}`;
      const optionLines = pdf.splitTextToSize(optionText, contentWidth - 10);
      
      optionLines.forEach((line: string) => {
        pdf.text(line, margin + 5, yPosition);
        yPosition += lineHeight;
      });
    });

    // Explicação (se houver)
    if (question.explanation) {
      yPosition += 3;
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 30;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.text('Explicação:', margin, yPosition);
      yPosition += lineHeight;

      pdf.setFont('helvetica', 'normal');
      const explanationLines = pdf.splitTextToSize(question.explanation, contentWidth);
      explanationLines.forEach((line: string) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 30;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
    }

    yPosition += 10; // Espaço entre questões
  });

  return pdf;
};
