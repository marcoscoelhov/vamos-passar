
import React from 'react';
import { Course } from '@/types/course';
import { SimplifiedContentManagement } from './SimplifiedContentManagement';
import { AccessDeniedCard } from './AccessDeniedCard';

interface ContentManagementProps {
  course: Course;
  isAdmin: boolean;
  onContentAdded: () => void;
}

export function ContentManagement({ course, isAdmin, onContentAdded }: ContentManagementProps) {
  if (!isAdmin) {
    return <AccessDeniedCard />;
  }

  return (
    <SimplifiedContentManagement 
      course={course} 
      isAdmin={isAdmin} 
      onContentAdded={onContentAdded} 
    />
  );
}
