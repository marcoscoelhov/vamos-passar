
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, BookOpen, Target } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';
import { QuestionBlock } from '@/components/QuestionBlock';

export function CourseContent() {
  const { currentTopic, updateTopicProgress } = useCourse();
  const [showQuestions, setShowQuestions] = useState(false);

  if (!currentTopic) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Selecione um tópico para começar</p>
        </div>
      </div>
    );
  }

  const handleToggleComplete = () => {
    updateTopicProgress(currentTopic.id, !currentTopic.completed);
  };

  // Função para formatar o conteúdo removendo markdown e aplicando formatação HTML limpa
  const formatContent = (content: string) => {
    return content
      // Remove markdown headers e converte para HTML
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-gray-800 mt-8 mb-4 leading-tight">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-6 leading-tight">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-gray-900 mt-12 mb-8 leading-tight">$1</h1>')
      // Remove markdown bold e aplica formatação
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      // Remove markdown italic
      .replace(/\*(.+?)\*/g, '<em class="italic text-gray-700">$1</em>')
      // Converte blockquotes
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-400 pl-6 py-2 my-6 bg-blue-50 rounded-r-lg"><p class="text-gray-700 italic">$1</p></blockquote>')
      // Converte listas não ordenadas
      .replace(/^- (.+)$/gm, '<li class="mb-2 text-gray-700 leading-relaxed">$1</li>')
      // Converte listas ordenadas
      .replace(/^\d+\. (.+)$/gm, '<li class="mb-2 text-gray-700 leading-relaxed">$1</li>')
      // Converte quebras de linha
      .replace(/\n\n/g, '</p><p class="mb-6 text-gray-700 leading-relaxed text-lg">')
      // Wrap parágrafos
      .replace(/^([^<].*)$/gm, '<p class="mb-6 text-gray-700 leading-relaxed text-lg">$1</p>')
      // Limpa tags vazias
      .replace(/<p class="[^"]*"><\/p>/g, '');
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              {currentTopic.title}
            </h1>
            <button
              onClick={handleToggleComplete}
              className="text-gray-400 hover:text-green-600 transition-colors ml-3"
            >
              {currentTopic.completed ? (
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              ) : (
                <Circle className="w-7 h-7" />
              )}
            </button>
          </div>
          
          {currentTopic.questions && currentTopic.questions.length > 0 && (
            <Button
              onClick={() => setShowQuestions(!showQuestions)}
              variant="outline"
              className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
            >
              <Target className="w-4 h-4" />
              {showQuestions ? 'Ocultar' : 'Ver'} Questões ({currentTopic.questions.length})
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-3 mb-8">
          <Badge variant={currentTopic.completed ? "default" : "secondary"} className="px-3 py-1">
            {currentTopic.completed ? 'Concluído' : 'Em andamento'}
          </Badge>
          {currentTopic.questions && (
            <Badge variant="outline" className="px-3 py-1">
              {currentTopic.questions.length} questão(ões)
            </Badge>
          )}
        </div>
      </div>

      <article className="prose prose-lg max-w-none">
        <div 
          className="text-content"
          dangerouslySetInnerHTML={{ 
            __html: formatContent(currentTopic.content)
          }}
          style={{
            lineHeight: '1.8',
            fontSize: '18px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        />
      </article>

      {showQuestions && currentTopic.questions && currentTopic.questions.length > 0 && (
        <Card className="mt-16 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 rounded-lg p-2">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Questões de Concurso
            </h2>
          </div>
          
          <div className="space-y-8">
            {currentTopic.questions.map((question, index) => (
              <QuestionBlock
                key={question.id}
                question={question}
                questionNumber={index + 1}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
