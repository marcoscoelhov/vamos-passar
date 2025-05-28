
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OptimizedEmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'p-4 space-y-2',
  md: 'p-8 space-y-4', 
  lg: 'p-12 space-y-6'
};

const iconSizes = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16'
};

const titleSizes = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl'
};

export const OptimizedEmptyState = React.memo(function OptimizedEmptyState({
  title,
  description,
  icon,
  action,
  className,
  size = 'md'
}: OptimizedEmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      sizeClasses[size],
      className
    )}>
      {icon && (
        <div className={cn("text-gray-400 mb-2", iconSizes[size])}>
          {icon}
        </div>
      )}
      
      <div className="space-y-2">
        <h3 className={cn("font-medium text-gray-900", titleSizes[size])}>
          {title}
        </h3>
        <p className="text-sm text-gray-500 max-w-md">
          {description}
        </p>
      </div>
      
      {action && (
        <Button 
          onClick={action.onClick} 
          variant={action.variant || 'default'}
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
});
