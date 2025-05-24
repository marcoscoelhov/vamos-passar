
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

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {currentTopic.title}
            </h1>
            <button
              onClick={handleToggleComplete}
              className="text-gray-400 hover:text-green-600 transition-colors"
            >
              {currentTopic.completed ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <Circle className="w-6 h-6" />
              )}
            </button>
          </div>
          
          {currentTopic.questions && currentTopic.questions.length > 0 && (
            <Button
              onClick={() => setShowQuestions(!showQuestions)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              {showQuestions ? 'Ocultar' : 'Ver'} Questões ({currentTopic.questions.length})
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-6">
          <Badge variant={currentTopic.completed ? "default" : "secondary"}>
            {currentTopic.completed ? 'Concluído' : 'Em andamento'}
          </Badge>
          {currentTopic.questions && (
            <Badge variant="outline">
              {currentTopic.questions.length} questão(ões)
            </Badge>
          )}
        </div>
      </div>

      <article className="prose prose-lg max-w-none">
        <div 
          className="text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ 
            __html: currentTopic.content.replace(/\n/g, '<br />').replace(/#+\s(.+)/g, '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h2>').replace(/###\s(.+)/g, '<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-800">$1</h3>').replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>').replace(/> (.+)/g, '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4">$1</blockquote>').replace(/- (.+)/g, '<li class="mb-2">$1</li>').replace(/^\d+\.\s(.+)/gm, '<li class="mb-2">$1</li>')
          }}
        />
      </article>

      {showQuestions && currentTopic.questions && currentTopic.questions.length > 0 && (
        <Card className="mt-12 p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Questões de Concurso
            </h2>
          </div>
          
          <div className="space-y-6">
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
