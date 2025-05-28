
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  color?: 'primary' | 'secondary' | 'white';
  center?: boolean;
}

export function LoadingSpinner({ 
  size = 'md', 
  className, 
  text, 
  color = 'primary',
  center = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'border-muted border-t-primary',
    secondary: 'border-muted border-t-secondary',
    white: 'border-gray-200/30 border-t-white'
  };

  const spinnerElement = (
    <div 
      className={cn(
        'animate-spin rounded-full border-2 transition-colors duration-300', 
        sizeClasses[size], 
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Carregando"
    />
  );

  if (center) {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        {spinnerElement}
        {text && (
          <span className={cn(
            "text-sm animate-pulse",
            color === 'white' ? 'text-white/80' : 'text-muted-foreground'
          )}>
            {text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {spinnerElement}
      {text && (
        <span className={cn(
          "text-sm animate-pulse",
          color === 'white' ? 'text-white/80' : 'text-muted-foreground'
        )}>
          {text}
        </span>
      )}
    </div>
  );
}
