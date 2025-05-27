
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const TopicContentSkeleton = React.memo(function TopicContentSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/2" />
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        <Skeleton className="h-6 w-2/5" />
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        
        {/* List items skeleton */}
        <div className="space-y-3 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <Skeleton className="h-2 w-2 rounded-full mt-2" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </div>
        
        {/* Questions section skeleton */}
        <div className="mt-8 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <div className="grid gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="flex items-center space-x-2">
                      <Skeleton className="h-3 w-3 rounded" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
