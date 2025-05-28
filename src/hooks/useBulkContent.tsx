
import { useBulkContentOperations } from './useBulkContentOperations';

interface UseBulkContentProps {
  addTopic: (courseId: string, title: string, content: string, parentTopicId?: string) => Promise<any>;
  addQuestion: (topicId: string, question: string, options: string[], correctAnswer: number, explanation: string, difficulty: 'easy' | 'medium' | 'hard') => Promise<any>;
}

export function useBulkContent({ addTopic, addQuestion }: UseBulkContentProps) {
  return useBulkContentOperations({ addTopic, addQuestion });
}
