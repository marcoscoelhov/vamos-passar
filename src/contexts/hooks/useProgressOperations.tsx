
import { useCallback } from 'react';
import { Course, Topic } from '@/types/course';
import { logger } from '@/utils/logger';

interface UseProgressOperationsProps {
  user: any;
  markTopicCompleted: (topicId: string, completed: boolean) => Promise<void>;
  currentCourse: Course | null;
  setCurrentCourse: (course: Course | null | ((prev: Course | null) => Course | null)) => void;
  currentTopic: Topic | null;
  setCurrentTopic: (topic: Topic | null | ((prev: Topic | null) => Topic | null)) => void;
  setError: (message: string) => void;
  clearError: () => void;
}

export function useProgressOperations({
  user,
  markTopicCompleted,
  currentCourse,
  setCurrentCourse,
  currentTopic,
  setCurrentTopic,
  setError,
  clearError,
}: UseProgressOperationsProps) {
  const updateTopicProgress = useCallback(async (topicId: string, completed: boolean) => {
    if (!user) return;

    try {
      clearError();
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
  }, [user, markTopicCompleted, currentCourse, currentTopic, setCurrentCourse, setCurrentTopic, setError, clearError]);

  return { updateTopicProgress };
}
