
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import { vi, describe, it, expect } from 'vitest';
import { OptimizedEmptyState } from '../OptimizedEmptyState';
import { FileText } from 'lucide-react';

describe('OptimizedEmptyState', () => {
  const defaultProps = {
    title: 'No Data',
    description: 'There is no data to display',
  };

  it('should render title and description', () => {
    render(<OptimizedEmptyState {...defaultProps} />);
    
    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.getByText('There is no data to display')).toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    render(
      <OptimizedEmptyState 
        {...defaultProps} 
        icon={<FileText data-testid="file-icon" />} 
      />
    );
    
    expect(screen.getByTestId('file-icon')).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    const mockAction = {
      label: 'Add Item',
      onClick: vi.fn(),
    };

    render(<OptimizedEmptyState {...defaultProps} action={mockAction} />);
    
    const button = screen.getByText('Add Item');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(mockAction.onClick).toHaveBeenCalled();
  });

  it('should apply size classes correctly', () => {
    const { rerender } = render(<OptimizedEmptyState {...defaultProps} size="sm" />);
    
    // Check if small size class is applied
    const container = screen.getByText('No Data').closest('div');
    expect(container).toHaveClass('p-4', 'space-y-2');
    
    rerender(<OptimizedEmptyState {...defaultProps} size="lg" />);
    expect(container).toHaveClass('p-12', 'space-y-6');
  });

  it('should apply custom className', () => {
    render(<OptimizedEmptyState {...defaultProps} className="custom-class" />);
    
    const container = screen.getByText('No Data').closest('div');
    expect(container).toHaveClass('custom-class');
  });
});
