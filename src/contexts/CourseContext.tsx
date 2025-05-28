
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useQuestions } from '@/hooks/useQuestions';
import { useTopics } from '@/hooks/useTopics';
import { Question, Topic, Course, DbQuestion, DbTopic, Profile } from '@/types/course';
import { mapDbQuestionToQuestion, mapDbTopicToTopic, buildTopicHierarchy } from '@/utils/dataMappers';
import { logger } from '@/utils/logger';

interface CourseContextType {
  currentCourse: Course | null;
  currentTopic: Topic | null;
  setCurrentTopic: (topic: Topic) => void;
  updateTopicProgress: (topicId: string, completed: boolean) => void;
  addQuestion: (topicId: string, question: Omit<Question, 'id'>) => Promise<void>;
  addTopic: (courseId: string, topic: { title: string; content: string }, parentTopicId?: string) => Promise<void>;
  user: any;
  profile: Profile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  refreshCourse: () => void;
  questionsCache: Map<string, Question[]>;
  isLoadingQuestions: boolean;
  error: string | null;
  retryOperation: () => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function useCourse() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
}

interface CourseProviderProps {
  children: ReactNode;
}

export const CourseProvider = React.memo(function CourseProvider({ children }: CourseProviderProps) {
  const { user, profile, isAuthenticated, signIn, signOut, isLoading: authLoading } = useAuth();
  const { courses, topics, questions, isLoading: coursesLoading, fetchTopics, fetchQuestions } = useCourses();
  const { markTopicCompleted, isTopicCompleted } = useUserProgress(user?.id);
  const { addQuestion: addQuestionHook } = useQuestions();
  const { addTopic: addTopicHook } = useTopics();

  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [questionsCache, setQuestionsCache] = useState<Map<string, Question[]>>(new Map());
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const isLoading = authLoading || coursesLoading;

  // Memoize expensive calculations
  const memoizedCourseData = useMemo(() => {
    if (!courses.length || !currentCourse) return null;
    return courses.find(c => c.id === currentCourse.id);
  }, [courses, currentCourse?.id]);

  // Load first course and its topics when courses are available
  useEffect(() => {
    if (courses.length > 0 && !currentCourse && !authLoading) {
      loadCourse(courses[0].id);
    }
  }, [courses, authLoading]);

  const loadCourse = useCallback(async (courseId: string) => {
    try {
      setError(null);
      const course = courses.find(c => c.id === courseId);
      if (!course) {
        throw new Error('Curso não encontrado');
      }

      const courseTopics: DbTopic[] = await fetchTopics(courseId);
      
      if (!courseTopics || courseTopics.length === 0) {
        logger.warn('No topics found for course', { courseId });
        setCurrentCourse({
          ...course,
          topics: [],
          progress: 0,
        });
        return;
      }
      
      // Load questions for each topic and check completion status
      const topicsWithQuestions = await Promise.all(
        courseTopics.map(async (dbTopic) => {
          try {
            // Check cache first for questions
            let mappedQuestions: Question[] = [];
            if (questionsCache.has(dbTopic.id)) {
              mappedQuestions = questionsCache.get(dbTopic.id)!;
            } else {
              const dbQuestions: DbQuestion[] = await fetchQuestions(dbTopic.id);
              mappedQuestions = dbQuestions ? dbQuestions.map(mapDbQuestionToQuestion) : [];
              
              // Update cache
              setQuestionsCache(prev => new Map(prev).set(dbTopic.id, mappedQuestions));
            }
            
            const completed = user ? isTopicCompleted(dbTopic.id) : false;
            return mapDbTopicToTopic(dbTopic, mappedQuestions, completed);
          } catch (error) {
            logger.error('Error loading topic data', { topicId: dbTopic.id, error });
            // Return topic without questions if there's an error
            const completed = user ? isTopicCompleted(dbTopic.id) : false;
            return mapDbTopicToTopic(dbTopic, [], completed);
          }
        })
      );

      // Build hierarchical structure
      const hierarchicalTopics = buildTopicHierarchy(topicsWithQuestions);

      // Calculate progress
      const completedTopics = topicsWithQuestions.filter(t => t.completed).length;
      const progress = topicsWithQuestions.length > 0 
        ? (completedTopics / topicsWithQuestions.length) * 100 
        : 0;

      const enrichedCourse: Course = {
        ...course,
        topics: hierarchicalTopics,
        progress,
      };

      setCurrentCourse(enrichedCourse);
      
      // Set first topic as current if none selected
      if (!currentTopic && hierarchicalTopics.length > 0) {
        setCurrentTopic(hierarchicalTopics[0]);
      }

      logger.info('Course loaded successfully', { 
        courseId, 
        topicsCount: topicsWithQuestions.length,
        progress: progress.toFixed(1)
      });
    } catch (error) {
      logger.error('Error loading course', { courseId, error });
      setError(`Erro ao carregar curso: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }, [courses, fetchTopics, fetchQuestions, questionsCache, user, isTopicCompleted, currentTopic]);

  const refreshCourse = useCallback(() => {
    if (currentCourse) {
      logger.debug('Refreshing course', { courseId: currentCourse.id });
      loadCourse(currentCourse.id);
    }
  }, [currentCourse, loadCourse]);

  const retryOperation = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setError(null);
    if (currentCourse) {
      loadCourse(currentCourse.id);
    }
  }, [currentCourse, loadCourse]);

  const handleSetCurrentTopic = useCallback(async (topic: Topic) => {
    try {
      setError(null);
      // Load questions for this topic if not already loaded or cached
      if ((!topic.questions || topic.questions.length === 0) && !questionsCache.has(topic.id)) {
        setIsLoadingQuestions(true);
        try {
          const dbQuestions: DbQuestion[] = await fetchQuestions(topic.id);
          const mappedQuestions = dbQuestions ? dbQuestions.map(mapDbQuestionToQuestion) : [];
          topic.questions = mappedQuestions;
          
          // Update cache
          setQuestionsCache(prev => new Map(prev).set(topic.id, mappedQuestions));
          
          logger.debug('Questions loaded for topic', { topicId: topic.id, questionCount: mappedQuestions.length });
        } catch (error) {
          logger.error('Error loading questions for topic', { topicId: topic.id, error });
          // Continue with empty questions array
          topic.questions = [];
        } finally {
          setIsLoadingQuestions(false);
        }
      } else if (questionsCache.has(topic.id)) {
        // Use cached questions
        topic.questions = questionsCache.get(topic.id)!;
      }
      
      setCurrentTopic(topic);
      logger.debug('Current topic set', { topicId: topic.id, title: topic.title });
    } catch (error) {
      logger.error('Error setting current topic', { topicId: topic.id, error });
      setError('Erro ao carregar tópico');
    }
  }, [fetchQuestions, questionsCache]);

  const updateTopicProgress = useCallback(async (topicId: string, completed: boolean) => {
    if (!user) return;

    try {
      setError(null);
      await markTopicCompleted(topicId, completed);
      
      // Update current course state recursively
      if (currentCourse) {
        const updateTopicInHierarchy = (topics: Topic[]): Topic[] => {
          return topics.map(topic => {
            if (topic.id === topicId) {
              return { ...topic, completed };
            }
            if (topic.children && topic.children.length > 0) {
              return {
                ...topic,
                children: updateTopicInHierarchy(topic.children)
              };
            }
            return topic;
          });
        };

        setCurrentCourse(prev => {
          if (!prev) return prev;
          
          const updatedTopics = updateTopicInHierarchy(prev.topics);
          
          // Calculate new progress
          const allTopics: Topic[] = [];
          const flattenTopics = (topics: Topic[]) => {
            topics.forEach(topic => {
              allTopics.push(topic);
              if (topic.children) {
                flattenTopics(topic.children);
              }
            });
          };
          flattenTopics(updatedTopics);
          
          const completedCount = allTopics.filter(t => t.completed).length;
          const progress = allTopics.length > 0 ? (completedCount / allTopics.length) * 100 : 0;
          
          return {
            ...prev,
            topics: updatedTopics,
            progress,
          };
        });
        
        // Update current topic if it's the one being updated
        if (currentTopic?.id === topicId) {
          setCurrentTopic(prev => prev ? { ...prev, completed } : null);
        }
      }
      
      logger.info('Topic progress updated', { topicId, completed, userId: user.id });
    } catch (error) {
      logger.error('Error updating topic progress', { topicId, completed, userId: user.id, error });
      setError('Erro ao atualizar progresso do tópico');
    }
  }, [user, markTopicCompleted, currentCourse, currentTopic]);

  const addQuestion = useCallback(async (topicId: string, questionData: Omit<Question, 'id'>) => {
    try {
      setError(null);
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
  }, [profile?.is_admin, addQuestionHook, refreshCourse]);

  const addTopic = useCallback(async (
    courseId: string, 
    topicData: { title: string; content: string }, 
    parentTopicId?: string
  ) => {
    try {
      setError(null);
      const isAdmin = profile?.is_admin || false;
      await addTopicHook(courseId, topicData, isAdmin, parentTopicId);
      refreshCourse();
    } catch (error) {
      logger.error('Error adding topic', { courseId, error });
      setError('Erro ao adicionar tópico');
      throw error;
    }
  }, [profile?.is_admin, addTopicHook, refreshCourse]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const result = await signIn(email, password);
      return result.success;
    } catch (error) {
      logger.error('Login error in context', { email, error });
      setError('Erro ao fazer login');
      return false;
    }
  }, [signIn]);

  const logout = useCallback(() => {
    try {
      signOut();
      setCurrentCourse(null);
      setCurrentTopic(null);
      setQuestionsCache(new Map());
      setError(null);
      logger.info('User logged out, context cleared');
    } catch (error) {
      logger.error('Error during logout', { error });
      setError('Erro ao fazer logout');
    }
  }, [signOut]);

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
