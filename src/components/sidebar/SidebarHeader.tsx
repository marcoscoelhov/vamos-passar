
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Menu, X } from 'lucide-react';
import { Course } from '@/types/course';

interface SidebarHeaderProps {
  currentCourse: Course;
  isMobile: boolean;
  onCloseMobile?: () => void;
  onToggleSidebar: () => void;
}

export function SidebarHeader({ 
  currentCourse, 
  isMobile, 
  onCloseMobile, 
  onToggleSidebar 
}: SidebarHeaderProps) {
  return (
    <div className="p-4 border-b border-gray-200 flex-shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 truncate">
          {currentCourse.title}
        </h2>
        {isMobile ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCloseMobile}
            className="h-8 w-8 p-0 hover:bg-gray-100 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="h-8 w-8 p-0 hover:bg-gray-100 flex-shrink-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progresso</span>
          <span>{Math.round(currentCourse.progress)}%</span>
        </div>
        <Progress value={currentCourse.progress} className="h-2" />
      </div>
    </div>
  );
}
