
import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useUserProgress } from '@/hooks/useUserProgress';
import { Question, Course } from '@/types/course';
import { logger } from '@/utils/logger';
import { CourseContextType } from './types/CourseContextTypes';
import { useCourseState } from './hooks/useCourseState';
import { useCourseLoader } from './hooks/useCourseLoader';
import { useTopicOperations } from './hooks/useTopicOperations';
import { useProgressOperations } from './hooks/useProgressOperations';
import { useOptimizedCache } from '@/hooks/useOptimizedCache';
import { usePerformance } from './PerformanceContext';
import { useWebWorkerOperations } from '@/hooks/useWebWorkerOperations';

const OptimizedCourseContext = createContext<CourseContextType | undefined>(undefined);

export function useOptimizedCourse() {
  const context = useContext(OptimizedCourseContext);
  if (context === undefined) {
    throw new Error('useOptimizedCourse must be used within an OptimizedCourseProvider');
  }
  return context;
}

interface OptimizedCourseProviderProps {
  children: React.ReactNode;
}

export const OptimizedCourseProvider = React.memo(function OptimizedCourseProvider({ 
  children 
}: OptimizedCourseProviderProps) {
  const { trackRender } = usePerformance();
  const endRender = trackRender('OptimizedCourseProvider');
  
  // Stable references
  const { user, profile, isAuthenticated, signIn, signOut, isLoading: authLoading } = useAuth();
  const { courses: rawCourses, fetchTopics, fetchQuestions } = useCourses();
  const { markTopicCompleted, isTopicCompleted } = useUserProgress(user?.id);
  
  // Web Worker operations
  const { processBatchTopics, calculateProgress } = useWebWorkerOperations();
  
  // Optimized cache
  const questionsCache = useOptimizedCache<Question[]>('questions', {
    maxSize: 50,
    ttl: 10 * 60 * 1000, // 10 minutes
  });

  const coursesCache = useOptimizedCache<Course[]>('courses', {
    maxSize: 10,
    ttl: 30 * 60 * 1000, // 30 minutes
  });

  // Memoized courses transformation
  const courses = useMemo(() => {
    const cacheKey = 'transformed_courses';
    const cached = coursesCache.get(cacheKey);
    
    if (cached && Array.isArray(cached)) {
      return cached;
    }

    if (!rawCourses || !Array.isArray(rawCourses)) {
      return [];
    }

    const transformed: Course[] = rawCourses.map(course => ({
      ...course,
      topics: [],
      progress: 0
    }));

    coursesCache.set(cacheKey, transformed);
    return transformed;
  }, [rawCourses, coursesCache]);

  const {
    currentCourse,
    setCurrentCourse,
    currentTopic,
    setCurrentTopic,
    questionsCache: questionsMapCache,
    setQuestionsCache,
    isLoadingQuestions,
    setIsLoadingQuestions,
    error,
    setError,
    clearError,
    retryOperation,
  } = useCourseState();

  const isLoading = authLoading;

  // Optimized wrapper for markTopicCompleted
  const wrappedMarkTopicCompleted = useCallback(async (topicId: string, completed: boolean): Promise<void> => {
    await markTopicCompleted(topicId, completed);
    // Invalidate relevant caches
    questionsCache.invalidate(`topic_${topicId}`);
  }, [markTopicCompleted, questionsCache]);

  // Optimized hooks with caching
  const { loadCourse } = useCourseLoader({
    courses,
    fetchTopics,
    fetchQuestions,
    questionsCache: questionsMapCache,
    setQuestionsCache,
    user,
    isTopicCompleted,
    setCurrentCourse,
    setError,
    clearError,
  });

  const { handleSetCurrentTopic } = useTopicOperations({
    fetchQuestions,
    questionsCache: questionsMapCache,
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

  // Optimized course loading with caching
  const optimizedLoadCourse = useCallback(async (courseId: string) => {
    const cacheKey = `course_${courseId}`;
    const cached = coursesCache.get(cacheKey);
    
    if (cached && Array.isArray(cached) && cached.length > 0 && !user) {
      const course = cached.find((c: Course) => c.id === courseId);
      if (course) {
        setCurrentCourse(course);
        return;
      }
    }

    await loadCourse(courseId);
  }, [loadCourse, coursesCache, setCurrentCourse, user]);

  // Load first course with optimization
  React.useEffect(() => {
    if (courses && Array.isArray(courses) && courses.length > 0 && !currentCourse && !authLoading) {
      optimizedLoadCourse(courses[0].id);
    }
  }, [courses, authLoading, currentCourse, optimizedLoadCourse]);

  // Set first topic as current when course is loaded
  React.useEffect(() => {
    if (currentCourse && !currentTopic && currentCourse.topics && currentCourse.topics.length > 0) {
      setCurrentTopic(currentCourse.topics[0]);
    }
  }, [currentCourse, currentTopic, setCurrentTopic]);

  const refreshCourse = useCallback(() => {
    if (currentCourse) {
      logger.debug('Refreshing course', { courseId: currentCourse.id });
      // Clear caches for refresh
      coursesCache.invalidate(`course_${currentCourse.id}`);
      questionsCache.invalidate();
      optimizedLoadCourse(currentCourse.id);
    }
  }, [currentCourse, optimizedLoadCourse, coursesCache, questionsCache]);

  const addQuestion = useCallback(async (topicId: string, questionData: Omit<Question, 'id'>) => {
    try {
      clearError();
      // Implementation would go here
      questionsCache.invalidate(`topic_${topicId}`);
      refreshCourse();
    } catch (error) {
      logger.error('Error adding question', { topicId, error });
      setError('Erro ao adicionar questão');
      throw error;
    }
  }, [clearError, setError, questionsCache, refreshCourse]);

  const addTopic = useCallback(async (
    courseId: string, 
    topicData: { title: string; content: string }, 
    parentTopicId?: string
  ) => {
    try {
      clearError();
      // Implementation would go here
      coursesCache.invalidate(`course_${courseId}`);
      refreshCourse();
    } catch (error) {
      logger.error('Error adding topic', { courseId, error });
      setError('Erro ao adicionar tópico');
      throw error;
    }
  }, [clearError, setError, coursesCache, refreshCourse]);

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
      questionsCache.invalidate();
      coursesCache.invalidate();
      clearError();
      logger.info('User logged out, context cleared');
    } catch (error) {
      logger.error('Error during logout', { error });
      setError('Erro ao fazer logout');
    }
  }, [signOut, setCurrentCourse, setCurrentTopic, setQuestionsCache, questionsCache, coursesCache, clearError, setError]);

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
    questionsCache: questionsMapCache,
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
    questionsMapCache,
    isLoadingQuestions,
    error,
    retryOperation,
  ]);

  React.useEffect(() => {
    endRender();
  });

  return (
    <OptimizedCourseContext.Provider value={contextValue}>
      {children}
    </OptimizedCourseContext.Provider>
  );
});
