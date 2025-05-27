import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, HelpCircle, Bookmark, BookmarkCheck, Key } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';
import { useDownload } from '@/hooks/useDownload';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { QuestionBlock } from './QuestionBlock';
import { HighlightableContent } from './HighlightableContent';
import { Breadcrumbs } from './Breadcrumbs';
import { GlobalSearch } from './GlobalSearch';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { TopicContentSkeleton } from './TopicContentSkeleton';
import { AnswerKeyModal } from './AnswerKeyModal';

export function CourseContent() {
  const { currentTopic, currentCourse, user, isLoadingQuestions } = useCourse();
  const { generateTopicsAsPDF, isDownloading } = useDownload();
  const { isBookmarked, toggleBookmark } = useBookmarks(user?.id);
  
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

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

  const handleDownloadTopicPDF = () => {
    if (currentTopic && currentCourse) {
      generateTopicsAsPDF([currentTopic], currentTopic.title);
    }
  };

  const scrollToQuestions = () => {
    const questionsElement = document.getElementById('questions-section');
    if (questionsElement) {
      questionsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleToggleBookmark = () => {
    toggleBookmark(currentTopic.id, currentTopic.title);
  };

  const topicIsBookmarked = isBookmarked(currentTopic.id);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Barra superior com busca e atalhos */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GlobalSearch />
          <KeyboardShortcuts />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Botão para questões */}
          {currentTopic.questions && currentTopic.questions.length > 0 && (
            <Button
              onClick={scrollToQuestions}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Questões
            </Button>
          )}

          {/* Botão de download do tópico atual em PDF */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTopicPDF}
            disabled={isDownloading}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? 'Baixando...' : 'PDF'}
          </Button>

          {/* Botão de gabarito */}
          {currentTopic.questions && currentTopic.questions.length > 0 && (
            <AnswerKeyModal topic={currentTopic}>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                Gabarito
              </Button>
            </AnswerKeyModal>
          )}
        </div>
      </div>

      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Cabeçalho do tópico */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {currentTopic.title}
              </h1>
              
              {/* Botão de marcador */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleBookmark}
                className="text-gray-400 hover:text-yellow-500"
              >
                {topicIsBookmarked ? (
                  <BookmarkCheck className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </Button>
              
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
      {isLoadingQuestions ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Carregando questões...
          </h2>
          {/* Skeleton loading for questions could go here */}
        </div>
      ) : (
        currentTopic.questions && currentTopic.questions.length > 0 && (
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
        )
      )}
    </div>
  );
}
