
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useQuestions } from '@/hooks/useQuestions';
import { useTopics } from '@/hooks/useTopics';
import { Question, Topic, Course, DbQuestion, DbTopic } from '@/types/course';
import { mapDbQuestionToQuestion, mapDbTopicToTopic, buildTopicHierarchy } from '@/utils/dataMappers';

export function useCourseState() {
  const { user, profile, isAuthenticated, signIn, signOut, isLoading: authLoading } = useAuth();
  const { courses, topics, questions, isLoading: coursesLoading, fetchTopics, fetchQuestions } = useCourses();
  const { markTopicCompleted, isTopicCompleted } = useUserProgress(user?.id);
  const { addQuestion: addQuestionHook } = useQuestions();
  const { addTopic: addTopicHook } = useTopics();

  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [questionsCache, setQuestionsCache] = useState<Map<string, Question[]>>(new Map());
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

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
      const course = courses.find(c => c.id === courseId);
      if (!course) return;

      const courseTopics: DbTopic[] = await fetchTopics(courseId);
      
      // Load questions for each topic and check completion status
      const topicsWithQuestions = await Promise.all(
        courseTopics.map(async (dbTopic) => {
          // Check cache first for questions
          let mappedQuestions: Question[] = [];
          if (questionsCache.has(dbTopic.id)) {
            mappedQuestions = questionsCache.get(dbTopic.id)!;
          } else {
            const dbQuestions: DbQuestion[] = await fetchQuestions(dbTopic.id);
            mappedQuestions = dbQuestions.map(mapDbQuestionToQuestion);
            
            // Update cache
            setQuestionsCache(prev => new Map(prev).set(dbTopic.id, mappedQuestions));
          }
          
          const completed = user ? isTopicCompleted(dbTopic.id) : false;
          return mapDbTopicToTopic(dbTopic, mappedQuestions, completed);
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
    } catch (error) {
      console.error('Error loading course:', error);
    }
  }, [courses, fetchTopics, fetchQuestions, questionsCache, user, isTopicCompleted, currentTopic]);

  const handleSetCurrentTopic = useCallback(async (topic: Topic) => {
    // Load questions for this topic if not already loaded or cached
    if ((!topic.questions || topic.questions.length === 0) && !questionsCache.has(topic.id)) {
      setIsLoadingQuestions(true);
      try {
        const dbQuestions: DbQuestion[] = await fetchQuestions(topic.id);
        const mappedQuestions = dbQuestions.map(mapDbQuestionToQuestion);
        topic.questions = mappedQuestions;
        
        // Update cache
        setQuestionsCache(prev => new Map(prev).set(topic.id, mappedQuestions));
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setIsLoadingQuestions(false);
      }
    } else if (questionsCache.has(topic.id)) {
      // Use cached questions
      topic.questions = questionsCache.get(topic.id)!;
    }
    
    setCurrentTopic(topic);
  }, [fetchQuestions, questionsCache]);

  const refreshCurrentTopic = useCallback(async () => {
    if (currentTopic) {
      // Clear cache for current topic to force fresh data
      setQuestionsCache(prev => {
        const newMap = new Map(prev);
        newMap.delete(currentTopic.id);
        return newMap;
      });
      
      // Reload the current topic with fresh data
      await handleSetCurrentTopic(currentTopic);
    }
  }, [currentTopic, handleSetCurrentTopic]);

  const refreshCourse = useCallback(() => {
    if (currentCourse) {
      loadCourse(currentCourse.id);
    }
  }, [currentCourse, loadCourse]);

  // Wrapper functions to match expected return types
  const wrappedMarkTopicCompleted = useCallback(async (topicId: string, completed: boolean) => {
    const result = await markTopicCompleted(topicId, completed);
    return result;
  }, [markTopicCompleted]);

  const wrappedAddQuestionHook = useCallback(async (topicId: string, questionData: Omit<Question, 'id'>, isAdmin: boolean) => {
    const result = await addQuestionHook(topicId, questionData, isAdmin);
    return result;
  }, [addQuestionHook]);

  const wrappedAddTopicHook = useCallback(async (courseId: string, topicData: { title: string; content: string }, isAdmin: boolean, parentTopicId?: string) => {
    const result = await addTopicHook(courseId, topicData, isAdmin, parentTopicId);
    return result;
  }, [addTopicHook]);

  return {
    // State
    currentCourse,
    currentTopic,
    questionsCache,
    isLoadingQuestions,
    isLoading,
    user,
    profile,
    isAuthenticated,
    
    // Actions
    setCurrentCourse,
    setCurrentTopic: handleSetCurrentTopic,
    setQuestionsCache,
    loadCourse,
    refreshCourse,
    refreshCurrentTopic,
    
    // Hooks with proper return types
    markTopicCompleted: wrappedMarkTopicCompleted,
    addQuestionHook: wrappedAddQuestionHook,
    addTopicHook: wrappedAddTopicHook,
    signIn,
    signOut,
  };
}
