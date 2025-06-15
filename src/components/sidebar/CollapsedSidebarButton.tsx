
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
        fixed top-4 z-50 bg-blue-600 hover:bg-blue-700 text-white shadow-lg
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'left-4' : 'left-[320px]'}
      `}
      size="sm"
    >
      {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
    </Button>
  );
}
