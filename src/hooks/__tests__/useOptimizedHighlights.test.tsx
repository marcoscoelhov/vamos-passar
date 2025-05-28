
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useOptimizedHighlights } from '../useOptimizedHighlights';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({ subscribe: vi.fn() })),
      unsubscribe: vi.fn(),
    })),
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useOptimizedHighlights', () => {
  const mockSupabaseResponse = {
    data: [
      {
        id: '1',
        user_id: 'user1',
        topic_id: 'topic1',
        highlighted_text: 'Test highlight',
        position_start: 0,
        position_end: 10,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    ],
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue(mockSupabaseResponse),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockResolvedValue({ error: null }),
      single: vi.fn().mockResolvedValue(mockSupabaseResponse),
    };

    (supabase.from as any).mockReturnValue(mockQuery);
  });

  it('should fetch highlights on mount', async () => {
    const { result } = renderHook(() =>
      useOptimizedHighlights({
        topicId: 'topic1',
        userId: 'user1',
      })
    );

    await waitFor(() => {
      expect(result.current.highlights).toHaveLength(1);
    });

    expect(result.current.highlights[0].highlightedText).toBe('Test highlight');
  });

  it('should handle add highlight', async () => {
    const { result } = renderHook(() =>
      useOptimizedHighlights({
        topicId: 'topic1',
        userId: 'user1',
      })
    );

    await act(async () => {
      await result.current.addHighlight(
        'New highlight',
        10,
        20,
        'before',
        'after',
        'note'
      );
    });

    expect(supabase.from).toHaveBeenCalledWith('user_highlights');
  });

  it('should handle update highlight', async () => {
    const { result } = renderHook(() =>
      useOptimizedHighlights({
        topicId: 'topic1',
        userId: 'user1',
      })
    );

    await act(async () => {
      await result.current.updateHighlight('1', 'Updated note');
    });

    expect(supabase.from).toHaveBeenCalledWith('user_highlights');
  });

  it('should handle delete highlight', async () => {
    const { result } = renderHook(() =>
      useOptimizedHighlights({
        topicId: 'topic1',
        userId: 'user1',
      })
    );

    await act(async () => {
      await result.current.deleteHighlight('1');
    });

    expect(supabase.from).toHaveBeenCalledWith('user_highlights');
  });

  it('should use cache when available', async () => {
    // First render to populate cache
    const { unmount } = renderHook(() =>
      useOptimizedHighlights({
        topicId: 'topic1',
        userId: 'user1',
      })
    );

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalled();
    });

    unmount();
    vi.clearAllMocks();

    // Second render should use cache
    const { result } = renderHook(() =>
      useOptimizedHighlights({
        topicId: 'topic1',
        userId: 'user1',
      })
    );

    // Should have data immediately from cache
    expect(result.current.highlights).toHaveLength(1);
  });
});
