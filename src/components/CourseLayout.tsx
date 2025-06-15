
import React, { useState } from 'react';
import { CourseSidebar } from '@/components/CourseSidebar';
import { CourseContent } from '@/components/CourseContent';
import { Header } from '@/components/Header';
import { MobileSidebarOverlay } from '@/components/MobileSidebarOverlay';

export function CourseLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="flex w-full relative">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <CourseSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        <MobileSidebarOverlay 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <CourseContent 
            onOpenSidebar={() => setIsSidebarOpen(true)}
            isSidebarOpen={isSidebarOpen}
          />
        </main>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="sidebar-overlay lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
