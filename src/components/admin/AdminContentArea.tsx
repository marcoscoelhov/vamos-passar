
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
import { IntegratedHelpSystem } from './IntegratedHelpSystem';
import { ContentVersioning } from './ContentVersioning';
import { BackupSystem } from './BackupSystem';
import { CourseTemplateSystem } from './CourseTemplateSystem';

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
        return <AnalyticsDashboard />;
      case 'reports':
        return <CourseReportsSection course={course} isAdmin={isAdmin} />;
      case 'export':
        return <ExportToolsSection />;
      case 'permissions':
        return <ProfessorPermissionsManager course={course} isAdmin={isAdmin} />;
      case 'audit':
        return <AuditLogs />;
      case 'versioning':
        return (
          <ContentVersioning 
            topicId={course.topics[0]?.id || ''} 
            currentContent={course.topics[0]?.content || ''}
            onRestoreVersion={(version) => console.log('Restoring version:', version)}
          />
        );
      case 'backup':
        return <BackupSystem />;
      case 'templates':
        return <CourseTemplateSystem />;
      default:
        return <AdminOverview course={course} isAdmin={isAdmin} />;
    }
  };

  return (
    <div className="flex-1 overflow-auto relative">
      <div className="p-8">
        {renderContent()}
      </div>
      
      {/* Sistema de ajuda integrado */}
      <IntegratedHelpSystem />
    </div>
  );
}
