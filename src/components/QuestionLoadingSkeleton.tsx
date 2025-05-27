
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const QuestionLoadingSkeleton = React.memo(function QuestionLoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        {/* Question title skeleton */}
        <Skeleton className="h-6 w-3/4" />
        
        {/* Question content skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        
        {/* Options skeleton */}
        <div className="space-y-3 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
        
        {/* Button skeleton */}
        <div className="mt-6">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
});
