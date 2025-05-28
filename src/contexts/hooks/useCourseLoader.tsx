
import { useCallback } from 'react';
import { Course, Topic, Question, DbQuestion, DbTopic } from '@/types/course';
import { mapDbQuestionToQuestion, mapDbTopicToTopic, buildTopicHierarchy } from '@/utils/dataMappers';
import { logger } from '@/utils/logger';

interface UseCourseLoaderProps {
  courses: Course[];
  fetchTopics: (courseId: string) => Promise<DbTopic[]>;
  fetchQuestions: (topicId: string) => Promise<DbQuestion[]>;
  questionsCache: Map<string, Question[]>;
  setQuestionsCache: (cache: Map<string, Question[]>) => void;
  user: any;
  isTopicCompleted: (topicId: string) => boolean;
  setCurrentCourse: (course: Course | null) => void;
  setError: (message: string) => void;
  clearError: () => void;
}

export function useCourseLoader({
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
}: UseCourseLoaderProps) {
  const loadCourse = useCallback(async (courseId: string) => {
    try {
      clearError();
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

      logger.info('Course loaded successfully', { 
        courseId, 
        topicsCount: topicsWithQuestions.length,
        progress: progress.toFixed(1)
      });
    } catch (error) {
      logger.error('Error loading course', { courseId, error });
      setError(`Erro ao carregar curso: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }, [courses, fetchTopics, fetchQuestions, questionsCache, setQuestionsCache, user, isTopicCompleted, setCurrentCourse, setError, clearError]);

  return { loadCourse };
}
