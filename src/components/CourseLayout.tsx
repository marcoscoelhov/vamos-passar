
import React, { Suspense } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Header } from '@/components/Header';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { logger } from '@/utils/logger';

// Lazy load components
const CourseSidebar = React.lazy(() => 
  import('@/components/CourseSidebar').then(module => {
    logger.debug('CourseSidebar component loaded');
    return { default: module.CourseSidebar };
  }).catch(error => {
    logger.error('Error loading CourseSidebar component', error);
    throw error;
  })
);

const CourseContent = React.lazy(() => 
  import('@/components/CourseContent').then(module => {
    logger.debug('CourseContent component loaded');
    return { default: module.CourseContent };
  }).catch(error => {
    logger.error('Error loading CourseContent component', error);
    throw error;
  })
);

export function CourseLayout() {
  logger.debug('CourseLayout rendering');
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SidebarProvider>
        <div className="flex w-full">
          <Suspense 
            fallback={
              <div className="w-80 border-r border-border">
                <LoadingSkeleton variant="sidebar" className="h-screen" />
              </div>
            }
          >
            <CourseSidebar />
          </Suspense>
          
          <main className="flex-1 transition-all duration-300">
            <Suspense 
              fallback={
                <div className="p-6">
                  <LoadingSkeleton variant="content" className="w-full h-96" />
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
}
