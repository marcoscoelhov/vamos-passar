
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
