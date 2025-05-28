
import React from 'react';
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
import { AnswerKeyModal } from './AnswerKeyModal';

export function CourseContent() {
  const { currentTopic, currentCourse, user, profile, isLoadingQuestions, refreshCurrentTopic } = useCourse();
  const { generateTopicsAsPDF, isDownloading } = useDownload();
  const { isBookmarked, toggleBookmark } = useBookmarks(user?.id);
  
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Check if user is admin - usar profile ao invés de user
  const isAdmin = profile?.is_admin || false;

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

  const handleContentUpdated = (newContent: string) => {
    // Content has been updated, we could refresh the topic context
    // or handle other side effects here
    console.log('Content updated for topic:', currentTopic.id);
  };

  const topicIsBookmarked = isBookmarked(currentTopic.id);

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle top bar */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GlobalSearch />
              <KeyboardShortcuts />
            </div>
            
            <div className="flex items-center gap-2">
              {/* Minimalist action buttons */}
              {currentTopic.questions && currentTopic.questions.length > 0 && (
                <Button
                  onClick={scrollToQuestions}
                  variant="ghost"
                  size="sm"
                  className="btn-minimal text-xs font-medium"
                >
                  <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
                  Questões
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadTopicPDF}
                disabled={isDownloading}
                className="btn-minimal text-xs font-medium"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                {isDownloading ? 'Baixando...' : 'PDF'}
              </Button>

              {currentTopic.questions && currentTopic.questions.length > 0 && (
                <AnswerKeyModal topic={currentTopic}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="btn-minimal text-xs font-medium"
                  >
                    <Key className="w-3.5 h-3.5 mr-1.5" />
                    Gabarito
                  </Button>
                </AnswerKeyModal>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleBookmark}
                className="btn-minimal p-2"
              >
                {topicIsBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-amber-600" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Subtle breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs />
        </div>

        {/* Article-style header */}
        <article className="mb-16">
          <header className="mb-12 text-center">
            <h1 className="font-serif text-4xl font-semibold text-gray-900 mb-4 leading-tight">
              {currentTopic.title}
            </h1>
            
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              {currentTopic.level > 0 && (
                <span>Subtópico • Nível {currentTopic.level}</span>
              )}
              {currentTopic.completed && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Concluído
                </Badge>
              )}
            </div>
          </header>

          {/* Clean content without card wrapper */}
          <div className="content-prose">
            <HighlightableContent 
              content={currentTopic.content}
              topicId={currentTopic.id}
              userId={user?.id}
              isAdmin={isAdmin}
              onContentUpdated={handleContentUpdated}
            />
          </div>
        </article>

        {/* Questions section with subtle separation */}
        {isLoadingQuestions ? (
          <div className="pt-16 border-t border-gray-100">
            <div className="text-center text-gray-500 mb-8">
              Carregando questões...
            </div>
          </div>
        ) : (
          currentTopic.questions && currentTopic.questions.length > 0 && (
            <section id="questions-section" className="pt-16 border-t border-gray-100">
              <div className="text-center mb-12">
                <h2 className="font-serif text-3xl font-semibold text-gray-900 mb-3">
                  Questões de Fixação
                </h2>
                <p className="text-gray-500 text-sm">
                  {currentTopic.questions.length} questão{currentTopic.questions.length > 1 ? 'ões' : ''}
                </p>
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
            </section>
          )
        )}
      </div>
    </div>
  );
}
