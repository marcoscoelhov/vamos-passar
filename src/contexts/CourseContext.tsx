
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useUserProgress } from '@/hooks/useUserProgress';
import { Question, Topic, Course, DbQuestion, DbTopic } from '@/types/course';
import { mapDbQuestionToQuestion, mapDbTopicToTopic } from '@/utils/dataMappers';

interface CourseContextType {
  currentCourse: Course | null;
  currentTopic: Topic | null;
  setCurrentTopic: (topic: Topic) => void;
  updateTopicProgress: (topicId: string, completed: boolean) => void;
  addQuestion: (topicId: string, question: Omit<Question, 'id' | 'topic_id'>) => Promise<void>;
  addTopic: (courseId: string, topic: { title: string; content: string }) => Promise<void>;
  user: any;
  profile: any;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
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
  const { courses, topics, questions, isLoading: coursesLoading, fetchTopics, fetchQuestions, addTopic: addTopicToDb, addQuestion: addQuestionToDb } = useCourses();
  const { markTopicCompleted, saveQuestionAttempt, isTopicCompleted } = useUserProgress(user?.id);

  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);

  const isLoading = authLoading || coursesLoading;

  // Load first course and its topics when courses are available
  useEffect(() => {
    if (courses.length > 0 && !currentCourse) {
      loadCourse(courses[0].id);
    }
  }, [courses]);

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

  const addQuestion = async (topicId: string, questionData: Omit<Question, 'id' | 'topic_id'>) => {
    if (!profile?.is_admin) {
      throw new Error('Apenas administradores podem adicionar questões');
    }

    try {
      await addQuestionToDb(
        topicId,
        questionData.question,
        questionData.options,
        questionData.correctAnswer,
        questionData.explanation,
        questionData.difficulty
      );

      // Refresh current topic if it's the one being updated
      if (currentTopic?.id === topicId) {
        const dbQuestions: DbQuestion[] = await fetchQuestions(topicId);
        const mappedQuestions = dbQuestions.map(mapDbQuestionToQuestion);
        setCurrentTopic(prev => prev ? { ...prev, questions: mappedQuestions } : null);
      }
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  };

  const addTopic = async (courseId: string, topicData: { title: string; content: string }) => {
    if (!profile?.is_admin) {
      throw new Error('Apenas administradores podem adicionar tópicos');
    }

    try {
      await addTopicToDb(courseId, topicData.title, topicData.content);
      
      // Reload the course to get updated topics
      await loadCourse(courseId);
    } catch (error) {
      console.error('Error adding topic:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await signIn(email, password);
    return result.success;
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
    }}>
      {children}
    </CourseContext.Provider>
  );
}
