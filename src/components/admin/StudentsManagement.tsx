
import React from 'react';
import { Course } from '@/types/course';
import { ImprovedStudentsManagement } from './ImprovedStudentsManagement';

interface StudentsManagementProps {
  course: Course;
  isAdmin: boolean;
}

export function StudentsManagement({ course, isAdmin }: StudentsManagementProps) {
  return <ImprovedStudentsManagement course={course} isAdmin={isAdmin} />;
}
