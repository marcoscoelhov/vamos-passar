
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

interface CourseContentProps {
  onOpenSidebar: () => void;
  isSidebarOpen: boolean;
}

export function CourseContent({ onOpenSidebar, isSidebarOpen }: CourseContentProps) {
  const { currentTopic, currentCourse, user, profile, isLoadingQuestions, refreshCurrentTopic } = useCourse();
  const { generateTopicsAsPDF, isDownloading } = useDownload();
  const { isBookmarked, toggleBookmark } = useBookmarks(user?.id);
  
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Check if user is admin
  const isAdmin = profile?.is_admin || false;

  if (!currentTopic) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto px-6">
          <h2 className="medium-heading text-gray-900 mb-4">
            Selecione um tópico
          </h2>
          <p className="medium-body text-gray-600 mb-8">
            Escolha um tópico na barra lateral para começar a estudar
          </p>
          <button 
            onClick={onOpenSidebar}
            className="btn-medium-primary lg:hidden"
          >
            Abrir Menu
          </button>
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
        onOpenSidebar={onOpenSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main content area - improved for better readability */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumbs */}
        <div className="mb-8 lg:mb-12">
          <Breadcrumbs />
        </div>

        {/* Article */}
        <article className="mb-16 lg:mb-24">
          <ArticleHeader topic={currentTopic} />

          {/* Content with improved typography and spacing */}
          <div className="content-prose max-w-none">
            <HighlightableContent 
              content={currentTopic.content}
              topicId={currentTopic.id}
              userId={user?.id}
              isAdmin={false}
              onContentUpdated={handleContentUpdated}
              isInAdminPanel={false}
            />
          </div>
        </article>

        {/* Questions section */}
        <QuestionsSection 
          topic={currentTopic} 
          isLoadingQuestions={isLoadingQuestions} 
        />
      </div>
    </div>
  );
}
