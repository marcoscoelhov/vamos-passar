
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useQuestions } from '@/hooks/useQuestions';
import { useTopics } from '@/hooks/useTopics';
import { Question, Topic, Course, DbQuestion, DbTopic, Profile } from '@/types/course';
import { mapDbQuestionToQuestion, mapDbTopicToTopic } from '@/utils/dataMappers';

interface CourseContextType {
  currentCourse: Course | null;
  currentTopic: Topic | null;
  setCurrentTopic: (topic: Topic) => void;
  updateTopicProgress: (topicId: string, completed: boolean) => void;
  addQuestion: (topicId: string, question: Omit<Question, 'id'>) => Promise<void>;
  addTopic: (courseId: string, topic: { title: string; content: string }) => Promise<void>;
  user: any;
  profile: Profile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  refreshCourse: () => void;
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

export function CourseProvider({ children }: CourseProviderProps) {
  const { user, profile, isAuthenticated, signIn, signOut, isLoading: authLoading } = useAuth();
  const { courses, topics, questions, isLoading: coursesLoading, fetchTopics, fetchQuestions } = useCourses();
  const { markTopicCompleted, isTopicCompleted } = useUserProgress(user?.id);
  const { addQuestion: addQuestionHook } = useQuestions();
  const { addTopic: addTopicHook } = useTopics();

  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);

  const isLoading = authLoading || coursesLoading;

  // Load first course and its topics when courses are available
  useEffect(() => {
    if (courses.length > 0 && !currentCourse && !authLoading) {
      loadCourse(courses[0].id);
    }
  }, [courses, authLoading]);

  const loadCourse = async (courseId: string) => {
    try {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;

      const courseTopics: DbTopic[] = await fetchTopics(courseId);
      
      // Load questions for each topic and check completion status
      const topicsWithQuestions = await Promise.all(
        courseTopics.map(async (dbTopic) => {
          const dbQuestions: DbQuestion[] = await fetchQuestions(dbTopic.id);
          const mappedQuestions = dbQuestions.map(mapDbQuestionToQuestion);
          const completed = user ? isTopicCompleted(dbTopic.id) : false;
          
          return mapDbTopicToTopic(dbTopic, mappedQuestions, completed);
        })
      );

      // Calculate progress
      const completedTopics = topicsWithQuestions.filter(t => t.completed).length;
      const progress = topicsWithQuestions.length > 0 
        ? (completedTopics / topicsWithQuestions.length) * 100 
        : 0;

      const enrichedCourse: Course = {
        ...course,
        topics: topicsWithQuestions,
        progress,
      };

      setCurrentCourse(enrichedCourse);
      
      // Set first topic as current if none selected
      if (!currentTopic && topicsWithQuestions.length > 0) {
        setCurrentTopic(topicsWithQuestions[0]);
      }
    } catch (error) {
      console.error('Error loading course:', error);
    }
  };

  const refreshCourse = () => {
    if (currentCourse) {
      loadCourse(currentCourse.id);
    }
  };

  const handleSetCurrentTopic = async (topic: Topic) => {
    // Load questions for this topic if not already loaded
    if (!topic.questions || topic.questions.length === 0) {
      const dbQuestions: DbQuestion[] = await fetchQuestions(topic.id);
      const mappedQuestions = dbQuestions.map(mapDbQuestionToQuestion);
      topic.questions = mappedQuestions;
    }
    
    setCurrentTopic(topic);
  };

  const updateTopicProgress = async (topicId: string, completed: boolean) => {
    if (!user) return;

    try {
      await markTopicCompleted(topicId, completed);
      
      // Update current course state
      if (currentCourse) {
        setCurrentCourse(prev => {
          if (!prev) return prev;
          
          const updatedTopics = prev.topics.map(topic =>
            topic.id === topicId ? { ...topic, completed } : topic
          );
          
          const completedCount = updatedTopics.filter(t => t.completed).length;
          const progress = (completedCount / updatedTopics.length) * 100;
          
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
    } catch (error) {
      console.error('Error updating topic progress:', error);
    }
  };

  const addQuestion = async (topicId: string, questionData: Omit<Question, 'id'>) => {
    const isAdmin = profile?.is_admin || false;
    await addQuestionHook(topicId, questionData, isAdmin);
    refreshCourse();
  };

  const addTopic = async (courseId: string, topicData: { title: string; content: string }) => {
    const isAdmin = profile?.is_admin || false;
    await addTopicHook(courseId, topicData, isAdmin);
    refreshCourse();
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signIn(email, password);
      return result.success;
    } catch (error) {
      console.error('Login error in context:', error);
      return false;
    }
  };

  const logout = () => {
    signOut();
    setCurrentCourse(null);
    setCurrentTopic(null);
  };

  return (
    <CourseContext.Provider value={{
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
    }}>
      {children}
    </CourseContext.Provider>
  );
}
