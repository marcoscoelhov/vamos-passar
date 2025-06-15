
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, Menu } from 'lucide-react';
import { Course } from '@/types/course';

interface SidebarHeaderProps {
  currentCourse: Course;
  isMobile: boolean;
  onCloseMobile?: () => void;
  onToggleSidebar?: () => void;
}

export function SidebarHeader({ 
  currentCourse, 
  isMobile, 
  onCloseMobile, 
  onToggleSidebar 
}: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold text-gray-900 truncate">
          {currentCourse.title}
        </h1>
        <p className="text-sm text-gray-600 truncate">
          {currentCourse.topics.length} tópicos disponíveis
        </p>
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        {!isMobile && onToggleSidebar && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
        
        {isMobile && onCloseMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCloseMobile}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
