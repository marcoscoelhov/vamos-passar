
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = React.memo(function EmptyState({
  title,
  description,
  icon,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center space-y-4",
      className
    )}>
      {icon && (
        <div className="text-gray-400 mb-2">
          {icon}
        </div>
      )}
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900">
          {title}
        </h3>
        <p className="text-sm text-gray-500 max-w-md">
          {description}
        </p>
      </div>
      
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  );
});
