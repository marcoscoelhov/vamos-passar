
import React from 'react';
import { Course } from '@/types/course';
import { UserFriendlyDashboard } from './UserFriendlyDashboard';

interface AdminOverviewProps {
  course: Course;
  isAdmin: boolean;
}

export function AdminOverview({ course, isAdmin }: AdminOverviewProps) {
  return <UserFriendlyDashboard course={course} isAdmin={isAdmin} />;
}
