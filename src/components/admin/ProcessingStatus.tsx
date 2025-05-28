
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProcessingStatusProps {
  stage: 'uploading' | 'processing' | 'extracting' | 'complete' | 'error';
  progress: number;
  message: string;
  className?: string;
  error?: string;
  onRetry?: () => void;
}

export const ProcessingStatus = React.memo(function ProcessingStatus({ 
  stage, 
  progress, 
  message,
  className,
  error,
  onRetry
}: ProcessingStatusProps) {
  const bgColor = {
    uploading: 'bg-blue-50',
    processing: 'bg-blue-50',
    extracting: 'bg-blue-50',
    complete: 'bg-green-50',
    error: 'bg-red-50'
  };
  
  const textColor = {
    uploading: 'text-blue-900',
    processing: 'text-blue-900',
    extracting: 'text-blue-900',
    complete: 'text-green-900',
    error: 'text-red-900'
  };
  
  return (
    <div className={cn(
      "space-y-3 p-4 rounded-md", 
      bgColor[stage],
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {stage !== 'complete' && stage !== 'error' && (
            <LoadingSpinner size="sm" />
          )}
          <span className={cn("text-sm font-medium", textColor[stage])}>
            {message}
          </span>
        </div>
        <span className={cn("text-sm", textColor[stage])}>
          {progress}%
        </span>
      </div>
      
      <Progress 
        value={progress} 
        className={cn(
          "h-2",
          stage === 'error' ? 'bg-red-100' : '',
          stage === 'complete' ? 'bg-green-100' : ''
        )} 
      />
      
      {error && (
        <div className="mt-2 text-sm text-red-800">
          {error}
          {onRetry && (
            <button 
              onClick={onRetry}
              className="ml-2 underline hover:text-red-700"
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}
    </div>
  );
});
