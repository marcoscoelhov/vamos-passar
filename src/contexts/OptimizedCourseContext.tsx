
import React, { createContext, useContext, useMemo, useCallback, useRef } from 'react';
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
import { useOptimizedOperations } from '@/hooks/useOptimizedOperations';

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
  
  // Stable references using refs
  const authDataRef = useRef({ user: null, profile: null, isAuthenticated: false, isLoading: true });
  const coursesDataRef = useRef({ courses: [], fetchTopics: null, fetchQuestions: null });
  const progressDataRef = useRef({ markTopicCompleted: null, isTopicCompleted: null });
  
  // Use optimized operations for debouncing and throttling
  const { debounce, throttle, batchOperation } = useOptimizedOperations();
  
  // Stable references
  const { user, profile, isAuthenticated, signIn, signOut, isLoading: authLoading } = useAuth();
  const { courses: rawCourses, fetchTopics, fetchQuestions } = useCourses();
  const { markTopicCompleted, isTopicCompleted } = useUserProgress(user?.id);
  
  // Update refs with current values
  authDataRef.current = { user, profile, isAuthenticated, isLoading: authLoading };
  coursesDataRef.current = { courses: rawCourses || [], fetchTopics, fetchQuestions };
  progressDataRef.current = { markTopicCompleted, isTopicCompleted };
  
  // Web Worker operations
  const { processBatchTopics, calculateProgress } = useWebWorkerOperations();
  
  // Optimized cache with stable references
  const questionsCache = useOptimizedCache<Question[]>('questions', {
    maxSize: 50,
    ttl: 10 * 60 * 1000, // 10 minutes
  });

  const coursesCache = useOptimizedCache<Course[]>('courses', {
    maxSize: 10,
    ttl: 30 * 60 * 1000, // 30 minutes
  });

  // Debounced cache operations
  const debouncedCacheSet = useCallback(
    debounce('cache_set', (key: string, data: Course[]) => {
      coursesCache.set(key, data);
    }, { delay: 100 }),
    [debounce, coursesCache]
  );

  // Memoized courses transformation with stable cache
  const courses = useMemo(() => {
    const cacheKey = 'transformed_courses';
    const cached = coursesCache.get(cacheKey);
    
    if (cached && Array.isArray(cached)) {
      return cached;
    }

    if (!rawCourses || !Array.isArray(rawCourses)) {
      return [];
    }

    const transformed: Course[] = rawCourses.map((course: any) => ({
      ...course,
      topics: course.topics || [],
      progress: course.progress || 0
    } as Course));

    // Use debounced cache set to prevent excessive updates
    debouncedCacheSet(cacheKey, transformed);
    return transformed;
  }, [rawCourses, coursesCache, debouncedCacheSet]);

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

  // Throttled wrapper for markTopicCompleted with proper Promise return
  const wrappedMarkTopicCompleted = useCallback(
    throttle('mark_topic_completed', async (topicId: string, completed: boolean): Promise<void> => {
      if (progressDataRef.current.markTopicCompleted) {
        await progressDataRef.current.markTopicCompleted(topicId, completed);
        // Invalidate relevant caches
        questionsCache.invalidate(`topic_${topicId}`);
      }
    }, 500),
    [throttle, questionsCache]
  );

  // Optimized hooks with caching and stable references
  const { loadCourse } = useCourseLoader({
    courses,
    fetchTopics: coursesDataRef.current.fetchTopics,
    fetchQuestions: coursesDataRef.current.fetchQuestions,
    questionsCache: questionsMapCache,
    setQuestionsCache,
    user: authDataRef.current.user,
    isTopicCompleted: progressDataRef.current.isTopicCompleted,
    setCurrentCourse,
    setError,
    clearError,
  });

  const { handleSetCurrentTopic } = useTopicOperations({
    fetchQuestions: coursesDataRef.current.fetchQuestions,
    questionsCache: questionsMapCache,
    setQuestionsCache,
    setIsLoadingQuestions,
    setCurrentTopic,
    setError,
    clearError,
  });

  const { updateTopicProgress } = useProgressOperations({
    user: authDataRef.current.user,
    markTopicCompleted: wrappedMarkTopicCompleted,
    currentCourse,
    setCurrentCourse,
    currentTopic,
    setCurrentTopic,
    setError,
    clearError,
  });

  // Optimized course loading with caching and circuit breaker
  const loadCourseCount = useRef(0);
  const optimizedLoadCourse = useCallback(
    debounce('load_course', async (courseId: string) => {
      // Circuit breaker - prevent excessive loading
      if (loadCourseCount.current > 10) {
        logger.warn('Circuit breaker activated for course loading');
        return;
      }
      
      loadCourseCount.current++;
      
      try {
        const cacheKey = `course_${courseId}`;
        const cached = coursesCache.get(cacheKey);
        
        if (cached && Array.isArray(cached) && cached.length > 0 && !authDataRef.current.user) {
          const course = cached.find((c: Course) => c.id === courseId);
          if (course) {
            setCurrentCourse(course);
            return;
          }
        }

        await loadCourse(courseId);
      } finally {
        // Reset counter after delay
        setTimeout(() => {
          loadCourseCount.current = Math.max(0, loadCourseCount.current - 1);
        }, 5000);
      }
    }, { delay: 300 }),
    [debounce, loadCourse, coursesCache, setCurrentCourse]
  );

  // Load first course with optimization and circuit breaker
  const firstCourseLoaded = useRef(false);
  React.useEffect(() => {
    if (courses && Array.isArray(courses) && courses.length > 0 && !currentCourse && !authLoading && !firstCourseLoaded.current) {
      firstCourseLoaded.current = true;
      optimizedLoadCourse(courses[0].id);
    }
  }, [courses, authLoading, currentCourse, optimizedLoadCourse]);

  // Set first topic as current when course is loaded
  const firstTopicSet = useRef(false);
  React.useEffect(() => {
    if (currentCourse && !currentTopic && currentCourse.topics && currentCourse.topics.length > 0 && !firstTopicSet.current) {
      firstTopicSet.current = true;
      setCurrentTopic(currentCourse.topics[0]);
    }
  }, [currentCourse, currentTopic, setCurrentTopic]);

  // Reset refs when course changes
  React.useEffect(() => {
    firstTopicSet.current = false;
  }, [currentCourse?.id]);

  const refreshCourse = useCallback(
    throttle('refresh_course', () => {
      if (currentCourse) {
        logger.debug('Refreshing course', { courseId: currentCourse.id });
        // Clear caches for refresh
        coursesCache.invalidate(`course_${currentCourse.id}`);
        questionsCache.invalidate();
        optimizedLoadCourse(currentCourse.id);
      }
    }, 1000),
    [currentCourse, optimizedLoadCourse, coursesCache, questionsCache, throttle]
  );

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
      // Reset refs
      firstCourseLoaded.current = false;
      firstTopicSet.current = false;
      loadCourseCount.current = 0;
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
