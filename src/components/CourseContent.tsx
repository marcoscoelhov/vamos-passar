
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useCourse } from '@/contexts/CourseContext';
import { QuestionBlock } from './QuestionBlock';

export function CourseContent() {
  const { currentTopic } = useCourse();

  if (!currentTopic) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Selecione um tópico
          </h2>
          <p className="text-gray-600">
            Escolha um tópico na barra lateral para começar a estudar
          </p>
        </div>
      </div>
    );
  }

  // Função para converter markdown simples para HTML
  const formatContent = (content: string) => {
    return content
      .replace(/## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-900 mb-4 mt-6">$1</h2>')
      .replace(/### (.*$)/gim, '<h3 class="text-xl font-semibold text-gray-800 mb-3 mt-5">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-700 bg-blue-50 py-2">$1</blockquote>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^\n/, '<p class="mb-4">')
      + '</p>';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Cabeçalho do tópico */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {currentTopic.title}
          </h1>
          {currentTopic.completed && (
            <Badge className="bg-green-100 text-green-800">
              Concluído
            </Badge>
          )}
        </div>
      </div>

      {/* Conteúdo do tópico */}
      <Card className="p-8 mb-8">
        <div 
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(currentTopic.content) 
          }}
        />
      </Card>

      {/* Seção de questões */}
      {currentTopic.questions && currentTopic.questions.length > 0 && (
        <div id="questions-section" className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Questões de Fixação
            </h2>
            <Badge variant="outline" className="text-sm">
              {currentTopic.questions.length} questão(ões)
            </Badge>
          </div>
          
          {currentTopic.questions.map((question, index) => (
            <QuestionBlock
              key={question.id}
              question={question}
              questionNumber={index + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
