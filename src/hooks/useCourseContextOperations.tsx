
import { useCallback } from 'react';
import { Question, Topic } from '@/types/course';

interface UseCourseContextOperationsProps {
  user: any;
  profile: any;
  currentCourse: any;
  currentTopic: Topic | null;
  setCurrentCourse: (course: any) => void;
  setCurrentTopic: (topic: Topic) => void;
  setQuestionsCache: (fn: (prev: Map<string, Question[]>) => Map<string, Question[]>) => void;
  markTopicCompleted: (topicId: string, completed: boolean) => Promise<any>;
  addQuestionHook: (topicId: string, questionData: Omit<Question, 'id'>, isAdmin: boolean) => Promise<any>;
  addTopicHook: (courseId: string, topicData: { title: string; content: string }, isAdmin: boolean, parentTopicId?: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => void;
  refreshCourse: () => void;
}

export function useCourseContextOperations({
  user,
  profile,
  currentCourse,
  currentTopic,
  setCurrentCourse,
  setCurrentTopic,
  setQuestionsCache,
  markTopicCompleted,
  addQuestionHook,
  addTopicHook,
  signIn,
  signOut,
  refreshCourse,
}: UseCourseContextOperationsProps) {

  const updateTopicProgress = useCallback(async (topicId: string, completed: boolean) => {
    if (!user) return;

    try {
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

        setCurrentCourse((prev: any) => {
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
          setCurrentTopic({ ...currentTopic, completed });
        }
      }
    } catch (error) {
      console.error('Error updating topic progress:', error);
    }
  }, [user, markTopicCompleted, currentCourse, currentTopic, setCurrentCourse, setCurrentTopic]);

  const addQuestion = useCallback(async (topicId: string, questionData: Omit<Question, 'id'>) => {
    const isAdmin = profile?.is_admin || false;
    await addQuestionHook(topicId, questionData, isAdmin);
    
    // Clear cache for this topic to force reload
    setQuestionsCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(topicId);
      return newCache;
    });
    
    refreshCourse();
  }, [profile?.is_admin, addQuestionHook, refreshCourse, setQuestionsCache]);

  const addTopic = useCallback(async (
    courseId: string, 
    topicData: { title: string; content: string }, 
    parentTopicId?: string
  ) => {
    const isAdmin = profile?.is_admin || false;
    await addTopicHook(courseId, topicData, isAdmin, parentTopicId);
    refreshCourse();
  }, [profile?.is_admin, addTopicHook, refreshCourse]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signIn(email, password);
      return result.success;
    } catch (error) {
      console.error('Login error in context:', error);
      return false;
    }
  }, [signIn]);

  const logout = useCallback(() => {
    signOut();
    setCurrentCourse(null);
    setCurrentTopic(null);
    setQuestionsCache(() => new Map<string, Question[]>());
  }, [signOut, setCurrentCourse, setCurrentTopic, setQuestionsCache]);

  return {
    updateTopicProgress,
    addQuestion,
    addTopic,
    login,
    logout,
  };
}
