
export interface Topic {
  id: string;
  title: string;
  content: string;
  questions?: Question[];
  completed: boolean;
  order: number;
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
  created_at: string;
  updated_at: string;
}
