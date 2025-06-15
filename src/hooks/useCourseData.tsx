
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DbQuestion, DbTopic } from '@/types/course';
import { useQueryClient } from '@tanstack/react-query';

interface Course {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface CacheManager<T> {
  getCacheEntry: (key: string) => T | null;
  setCacheEntry: (key: string, data: T) => void;
  invalidateCache: (key?: string) => void;
}

function createCacheManager<T>(): CacheManager<T> {
  const cache = new Map<string, { data: T; timestamp: number }>();
  const TTL = 30 * 60 * 1000; // 30 minutes

  return {
    getCacheEntry: (key: string) => {
      const entry = cache.get(key);
      if (entry && (Date.now() - entry.timestamp) < TTL) {
        return entry.data;
      }
      cache.delete(key);
      return null;
    },
    setCacheEntry: (key: string, data: T) => {
      cache.set(key, { data, timestamp: Date.now() });
    },
    invalidateCache: (key?: string) => {
      if (key) {
        cache.delete(key);
      } else {
        cache.clear();
      }
    }
  };
}

export function useCourseData() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [topics, setTopics] = useState<DbTopic[]>([]);
  const [questions, setQuestions] = useState<DbQuestion[]>([]);
  const [loadingStates, setLoadingStates] = useState({
    courses: false,
    topics: false,
    questions: false,
  });
  
  const topicsCache = createCacheManager<DbTopic[]>();
  const questionsCache = createCacheManager<DbQuestion[]>();

  const fetchCourses = useCallback(async () => {
    try {
      setLoadingStates(prev => ({ ...prev, courses: true }));
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, courses: false }));
    }
  }, []);

  const fetchTopics = useCallback(async (courseId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, topics: true }));

      // Check cache first
      const cachedTopics = topicsCache.getCacheEntry(courseId);
      if (cachedTopics) {
        setTopics(cachedTopics);
        return cachedTopics;
      }

      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('course_id', courseId)
        .order('level', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) {
        throw error;
      }

      const topicsData = data || [];
      
      // Update cache
      topicsCache.setCacheEntry(courseId, topicsData);
      
      setTopics(topicsData);
      return topicsData;
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, topics: false }));
    }
  }, []);

  const fetchQuestions = useCallback(async (topicId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, questions: true }));

      // Check cache first
      const cachedQuestions = questionsCache.getCacheEntry(topicId);
      if (cachedQuestions) {
        setQuestions(cachedQuestions);
        return cachedQuestions;
      }

      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      const questionsData = data || [];
      
      // Update cache
      questionsCache.setCacheEntry(topicId, questionsData);
      
      setQuestions(questionsData);
      return questionsData;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, questions: false }));
    }
  }, []);

  const invalidateCache = useCallback((type: 'topics' | 'questions', id?: string) => {
    if (type === 'topics') {
      topicsCache.invalidateCache(id);
    } else if (type === 'questions') {
      questionsCache.invalidateCache(id);
    }
  }, []);

  return {
    courses,
    topics,
    questions,
    loadingStates,
    fetchCourses,
    fetchTopics,
    fetchQuestions,
    invalidateCache,
  };
}
