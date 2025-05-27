import { useState } from 'react';
import { Topic, Question } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

export function useDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const generateTopicsAsPDF = async (topics: Topic[], courseName: string) => {
    try {
      setIsDownloading(true);
      
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

        // Questões
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

            // Opções
            pdf.setFont('helvetica', 'normal');
            question.options.forEach((option, optIndex) => {
              const isCorrect = optIndex === question.correctAnswer;
              const optionText = `${String.fromCharCode(65 + optIndex)}) ${option}${isCorrect ? ' ✓' : ''}`;
              
              if (isCorrect) {
                pdf.setFont('helvetica', 'bold');
              }
              
              const optionLines = pdf.splitTextToSize(optionText, contentWidth - 10);
              optionLines.forEach((line: string) => {
                pdf.text(line, margin + 5, yPosition);
                yPosition += lineHeight;
              });
              
              if (isCorrect) {
                pdf.setFont('helvetica', 'normal');
              }
            });

            // Explicação
            yPosition += 3;
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(10);
            const explanationText = `Explicação: ${question.explanation}`;
            const explanationLines = pdf.splitTextToSize(explanationText, contentWidth);
            explanationLines.forEach((line: string) => {
              pdf.text(line, margin, yPosition);
              yPosition += lineHeight;
            });

            yPosition += 8;
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
          });
        }
      });

      // Salvar PDF
      const fileName = `${courseName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_completo.pdf`;
      pdf.save(fileName);

      toast({
        title: 'PDF gerado com sucesso',
        description: 'O material completo foi baixado em PDF.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Não foi possível gerar o arquivo PDF.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const formatContentForPDF = (content: string) => {
    const lines = content.split('\n');
    const formattedLines: Array<{ text: string; type: 'normal' | 'heading' | 'subheading' }> = [];

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

  const generateTopicHTML = (topic: Topic, includeQuestions: boolean = true) => {
    let html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${topic.title}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            margin: 40px; 
            color: #333;
          }
          h1 { 
            color: #2563eb; 
            border-bottom: 2px solid #2563eb; 
            padding-bottom: 10px;
          }
          h2 { 
            color: #1e40af; 
            margin-top: 30px;
          }
          h3 { 
            color: #1e3a8a; 
          }
          .question { 
            background: #f8fafc; 
            border-left: 4px solid #2563eb; 
            padding: 15px; 
            margin: 20px 0;
          }
          .options { 
            margin: 10px 0;
          }
          .option { 
            margin: 5px 0; 
            padding: 5px;
          }
          .correct { 
            background: #dcfce7; 
            font-weight: bold;
          }
          .explanation { 
            background: #fef3c7; 
            padding: 10px; 
            border-radius: 5px; 
            margin-top: 10px;
          }
          .page-break { 
            page-break-before: always;
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>${topic.title}</h1>
        <div class="content">
          ${formatContentForPrint(topic.content)}
        </div>
    `;

    if (includeQuestions && topic.questions && topic.questions.length > 0) {
      html += `
        <div class="page-break">
          <h2>Questões de Fixação</h2>
          ${topic.questions.map((question, index) => generateQuestionHTML(question, index + 1)).join('')}
        </div>
      `;
    }

    html += `
      </body>
      </html>
    `;

    return html;
  };

  const formatContentForPrint = (content: string) => {
    return content
      .split('\n')
      .map(line => {
        if (line.startsWith('## ')) {
          return `<h2>${line.substring(3)}</h2>`;
        }
        if (line.startsWith('### ')) {
          return `<h3>${line.substring(4)}</h3>`;
        }
        if (line.startsWith('> ')) {
          return `<blockquote style="border-left: 4px solid #e5e7eb; padding-left: 15px; margin: 15px 0; font-style: italic;">${line.substring(2)}</blockquote>`;
        }
        if (line.startsWith('- ')) {
          return `<li>${line.substring(2)}</li>`;
        }
        if (line.trim() === '') {
          return '<br>';
        }
        
        let formattedLine = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        return `<p>${formattedLine}</p>`;
      })
      .join('');
  };

  const generateQuestionHTML = (question: Question, number: number) => {
    return `
      <div class="question">
        <h3>Questão ${number}</h3>
        <p><strong>${question.question}</strong></p>
        <div class="options">
          ${question.options.map((option, index) => `
            <div class="option ${index === question.correctAnswer ? 'correct' : ''}">
              ${String.fromCharCode(65 + index)}) ${option}
              ${index === question.correctAnswer ? ' ✓' : ''}
            </div>
          `).join('')}
        </div>
        <div class="explanation">
          <strong>Explicação:</strong> ${question.explanation}
        </div>
      </div>
    `;
  };

  const downloadTopic = async (topic: Topic, includeQuestions: boolean = true) => {
    try {
      setIsDownloading(true);
      
      const html = generateTopicHTML(topic, includeQuestions);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${topic.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Download concluído',
        description: 'O arquivo foi baixado com sucesso. Você pode imprimir ou estudar offline.',
      });
    } catch (error) {
      console.error('Error downloading topic:', error);
      toast({
        title: 'Erro no download',
        description: 'Não foi possível baixar o conteúdo.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadTopicsAsBundle = async (topics: Topic[], courseName: string) => {
    try {
      setIsDownloading(true);
      
      let html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${courseName} - Material de Estudo</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              margin: 40px; 
              color: #333;
            }
            h1 { 
              color: #2563eb; 
              border-bottom: 2px solid #2563eb; 
              padding-bottom: 10px;
              text-align: center;
            }
            h2 { 
              color: #1e40af; 
              margin-top: 30px;
            }
            h3 { 
              color: #1e3a8a; 
            }
            .toc {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin: 30px 0;
            }
            .toc h2 {
              margin-top: 0;
            }
            .toc ul {
              list-style: none;
              padding-left: 0;
            }
            .toc li {
              margin: 8px 0;
              padding: 5px 0;
              border-bottom: 1px dotted #e5e7eb;
            }
            .topic-section {
              page-break-before: always;
              margin-top: 40px;
            }
            .question { 
              background: #f8fafc; 
              border-left: 4px solid #2563eb; 
              padding: 15px; 
              margin: 20px 0;
            }
            .options { 
              margin: 10px 0;
            }
            .option { 
              margin: 5px 0; 
              padding: 5px;
            }
            .correct { 
              background: #dcfce7; 
              font-weight: bold;
            }
            .explanation { 
              background: #fef3c7; 
              padding: 10px; 
              border-radius: 5px; 
              margin-top: 10px;
            }
            @media print {
              body { margin: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${courseName}</h1>
          <div class="toc">
            <h2>Índice</h2>
            <ul>
              ${topics.map((topic, index) => `
                <li>${index + 1}. ${topic.title}</li>
              `).join('')}
            </ul>
          </div>
      `;

      topics.forEach((topic, index) => {
        html += `
          <div class="topic-section">
            <h2>${index + 1}. ${topic.title}</h2>
            <div class="content">
              ${formatContentForPrint(topic.content)}
            </div>
            ${topic.questions && topic.questions.length > 0 ? `
              <h3>Questões de Fixação</h3>
              ${topic.questions.map((question, qIndex) => generateQuestionHTML(question, qIndex + 1)).join('')}
            ` : ''}
          </div>
        `;
      });

      html += `
        </body>
        </html>
      `;
      
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${courseName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_completo.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Download concluído',
        description: 'O material completo foi baixado com sucesso.',
      });
    } catch (error) {
      console.error('Error downloading bundle:', error);
      toast({
        title: 'Erro no download',
        description: 'Não foi possível baixar o material completo.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    isDownloading,
    downloadTopic,
    downloadTopicsAsBundle,
    generateTopicsAsPDF,
  };
}
