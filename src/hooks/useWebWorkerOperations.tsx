
import { useCallback, useRef, useEffect } from 'react';
import { logger } from '@/utils/logger';

interface WorkerTask<T = any> {
  id: string;
  type: string;
  payload: any;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

export function useWebWorkerOperations() {
  const workerRef = useRef<Worker | null>(null);
  const pendingTasks = useRef(new Map<string, WorkerTask>());

  useEffect(() => {
    // Create worker inline to avoid separate file
    const workerCode = `
      self.onmessage = function(e) {
        const { id, type, payload } = e.data;
        
        try {
          let result;
          
          switch (type) {
            case 'PROCESS_TOPICS':
              result = processBatchTopics(payload);
              break;
            case 'FILTER_QUESTIONS':
              result = filterQuestions(payload);
              break;
            case 'CALCULATE_PROGRESS':
              result = calculateProgress(payload);
              break;
            case 'SORT_HIERARCHY':
              result = sortTopicHierarchy(payload);
              break;
            default:
              throw new Error('Unknown task type: ' + type);
          }
          
          self.postMessage({ id, result, success: true });
        } catch (error) {
          self.postMessage({ id, error: error.message, success: false });
        }
      };
      
      function processBatchTopics(topics) {
        return topics.map(topic => ({
          ...topic,
          processed: true,
          processedAt: Date.now()
        }));
      }
      
      function filterQuestions(data) {
        const { questions, filters } = data;
        return questions.filter(q => {
          if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
          if (filters.search && !q.question.toLowerCase().includes(filters.search.toLowerCase())) return false;
          return true;
        });
      }
      
      function calculateProgress(topics) {
        const total = topics.length;
        const completed = topics.filter(t => t.completed).length;
        return { total, completed, percentage: total > 0 ? (completed / total) * 100 : 0 };
      }
      
      function sortTopicHierarchy(topics) {
        return topics.sort((a, b) => {
          if (a.level !== b.level) return a.level - b.level;
          return a.order_index - b.order_index;
        });
      }
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    try {
      workerRef.current = new Worker(workerUrl);
      
      workerRef.current.onmessage = (e) => {
        const { id, result, error, success } = e.data;
        const task = pendingTasks.current.get(id);
        
        if (task) {
          if (success) {
            task.resolve(result);
          } else {
            task.reject(new Error(error));
          }
          pendingTasks.current.delete(id);
        }
      };

      workerRef.current.onerror = (error) => {
        logger.error('Web Worker error', error);
      };
    } catch (error) {
      logger.warn('Web Worker not supported, falling back to main thread', { error });
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        URL.revokeObjectURL(workerUrl);
      }
    };
  }, []);

  const executeTask = useCallback(<T = any>(type: string, payload: any): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        // Fallback to main thread
        resolve(payload as T);
        return;
      }

      const id = Math.random().toString(36).substr(2, 9);
      
      pendingTasks.current.set(id, {
        id,
        type,
        payload,
        resolve,
        reject,
      });

      workerRef.current.postMessage({ id, type, payload });
    });
  }, []);

  const processBatchTopics = useCallback((topics: any[]) => {
    return executeTask('PROCESS_TOPICS', topics);
  }, [executeTask]);

  const filterQuestions = useCallback((questions: any[], filters: any) => {
    return executeTask('FILTER_QUESTIONS', { questions, filters });
  }, [executeTask]);

  const calculateProgress = useCallback((topics: any[]) => {
    return executeTask('CALCULATE_PROGRESS', topics);
  }, [executeTask]);

  const sortTopicHierarchy = useCallback((topics: any[]) => {
    return executeTask('SORT_HIERARCHY', topics);
  }, [executeTask]);

  return {
    processBatchTopics,
    filterQuestions,
    calculateProgress,
    sortTopicHierarchy,
  };
}
