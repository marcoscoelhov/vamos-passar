
import { MockedFunction } from 'vitest';

/**
 * Common testing utilities and types
 */

export interface MockSupabaseResponse<T = any> {
  data: T[] | T | null;
  error: any;
}

export interface MockSupabaseQuery {
  select: MockedFunction<any>;
  insert: MockedFunction<any>;
  update: MockedFunction<any>;
  delete: MockedFunction<any>;
  eq: MockedFunction<any>;
  order: MockedFunction<any>;
  single: MockedFunction<any>;
}

export interface TestHighlight {
  id: string;
  user_id: string;
  topic_id: string;
  highlighted_text: string;
  position_start: number;
  position_end: number;
  context_before?: string;
  context_after?: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface TestUser {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
}

export interface TestTopic {
  id: string;
  title: string;
  content: string;
  course_id: string;
  level: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface TestCourse {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

/**
 * Mock data factories for testing
 */
export const createMockHighlight = (overrides: Partial<TestHighlight> = {}): TestHighlight => ({
  id: 'highlight-1',
  user_id: 'user-1',
  topic_id: 'topic-1',
  highlighted_text: 'Test highlight text',
  position_start: 0,
  position_end: 18,
  context_before: 'Before text',
  context_after: 'After text',
  note: 'Test note',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides,
});

export const createMockTopic = (overrides: Partial<TestTopic> = {}): TestTopic => ({
  id: 'topic-1',
  title: 'Test Topic',
  content: '## Test Content\n\nThis is test content for the topic.',
  course_id: 'course-1',
  level: 0,
  order_index: 1,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides,
});

export const createMockCourse = (overrides: Partial<TestCourse> = {}): TestCourse => ({
  id: 'course-1',
  title: 'Test Course',
  description: 'This is a test course description.',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides,
});

export const createMockUser = (overrides: Partial<TestUser> = {}): TestUser => ({
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  is_admin: false,
  ...overrides,
});
