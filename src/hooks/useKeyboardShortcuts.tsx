
import { useEffect, useCallback } from 'react';
import { useCourse } from '@/contexts/CourseContext';
import { flattenTopicHierarchy } from '@/utils/dataMappers';

export function useKeyboardShortcuts() {
  const { currentCourse, currentTopic, setCurrentTopic, updateTopicProgress } = useCourse();

  const goToNextTopic = useCallback(async () => {
    if (!currentCourse || !currentTopic) return;

    const flatTopics = flattenTopicHierarchy(currentCourse.topics);
    const currentIndex = flatTopics.findIndex(t => t.id === currentTopic.id);
    
    if (currentIndex >= 0 && currentIndex < flatTopics.length - 1) {
      const nextTopic = flatTopics[currentIndex + 1];
      await setCurrentTopic(nextTopic);
    }
  }, [currentCourse, currentTopic, setCurrentTopic]);

  const goToPreviousTopic = useCallback(async () => {
    if (!currentCourse || !currentTopic) return;

    const flatTopics = flattenTopicHierarchy(currentCourse.topics);
    const currentIndex = flatTopics.findIndex(t => t.id === currentTopic.id);
    
    if (currentIndex > 0) {
      const previousTopic = flatTopics[currentIndex - 1];
      await setCurrentTopic(previousTopic);
    }
  }, [currentCourse, currentTopic, setCurrentTopic]);

  const toggleCurrentTopicCompletion = useCallback(async () => {
    if (!currentTopic) return;

    await updateTopicProgress(currentTopic.id, !currentTopic.completed);
  }, [currentTopic, updateTopicProgress]);

  const scrollToQuestions = useCallback(() => {
    const questionsElement = document.getElementById('questions-section');
    if (questionsElement) {
      questionsElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      switch (e.key) {
        case 'ArrowRight':
          if (isCtrlOrCmd) {
            e.preventDefault();
            goToNextTopic();
          }
          break;
        
        case 'ArrowLeft':
          if (isCtrlOrCmd) {
            e.preventDefault();
            goToPreviousTopic();
          }
          break;

        case 'Enter':
          if (isCtrlOrCmd) {
            e.preventDefault();
            toggleCurrentTopicCompletion();
          }
          break;

        case 'q':
          if (isCtrlOrCmd) {
            e.preventDefault();
            scrollToQuestions();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNextTopic, goToPreviousTopic, toggleCurrentTopicCompletion, scrollToQuestions]);

  return {
    goToNextTopic,
    goToPreviousTopic,
    toggleCurrentTopicCompletion,
    scrollToQuestions,
  };
}
