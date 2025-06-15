
import React from 'react';
import { Course } from '@/types/course';
import { ImprovedStudentsManagement as StudentsManagementComponent } from './students/ImprovedStudentsManagement';

interface ImprovedStudentsManagementProps {
  course: Course;
  isAdmin: boolean;
}

export function ImprovedStudentsManagement({ course, isAdmin }: ImprovedStudentsManagementProps) {
  return <StudentsManagementComponent course={course} isAdmin={isAdmin} />;
}
