
import React from 'react';
import { useCourse } from '@/contexts/CourseContext';
import { useDownload } from '@/hooks/useDownload';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { CourseContentHeader } from '@/components/course-content/CourseContentHeader';
import { TopicHeader } from '@/components/course-content/TopicHeader';
import { TopicContentSection } from '@/components/course-content/TopicContentSection';
import { QuestionsSection } from '@/components/course-content/QuestionsSection';
import { logger } from '@/utils/logger';

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
      logger.debug('Generating PDF for topic', { 
        topicId: currentTopic.id, 
        topicTitle: currentTopic.title 
      });
      generateTopicsAsPDF([currentTopic], currentTopic.title);
    }
  };

  const scrollToQuestions = () => {
    const questionsElement = document.getElementById('questions-section');
    if (questionsElement) {
      questionsElement.scrollIntoView({ behavior: 'smooth' });
      logger.debug('Scrolled to questions section');
    }
  };

  const handleToggleBookmark = () => {
    logger.debug('Toggling bookmark for topic', { 
      topicId: currentTopic.id,
      topicTitle: currentTopic.title 
    });
    toggleBookmark(currentTopic.id, currentTopic.title);
  };

  const topicIsBookmarked = isBookmarked(currentTopic.id);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <CourseContentHeader
        currentTopic={currentTopic}
        isDownloading={isDownloading}
        onDownloadTopicPDF={handleDownloadTopicPDF}
        onScrollToQuestions={scrollToQuestions}
      />

      <TopicHeader
        currentTopic={currentTopic}
        topicIsBookmarked={topicIsBookmarked}
        onToggleBookmark={handleToggleBookmark}
      />

      <TopicContentSection
        currentTopic={currentTopic}
        userId={user?.id}
      />

      <QuestionsSection
        currentTopic={currentTopic}
        isLoadingQuestions={isLoadingQuestions}
      />
    </div>
  );
}
