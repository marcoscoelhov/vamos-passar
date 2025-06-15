
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

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
  if (!isCollapsed || isMobile) {
    return null;
  }

  return (
    <Button
      onClick={onToggleSidebar}
      className="fixed top-20 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
      size="sm"
    >
      <Menu className="w-4 h-4" />
    </Button>
  );
}
