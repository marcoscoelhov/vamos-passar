
import { Question, Topic, Course, Profile } from '@/types/course';

export interface CourseContextType {
  currentCourse: Course | null;
  currentTopic: Topic | null;
  setCurrentTopic: (topic: Topic) => void;
  updateTopicProgress: (topicId: string, completed: boolean) => Promise<void>;
  addQuestion: (topicId: string, question: Omit<Question, 'id'>) => Promise<void>;
  addTopic: (courseId: string, topic: { title: string; content: string }, parentTopicId?: string) => Promise<void>;
  user: any;
  profile: Profile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  refreshCourse: () => void;
  refreshCurrentTopic: () => void;
  questionsCache: Map<string, Question[]>;
  isLoadingQuestions: boolean;
}
