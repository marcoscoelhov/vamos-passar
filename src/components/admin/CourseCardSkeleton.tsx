
import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Thumbnail Skeleton */}
      <Skeleton className="h-48 w-full" />
      
      {/* Content Skeleton */}
      <div className="p-6 space-y-4">
        {/* Title and Description */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* Price */}
        <div className="space-y-1">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-1">
              <Skeleton className="h-4 w-4 mx-auto" />
              <Skeleton className="h-4 w-8 mx-auto" />
              <Skeleton className="h-3 w-12 mx-auto" />
            </div>
          ))}
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </div>
    </Card>
  );
}
