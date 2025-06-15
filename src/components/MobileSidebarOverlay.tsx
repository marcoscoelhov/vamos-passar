
import React from 'react';
import { CourseSidebar } from './CourseSidebar';

interface MobileSidebarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebarOverlay({ isOpen, onClose }: MobileSidebarOverlayProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-out lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full bg-white shadow-2xl">
          <CourseSidebar isMobile={true} onCloseMobile={onClose} />
        </div>
      </div>
    </>
  );
}
