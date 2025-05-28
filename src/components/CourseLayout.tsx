
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Header } from '@/components/Header';
import { CourseSidebar } from '@/components/CourseSidebar';
import { CourseContent } from '@/components/CourseContent';
import { logger } from '@/utils/logger';

export function CourseLayout() {
  logger.debug('CourseLayout rendering');
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SidebarProvider>
        <div className="flex w-full">
          <CourseSidebar />
          <main className="flex-1 transition-all duration-300">
            <CourseContent />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
