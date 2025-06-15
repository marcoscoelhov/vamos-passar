
import React from 'react';
import { CourseListItem, CourseEnrollment } from '@/types/course';
import { CourseCard } from './CourseCard';

interface CourseGridProps {
  courses: CourseListItem[];
  enrollments: CourseEnrollment[];
}

export function CourseGrid({ courses, enrollments }: CourseGridProps) {
  const getCourseEnrollmentCount = (courseId: string) => {
    return enrollments.filter(e => e.course_id === courseId && e.enrollment_status === 'ativo').length;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {courses.map(course => (
        <CourseCard 
          key={course.id} 
          course={course}
          enrollmentCount={getCourseEnrollmentCount(course.id)}
        />
      ))}
    </div>
  );
}
