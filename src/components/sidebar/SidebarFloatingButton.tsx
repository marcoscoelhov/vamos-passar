
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface SidebarFloatingButtonProps {
  onToggleSidebar: () => void;
}

export const SidebarFloatingButton = React.memo(function SidebarFloatingButton({
  onToggleSidebar
}: SidebarFloatingButtonProps) {
  return (
    <Button
      onClick={onToggleSidebar}
      className="fixed top-20 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
      size="sm"
    >
      <Menu className="w-4 w-4" />
    </Button>
  );
});
