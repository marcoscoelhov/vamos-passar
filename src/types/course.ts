
export interface Topic {
  id: string;
  title: string;
  content: string;
  questions?: Question[];
  completed: boolean;
  order: number;
  parentTopicId?: string;
  level: number;
  children?: Topic[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  type: 'multiple-choice';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Course {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
  progress: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface Highlight {
  id: string;
  userId: string;
  topicId: string;
  highlightedText: string;
  contextBefore?: string;
  contextAfter?: string;
  positionStart: number;
  positionEnd: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// Database types
export interface DbQuestion {
  id: string;
  topic_id: string | null;
  question: string;
  options: any; // Json from Supabase
  correct_answer: number;
  explanation: string;
  difficulty: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbTopic {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order_index: number;
  parent_topic_id: string | null;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface DbHighlight {
  id: string;
  user_id: string;
  topic_id: string;
  highlighted_text: string;
  context_before: string | null;
  context_after: string | null;
  position_start: number;
  position_end: number;
  note: string | null;
  created_at: string;
  updated_at: string;
}

// Additional types for better type safety
export interface Profile {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  topic_id: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
