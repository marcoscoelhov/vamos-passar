
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
  // Don't render the floating button at all to avoid interfering with reading
  return null;
}
