
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, HelpCircle } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';
import { useDownload } from '@/hooks/useDownload';
import { QuestionBlock } from './QuestionBlock';
import { HighlightableContent } from './HighlightableContent';

export function CourseContent() {
  const { currentTopic, currentCourse, user } = useCourse();
  const { downloadTopicsAsBundle, isDownloading } = useDownload();

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

  const handleDownloadCourse = () => {
    if (currentCourse) {
      downloadTopicsAsBundle(currentCourse.topics, currentCourse.title);
    }
  };

  const scrollToQuestions = () => {
    const questionsElement = document.getElementById('questions-section');
    if (questionsElement) {
      questionsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Cabeçalho do tópico */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {currentTopic.title}
              </h1>
              {currentTopic.completed && (
                <Badge className="bg-green-100 text-green-800">
                  Concluído
                </Badge>
              )}
            </div>
            {currentTopic.level > 0 && (
              <div className="text-sm text-gray-500">
                Subtópico • Nível {currentTopic.level}
              </div>
            )}
          </div>
          
          {/* Botão de download do curso */}
          {currentCourse && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadCourse}
              disabled={isDownloading}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar Curso
            </Button>
          )}
        </div>
      </div>

      {/* Conteúdo do tópico com highlights */}
      <Card className="p-8 mb-8">
        <HighlightableContent 
          content={currentTopic.content}
          topicId={currentTopic.id}
          userId={user?.id}
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

      {/* Botão flutuante para questões */}
      {currentTopic.questions && currentTopic.questions.length > 0 && (
        <Button
          onClick={scrollToQuestions}
          className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white shadow-lg rounded-full w-12 h-12 p-0"
          title="Ir para questões"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
