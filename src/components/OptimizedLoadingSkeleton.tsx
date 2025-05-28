
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface OptimizedLoadingSkeletonProps {
  variant?: 'card' | 'text' | 'avatar' | 'button' | 'sidebar' | 'content' | 'page' | 'list' | 'form';
  className?: string;
  lines?: number;
  count?: number;
}

const skeletonVariants = {
  card: (className?: string) => (
    <div className={cn('space-y-3 p-4 border rounded-lg', className)}>
      <Skeleton className="h-4 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  ),

  text: (className?: string, lines = 3) => (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn('h-3', i === lines - 1 ? 'w-3/4' : 'w-full')} 
        />
      ))}
    </div>
  ),

  avatar: (className?: string) => (
    <div className={cn('flex items-center space-x-4', className)}>
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  ),

  button: (className?: string) => (
    <Skeleton className={cn('h-10 w-24 rounded-md', className)} />
  ),

  sidebar: (className?: string) => (
    <div className={cn('space-y-4 p-4', className)}>
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  ),

  content: (className?: string) => (
    <div className={cn('space-y-6 p-6', className)}>
      <Skeleton className="h-8 w-2/3" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  ),

  list: (className?: string, count = 5) => (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  ),

  form: (className?: string) => (
    <div className={cn('space-y-4 p-4', className)}>
      <Skeleton className="h-6 w-1/4" />
      <div className="space-y-3">
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  ),

  page: (className?: string) => (
    <div className={cn('space-y-8 p-8', className)}>
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3 p-4 border rounded-lg">
            <Skeleton className="h-6 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
};

export const OptimizedLoadingSkeleton = React.memo(function OptimizedLoadingSkeleton({ 
  variant = 'text', 
  className, 
  lines = 3,
  count = 5
}: OptimizedLoadingSkeletonProps) {
  switch (variant) {
    case 'card':
      return skeletonVariants.card(className);
    case 'text':
      return skeletonVariants.text(className, lines);
    case 'avatar':
      return skeletonVariants.avatar(className);
    case 'button':
      return skeletonVariants.button(className);
    case 'sidebar':
      return skeletonVariants.sidebar(className);
    case 'content':
      return skeletonVariants.content(className);
    case 'list':
      return skeletonVariants.list(className, count);
    case 'form':
      return skeletonVariants.form(className);
    case 'page':
      return skeletonVariants.page(className);
    default:
      return skeletonVariants.text(className, lines);
  }
});
