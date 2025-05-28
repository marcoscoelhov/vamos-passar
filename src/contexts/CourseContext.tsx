
import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useQuestions } from '@/hooks/useQuestions';
import { useTopics } from '@/hooks/useTopics';
import { Question } from '@/types/course';
import { logger } from '@/utils/logger';
import { CourseContextType } from './types/CourseContextTypes';
import { useCourseState } from './hooks/useCourseState';
import { useCourseLoader } from './hooks/useCourseLoader';
import { useTopicOperations } from './hooks/useTopicOperations';
import { useProgressOperations } from './hooks/useProgressOperations';

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function useCourse() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
}

interface CourseProviderProps {
  children: React.ReactNode;
}

export const CourseProvider = React.memo(function CourseProvider({ children }: CourseProviderProps) {
  const { user, profile, isAuthenticated, signIn, signOut, isLoading: authLoading } = useAuth();
  const { courses: rawCourses, topics, questions, isLoading: coursesLoading, fetchTopics, fetchQuestions } = useCourses();
  const { markTopicCompleted, isTopicCompleted } = useUserProgress(user?.id);
  const { addQuestion: addQuestionHook } = useQuestions();
  const { addTopic: addTopicHook } = useTopics();

  // Transform courses to match Course type with topics and progress
  const courses = useMemo(() => {
    return rawCourses.map(course => ({
      ...course,
      topics: [],
      progress: 0
    }));
  }, [rawCourses]);

  const {
    currentCourse,
    setCurrentCourse,
    currentTopic,
    setCurrentTopic,
    questionsCache,
    setQuestionsCache,
    isLoadingQuestions,
    setIsLoadingQuestions,
    error,
    setError,
    clearError,
    retryOperation,
  } = useCourseState();

  const isLoading = authLoading || coursesLoading;

  // Wrap markTopicCompleted to match expected signature
  const wrappedMarkTopicCompleted = useCallback(async (topicId: string, completed: boolean): Promise<void> => {
    await markTopicCompleted(topicId, completed);
  }, [markTopicCompleted]);

  const { loadCourse } = useCourseLoader({
    courses,
    fetchTopics,
    fetchQuestions,
    questionsCache,
    setQuestionsCache,
    user,
    isTopicCompleted,
    setCurrentCourse,
    setError,
    clearError,
  });

  const { handleSetCurrentTopic } = useTopicOperations({
    fetchQuestions,
    questionsCache,
    setQuestionsCache,
    setIsLoadingQuestions,
    setCurrentTopic,
    setError,
    clearError,
  });

  const { updateTopicProgress } = useProgressOperations({
    user,
    markTopicCompleted: wrappedMarkTopicCompleted,
    currentCourse,
    setCurrentCourse,
    currentTopic,
    setCurrentTopic,
    setError,
    clearError,
  });

  // Load first course and its topics when courses are available
  useEffect(() => {
    if (courses.length > 0 && !currentCourse && !authLoading) {
      loadCourse(courses[0].id);
    }
  }, [courses, authLoading, currentCourse, loadCourse]);

  // Set first topic as current when course is loaded
  useEffect(() => {
    if (currentCourse && !currentTopic && currentCourse.topics.length > 0) {
      setCurrentTopic(currentCourse.topics[0]);
    }
  }, [currentCourse, currentTopic, setCurrentTopic]);

  const refreshCourse = useCallback(() => {
    if (currentCourse) {
      logger.debug('Refreshing course', { courseId: currentCourse.id });
      loadCourse(currentCourse.id);
    }
  }, [currentCourse, loadCourse]);

  const addQuestion = useCallback(async (topicId: string, questionData: Omit<Question, 'id'>) => {
    try {
      clearError();
      const isAdmin = profile?.is_admin || false;
      await addQuestionHook(topicId, questionData, isAdmin);
      
      // Clear cache for this topic to force reload
      setQuestionsCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(topicId);
        return newCache;
      });
      
      refreshCourse();
    } catch (error) {
      logger.error('Error adding question', { topicId, error });
      setError('Erro ao adicionar questão');
      throw error;
    }
  }, [profile?.is_admin, addQuestionHook, refreshCourse, clearError, setError, setQuestionsCache]);

  const addTopic = useCallback(async (
    courseId: string, 
    topicData: { title: string; content: string }, 
    parentTopicId?: string
  ) => {
    try {
      clearError();
      const isAdmin = profile?.is_admin || false;
      await addTopicHook(courseId, topicData, isAdmin, parentTopicId);
      refreshCourse();
    } catch (error) {
      logger.error('Error adding topic', { courseId, error });
      setError('Erro ao adicionar tópico');
      throw error;
    }
  }, [profile?.is_admin, addTopicHook, refreshCourse, clearError, setError]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      clearError();
      const result = await signIn(email, password);
      return result.success;
    } catch (error) {
      logger.error('Login error in context', { email, error });
      setError('Erro ao fazer login');
      return false;
    }
  }, [signIn, clearError, setError]);

  const logout = useCallback(() => {
    try {
      signOut();
      setCurrentCourse(null);
      setCurrentTopic(null);
      setQuestionsCache(new Map());
      clearError();
      logger.info('User logged out, context cleared');
    } catch (error) {
      logger.error('Error during logout', { error });
      setError('Erro ao fazer logout');
    }
  }, [signOut, setCurrentCourse, setCurrentTopic, setQuestionsCache, clearError, setError]);

  const contextValue = useMemo(() => ({
    currentCourse,
    currentTopic,
    setCurrentTopic: handleSetCurrentTopic,
    updateTopicProgress,
    addQuestion,
    addTopic,
    user,
    profile,
    isAuthenticated,
    login,
    logout,
    isLoading,
    refreshCourse,
    questionsCache,
    isLoadingQuestions,
    error,
    retryOperation,
  }), [
    currentCourse,
    currentTopic,
    handleSetCurrentTopic,
    updateTopicProgress,
    addQuestion,
    addTopic,
    user,
    profile,
    isAuthenticated,
    login,
    logout,
    isLoading,
    refreshCourse,
    questionsCache,
    isLoadingQuestions,
    error,
    retryOperation,
  ]);

  return (
    <CourseContext.Provider value={contextValue}>
      {children}
    </CourseContext.Provider>
  );
});
