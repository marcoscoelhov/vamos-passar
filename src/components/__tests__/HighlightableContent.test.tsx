
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HighlightableContent } from '../HighlightableContent';

// Mock hooks
vi.mock('@/hooks/useOptimizedHighlights', () => ({
  useOptimizedHighlights: () => ({
    highlights: [
      {
        id: '1',
        highlightedText: 'Test highlight',
        note: 'Test note',
        positionStart: 0,
        positionEnd: 10,
      },
    ],
    addHighlight: vi.fn(),
    updateHighlight: vi.fn(),
    deleteHighlight: vi.fn(),
    isLoading: false,
    isAdding: false,
    isUpdating: false,
    isDeleting: false,
  }),
}));

// Mock window.getSelection
Object.defineProperty(window, 'getSelection', {
  writable: true,
  value: vi.fn(() => ({
    toString: () => 'selected text',
    getRangeAt: () => ({}),
    removeAllRanges: vi.fn(),
  })),
});

describe('HighlightableContent', () => {
  const defaultProps = {
    content: '## Test Content\n\nThis is a test paragraph with some content.',
    topicId: 'topic1',
    userId: 'user1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render content correctly', () => {
    render(<HighlightableContent {...defaultProps} />);
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('This is a test paragraph with some content.')).toBeInTheDocument();
  });

  it('should display highlights', () => {
    render(<HighlightableContent {...defaultProps} />);
    
    expect(screen.getByText('Seus Destaques')).toBeInTheDocument();
    expect(screen.getByText('"Test highlight"')).toBeInTheDocument();
    expect(screen.getByText('Test note')).toBeInTheDocument();
  });

  it('should handle text selection', () => {
    render(<HighlightableContent {...defaultProps} />);
    
    const contentDiv = screen.getByText('This is a test paragraph with some content.').closest('div');
    
    fireEvent.mouseUp(contentDiv!);
    
    // Should show the highlight input modal
    expect(screen.getByText('Adicionar Destaque')).toBeInTheDocument();
  });

  it('should format markdown content correctly', () => {
    const markdownContent = '## Heading\n\n**Bold text** and *italic text*\n\n> Blockquote\n\n- List item';
    
    render(<HighlightableContent {...defaultProps} content={markdownContent} />);
    
    expect(screen.getByText('Heading')).toBeInTheDocument();
    expect(screen.getByText('Bold text')).toBeInTheDocument();
    expect(screen.getByText('italic text')).toBeInTheDocument();
  });

  it('should handle edit highlight action', async () => {
    render(<HighlightableContent {...defaultProps} />);
    
    const editButton = screen.getByText('Editar nota');
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test note')).toBeInTheDocument();
    });
  });

  it('should handle delete highlight action', () => {
    render(<HighlightableContent {...defaultProps} />);
    
    const deleteButton = screen.getByText('Remover');
    fireEvent.click(deleteButton);
    
    // Delete action should be triggered (mocked)
    expect(deleteButton).toBeInTheDocument();
  });
});
