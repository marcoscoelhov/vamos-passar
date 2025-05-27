
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProcessingStatusProps {
  stage: 'uploading' | 'processing' | 'extracting' | 'complete';
  progress: number;
  message: string;
}

export function ProcessingStatus({ stage, progress, message }: ProcessingStatusProps) {
  return (
    <div className="space-y-3 p-4 bg-blue-50 rounded-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-blue-900">
          {message}
        </span>
        <span className="text-sm text-blue-700">
          {progress}%
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
