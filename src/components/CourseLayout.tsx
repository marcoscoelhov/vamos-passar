
import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CourseSidebar } from '@/components/CourseSidebar';
import { CourseContent } from '@/components/CourseContent';
import { Header } from '@/components/Header';

export function CourseLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
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
