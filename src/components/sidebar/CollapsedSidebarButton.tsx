
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface CollapsedSidebarButtonProps {
  isCollapsed: boolean;
  isMobile: boolean;
  onToggleSidebar: () => void;
}

export function CollapsedSidebarButton({ 
  isCollapsed, 
  isMobile, 
  onToggleSidebar 
}: CollapsedSidebarButtonProps) {
  if (isMobile) {
    return null;
  }

  return (
    <Button
      onClick={onToggleSidebar}
      className={`
        fixed top-1/2 -translate-y-1/2 z-50 bg-gradient-to-r from-blue-600 to-blue-700 
        hover:from-blue-700 hover:to-blue-800 text-white shadow-xl border-0
        transition-all duration-300 ease-in-out transform hover:scale-105
        ${isCollapsed ? 'left-4' : 'left-[320px]'}
        h-12 w-12 rounded-full flex items-center justify-center
        before:absolute before:inset-0 before:rounded-full before:bg-white/20 
        before:scale-0 hover:before:scale-100 before:transition-transform before:duration-200
      `}
      size="sm"
    >
      {isCollapsed ? (
        <Menu className="w-5 h-5 relative z-10" />
      ) : (
        <X className="w-5 h-5 relative z-10" />
      )}
    </Button>
  );
}
