
import { Topic, Question } from '@/types/course';

export const formatContentForPrint = (content: string): string => {
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

export const generateQuestionHTML = (question: Question, number: number): string => {
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

export const generateTopicHTML = (topic: Topic, includeQuestions: boolean = true): string => {
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

export const generateTopicsBundle = (topics: Topic[], courseName: string): string => {
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
  
  return html;
};
