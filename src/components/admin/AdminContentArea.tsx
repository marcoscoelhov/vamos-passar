
import React from 'react';
import { Course } from '@/types/course';
import { AdminOverview } from './AdminOverview';
import { TopicManagement } from './TopicManagement';
import { ContentManagement } from './ContentManagement';
import { StudentsManagement } from './StudentsManagement';
import { CoursesManagement } from './CoursesManagement';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ProfessorPermissionsManager } from './ProfessorPermissionsManager';
import { AuditLogs } from './AuditLogs';
import { CourseReportsSection } from './CourseReportsSection';
import { ExportToolsSection } from './ExportToolsSection';

interface AdminContentAreaProps {
  activeSection: string;
  course: Course;
  isAdmin: boolean;
  onContentAdded: () => void;
}

export function AdminContentArea({ 
  activeSection, 
  course, 
  isAdmin, 
  onContentAdded 
}: AdminContentAreaProps) {
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminOverview course={course} isAdmin={isAdmin} />;
      case 'courses':
        return <CoursesManagement />;
      case 'topics':
        return (
          <TopicManagement 
            course={course} 
            isAdmin={isAdmin}
            onContentAdded={onContentAdded}
          />
        );
      case 'content':
        return (
          <ContentManagement 
            course={course} 
            isAdmin={isAdmin}
            onContentAdded={onContentAdded}
          />
        );
      case 'students':
        return <StudentsManagement course={course} isAdmin={isAdmin} />;
      case 'analytics':
        return <AnalyticsDashboard course={course} isAdmin={isAdmin} />;
      case 'reports':
        return <CourseReportsSection course={course} isAdmin={isAdmin} />;
      case 'export':
        return <ExportToolsSection course={course} isAdmin={isAdmin} />;
      case 'permissions':
        return <ProfessorPermissionsManager course={course} isAdmin={isAdmin} />;
      case 'audit':
        return <AuditLogs course={course} isAdmin={isAdmin} />;
      default:
        return <AdminOverview course={course} isAdmin={isAdmin} />;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {renderContent()}
      </div>
    </div>
  );
}
