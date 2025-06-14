
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
  // Novos campos para o sistema de múltiplos cursos
  category_id?: string;
  course_type?: 'online' | 'presencial' | 'hibrido';
  status?: 'rascunho' | 'ativo' | 'pausado' | 'encerrado';
  duration_hours?: number;
  target_audience?: string;
  prerequisites?: string;
  instructor_id?: string;
  certificate_available?: boolean;
  thumbnail_url?: string;
  price?: number;
  discount_price?: number;
  max_installments?: number;
  created_at?: string;
  updated_at?: string;
}

// Interface específica para o sistema de múltiplos cursos
export interface CourseListItem {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  course_type?: 'online' | 'presencial' | 'hibrido';
  status?: 'rascunho' | 'ativo' | 'pausado' | 'encerrado';
  duration_hours?: number;
  target_audience?: string;
  prerequisites?: string;
  instructor_id?: string;
  certificate_available?: boolean;
  thumbnail_url?: string;
  price?: number;
  discount_price?: number;
  max_installments?: number;
  created_at: string;
  updated_at: string;
  // Dados relacionados do Supabase
  course_categories?: {
    name: string;
    color?: string;
  };
  profiles?: {
    name: string;
  };
}

export interface CourseCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrollment_status: 'pendente' | 'ativo' | 'concluido' | 'cancelado';
  payment_method?: 'pix' | 'boleto' | 'cartao_credito' | 'cartao_debito';
  amount_paid?: number;
  installments?: number;
  enrolled_at: string;
  completed_at?: string;
  certificate_issued_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseReview {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseCoupon {
  id: string;
  code: string;
  course_id?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses?: number;
  current_uses: number;
  valid_from: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
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

// Updated Profile interface with new fields
export interface Profile {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  role: 'admin' | 'professor' | 'student';
  must_change_password: boolean;
  first_login: boolean;
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

export interface ProfessorPermission {
  id: string;
  professor_id: string;
  permission_name: string;
  granted: boolean;
  granted_by: string | null;
  created_at: string;
  updated_at: string;
}

export const PROFESSOR_PERMISSIONS = {
  MANAGE_TOPICS: 'manage_topics',
  MANAGE_QUESTIONS: 'manage_questions',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_STUDENTS: 'manage_students',
  MANAGE_HIERARCHY: 'manage_hierarchy',
  BULK_CONTENT: 'bulk_content',
} as const;

export type ProfessorPermissionType = typeof PROFESSOR_PERMISSIONS[keyof typeof PROFESSOR_PERMISSIONS];
