
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { CourseContextType } from '@/types/courseContext';
import { useCourseState } from '@/hooks/useCourseState';
import { useCourseContextOperations } from '@/hooks/useCourseContextOperations';

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
  const courseState = useCourseState();
  const courseOperations = useCourseContextOperations({
    user: courseState.user,
    profile: courseState.profile,
    currentCourse: courseState.currentCourse,
    currentTopic: courseState.currentTopic,
    setCurrentCourse: courseState.setCurrentCourse,
    setCurrentTopic: courseState.setCurrentTopic,
    setQuestionsCache: courseState.setQuestionsCache,
    markTopicCompleted: courseState.markTopicCompleted,
    addQuestionHook: courseState.addQuestionHook,
    addTopicHook: courseState.addTopicHook,
    signIn: courseState.signIn,
    signOut: courseState.signOut,
    refreshCourse: courseState.refreshCourse,
  });

  const contextValue = useMemo(() => ({
    currentCourse: courseState.currentCourse,
    currentTopic: courseState.currentTopic,
    setCurrentTopic: courseState.setCurrentTopic,
    updateTopicProgress: courseOperations.updateTopicProgress,
    addQuestion: courseOperations.addQuestion,
    addTopic: courseOperations.addTopic,
    user: courseState.user,
    profile: courseState.profile,
    isAuthenticated: courseState.isAuthenticated,
    login: courseOperations.login,
    logout: courseOperations.logout,
    isLoading: courseState.isLoading,
    refreshCourse: courseState.refreshCourse,
    refreshCurrentTopic: courseState.refreshCurrentTopic,
    questionsCache: courseState.questionsCache,
    isLoadingQuestions: courseState.isLoadingQuestions,
  }), [
    courseState.currentCourse,
    courseState.currentTopic,
    courseState.setCurrentTopic,
    courseOperations.updateTopicProgress,
    courseOperations.addQuestion,
    courseOperations.addTopic,
    courseState.user,
    courseState.profile,
    courseState.isAuthenticated,
    courseOperations.login,
    courseOperations.logout,
    courseState.isLoading,
    courseState.refreshCourse,
    courseState.refreshCurrentTopic,
    courseState.questionsCache,
    courseState.isLoadingQuestions,
  ]);

  return (
    <CourseContext.Provider value={contextValue}>
      {children}
    </CourseContext.Provider>
  );
});
