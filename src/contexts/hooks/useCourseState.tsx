
import { useState, useCallback } from 'react';
import { Course, Topic, Question } from '@/types/course';

export function useCourseState() {
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [questionsCache, setQuestionsCache] = useState<Map<string, Question[]>>(new Map());
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const clearError = useCallback(() => setError(null), []);
  
  const setErrorMessage = useCallback((message: string) => setError(message), []);

  const retryOperation = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setError(null);
  }, []);

  return {
    currentCourse,
    setCurrentCourse,
    currentTopic,
    setCurrentTopic,
    questionsCache,
    setQuestionsCache,
    isLoadingQuestions,
    setIsLoadingQuestions,
    error,
    setError: setErrorMessage,
    clearError,
    retryCount,
    retryOperation,
  };
}
