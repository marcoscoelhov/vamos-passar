
import { useState, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DbQuestion, DbTopic } from '@/types/course';
import { useCacheManager } from './useCacheManager';
import { useOptimizedLoadingStates } from './useOptimizedLoadingStates';
import { logger } from '@/utils/logger';

interface Course {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface BatchFetchOptions {
  batchSize?: number;
  parallel?: boolean;
}

export function useOptimizedCourseData() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [topics, setTopics] = useState<DbTopic[]>([]);
  const [questions, setQuestions] = useState<DbQuestion[]>([]);
  
  const topicsCache = useCacheManager<DbTopic[]>();
  const questionsCache = useCacheManager<DbQuestion[]>();
  const coursesCache = useCacheManager<Course[]>();
  
  const { setLoading, isLoading, withLoading, batchSetLoading } = useOptimizedLoadingStates();
  
  // Request deduplication
  const activeRequests = useRef(new Map<string, Promise<any>>());

  const deduplicateRequest = useCallback(<T,>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> => {
    if (activeRequests.current.has(key)) {
      return activeRequests.current.get(key)!;
    }

    const promise = requestFn().finally(() => {
      activeRequests.current.delete(key);
    });

    activeRequests.current.set(key, promise);
    return promise;
  }, []);

  const fetchCourses = useCallback(async (forceRefresh = false) => {
    const cacheKey = 'all_courses';
    
    // Check cache first
    if (!forceRefresh) {
      const cached = coursesCache.getCacheEntry(cacheKey);
      if (cached) {
        setCourses(cached);
        logger.debug('Courses loaded from cache', { count: cached.length });
        return cached;
      }
    }

    return deduplicateRequest(cacheKey, () =>
      withLoading('courses', async () => {
        logger.debug('Fetching courses from database');

        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;

        const coursesData = data || [];
        
        // Update cache and state
        coursesCache.setCacheEntry(cacheKey, coursesData);
        setCourses(coursesData);
        
        logger.info('Courses fetched and cached', { count: coursesData.length });
        return coursesData;
      })
    );
  }, [coursesCache, deduplicateRequest, withLoading]);

  const fetchTopics = useCallback(async (courseId: string, forceRefresh = false) => {
    const cacheKey = `topics_${courseId}`;
    
    // Check cache first
    if (!forceRefresh) {
      const cached = topicsCache.getCacheEntry(cacheKey);
      if (cached) {
        setTopics(cached);
        logger.debug('Topics loaded from cache', { courseId, count: cached.length });
        return cached;
      }
    }

    return deduplicateRequest(cacheKey, () =>
      withLoading('topics', async () => {
        logger.debug('Fetching topics from database', { courseId });

        const { data, error } = await supabase
          .from('topics')
          .select('*')
          .eq('course_id', courseId)
          .order('level', { ascending: true })
          .order('order_index', { ascending: true });

        if (error) throw error;

        const topicsData = data || [];
        
        // Update cache and state
        topicsCache.setCacheEntry(cacheKey, topicsData);
        setTopics(topicsData);
        
        logger.info('Topics fetched and cached', { courseId, count: topicsData.length });
        return topicsData;
      })
    );
  }, [topicsCache, deduplicateRequest, withLoading]);

  const fetchQuestions = useCallback(async (topicId: string, forceRefresh = false) => {
    const cacheKey = `questions_${topicId}`;
    
    // Check cache first
    if (!forceRefresh) {
      const cached = questionsCache.getCacheEntry(cacheKey);
      if (cached) {
        setQuestions(cached);
        logger.debug('Questions loaded from cache', { topicId, count: cached.length });
        return cached;
      }
    }

    return deduplicateRequest(cacheKey, () =>
      withLoading('questions', async () => {
        logger.debug('Fetching questions from database', { topicId });

        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('topic_id', topicId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const questionsData = data || [];
        
        // Update cache and state
        questionsCache.setCacheEntry(cacheKey, questionsData);
        setQuestions(questionsData);
        
        logger.info('Questions fetched and cached', { topicId, count: questionsData.length });
        return questionsData;
      })
    );
  }, [questionsCache, deduplicateRequest, withLoading]);

  const batchFetchQuestions = useCallback(async (
    topicIds: string[], 
    options: BatchFetchOptions = {}
  ) => {
    const { batchSize = 5, parallel = true } = options;
    
    if (parallel) {
      // Parallel processing for better performance
      const batches = [];
      for (let i = 0; i < topicIds.length; i += batchSize) {
        const batch = topicIds.slice(i, i + batchSize);
        batches.push(Promise.all(batch.map(topicId => fetchQuestions(topicId))));
      }
      
      batchSetLoading({ [`batch_questions`]: true });
      
      try {
        const results = await Promise.all(batches);
        return results.flat();
      } finally {
        batchSetLoading({ [`batch_questions`]: false });
      }
    } else {
      // Sequential processing to avoid overwhelming the database
      const results = [];
      for (const topicId of topicIds) {
        const questions = await fetchQuestions(topicId);
        results.push(questions);
      }
      return results;
    }
  }, [fetchQuestions, batchSetLoading]);

  const prefetchTopicQuestions = useCallback(async (topicId: string) => {
    // Prefetch questions without blocking the UI
    setTimeout(() => {
      fetchQuestions(topicId).catch(error => {
        logger.warn('Prefetch failed for topic questions', { topicId, error });
      });
    }, 100);
  }, [fetchQuestions]);

  const invalidateCache = useCallback((type: 'topics' | 'questions' | 'courses', id?: string) => {
    switch (type) {
      case 'courses':
        coursesCache.invalidateCache('all_courses');
        logger.debug('Courses cache invalidated');
        break;
      case 'topics':
        if (id) {
          topicsCache.invalidateCache(`topics_${id}`);
          logger.debug('Topics cache invalidated', { courseId: id });
        } else {
          topicsCache.invalidateCache();
          logger.debug('All topics cache invalidated');
        }
        break;
      case 'questions':
        if (id) {
          questionsCache.invalidateCache(`questions_${id}`);
          logger.debug('Questions cache invalidated', { topicId: id });
        } else {
          questionsCache.invalidateCache();
          logger.debug('All questions cache invalidated');
        }
        break;
    }
  }, [topicsCache, questionsCache, coursesCache]);

  const getLoadingStates = useCallback(() => ({
    courses: isLoading('courses'),
    topics: isLoading('topics'),
    questions: isLoading('questions'),
    batchQuestions: isLoading('batch_questions'),
  }), [isLoading]);

  return useMemo(() => ({
    courses,
    topics,
    questions,
    loadingStates: getLoadingStates(),
    fetchCourses,
    fetchTopics,
    fetchQuestions,
    batchFetchQuestions,
    prefetchTopicQuestions,
    invalidateCache,
  }), [
    courses,
    topics,
    questions,
    getLoadingStates,
    fetchCourses,
    fetchTopics,
    fetchQuestions,
    batchFetchQuestions,
    prefetchTopicQuestions,
    invalidateCache,
  ]);
}
