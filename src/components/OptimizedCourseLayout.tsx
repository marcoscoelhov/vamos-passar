
import React, { Suspense, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Header } from '@/components/Header';
import { OptimizedLoadingSkeleton } from '@/components/OptimizedLoadingSkeleton';
import { usePerformance } from '@/contexts/PerformanceContext';
import { logger } from '@/utils/logger';

// Preload critical components
const CourseSidebar = React.lazy(() => 
  import('@/components/CourseSidebar').then(module => {
    logger.debug('CourseSidebar component loaded');
    return { default: module.CourseSidebar };
  })
);

const CourseContent = React.lazy(() => 
  import('@/components/CourseContent').then(module => {
    logger.debug('CourseContent component loaded');
    return { default: module.CourseContent };
  })
);

// Preload components when layout mounts
const preloadComponents = () => {
  // Preload sidebar immediately
  import('@/components/CourseSidebar').catch(logger.error);
  
  // Preload content after a short delay
  setTimeout(() => {
    import('@/components/CourseContent').catch(logger.error);
  }, 100);
};

export const OptimizedCourseLayout = React.memo(function OptimizedCourseLayout() {
  const { trackRender } = usePerformance();
  const endRender = trackRender('OptimizedCourseLayout');
  
  useEffect(() => {
    preloadComponents();
    endRender();
  }, [endRender]);

  logger.debug('OptimizedCourseLayout rendering');
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SidebarProvider>
        <div className="flex w-full">
          <Suspense 
            fallback={
              <div className="w-80 border-r border-border">
                <OptimizedLoadingSkeleton variant="sidebar" className="h-screen" />
              </div>
            }
          >
            <CourseSidebar />
          </Suspense>
          
          <main className="flex-1 transition-all duration-300">
            <Suspense 
              fallback={
                <div className="p-6">
                  <OptimizedLoadingSkeleton variant="content" className="w-full h-96" />
                </div>
              }
            >
              <CourseContent />
            </Suspense>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
});
