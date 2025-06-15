
import React from 'react';
import { CourseSidebar } from './CourseSidebar';

interface MobileSidebarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebarOverlay({ isOpen, onClose }: MobileSidebarOverlayProps) {
  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 lg:hidden
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-full bg-white shadow-xl border-r border-gray-100">
        <CourseSidebar isMobile={true} onCloseMobile={onClose} />
      </div>
    </div>
  );
}
