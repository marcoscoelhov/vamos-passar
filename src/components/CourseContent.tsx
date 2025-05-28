
import React from 'react';
import { useCourse } from '@/contexts/CourseContext';
import { useDownload } from '@/hooks/useDownload';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { HighlightableContent } from './HighlightableContent';
import { Breadcrumbs } from './Breadcrumbs';
import { TopBar } from './TopBar';
import { ArticleHeader } from './ArticleHeader';
import { QuestionsSection } from './QuestionsSection';

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
      <TopBar
        currentTopic={currentTopic}
        isDownloading={isDownloading}
        topicIsBookmarked={topicIsBookmarked}
        onDownloadTopicPDF={handleDownloadTopicPDF}
        onScrollToQuestions={scrollToQuestions}
        onToggleBookmark={handleToggleBookmark}
      />

      {/* Main content area */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Subtle breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs />
        </div>

        {/* Article-style header */}
        <article className="mb-16">
          <ArticleHeader topic={currentTopic} />

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
        <QuestionsSection 
          topic={currentTopic} 
          isLoadingQuestions={isLoadingQuestions} 
        />
      </div>
    </div>
  );
}
