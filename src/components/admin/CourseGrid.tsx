
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { CourseListItem, CourseEnrollment, CourseCategory } from '@/types/course';
import { CourseCard } from './CourseCard';

interface CourseGridProps {
  courses: CourseListItem[];
  enrollments: CourseEnrollment[];
  categories: CourseCategory[];
  onCourseUpdated: () => void;
  selectedCourses?: string[];
  onCourseSelection?: (courseId: string, selected: boolean) => void;
}

export function CourseGrid({ 
  courses, 
  enrollments, 
  categories, 
  onCourseUpdated,
  selectedCourses = [],
  onCourseSelection
}: CourseGridProps) {
  const getCourseEnrollmentCount = (courseId: string) => {
    return enrollments.filter(e => e.course_id === courseId && e.enrollment_status === 'ativo').length;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {courses.map(course => (
        <div key={course.id} className="relative">
          {onCourseSelection && (
            <div className="absolute top-3 right-3 z-10">
              <div className="bg-white rounded-full p-1 shadow-sm">
                <Checkbox
                  checked={selectedCourses.includes(course.id)}
                  onCheckedChange={(checked) => 
                    onCourseSelection(course.id, checked as boolean)
                  }
                />
              </div>
            </div>
          )}
          <CourseCard 
            course={course}
            enrollmentCount={getCourseEnrollmentCount(course.id)}
            categories={categories}
            onCourseUpdated={onCourseUpdated}
          />
        </div>
      ))}
    </div>
  );
}
