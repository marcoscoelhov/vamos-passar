
import React from 'react';
import { SimplifiedContentManagement } from './SimplifiedContentManagement';
import { AdminOverview } from './AdminOverview';
import { CoursesManagement } from './CoursesManagement';
import { ImprovedStudentsManagement } from './ImprovedStudentsManagement';
import { EnhancedAnalyticsDashboard } from './EnhancedAnalyticsDashboard';
import { ProfessorPermissionsManager } from './ProfessorPermissionsManager';
import { UserFriendlyDashboard } from './UserFriendlyDashboard';
import { IntegrationsHub } from '../integrations/IntegrationsHub';
import type { Course } from '@/types/course';

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
      case 'content':
        return (
          <SimplifiedContentManagement 
            course={course} 
            isAdmin={isAdmin}
            onContentAdded={onContentAdded} 
          />
        );
      case 'courses':
        return <CoursesManagement />;
      case 'students':
        return <ImprovedStudentsManagement course={course} isAdmin={isAdmin} />;
      case 'analytics':
        return <EnhancedAnalyticsDashboard />;
      case 'permissions':
        return isAdmin ? <ProfessorPermissionsManager course={course} isAdmin={isAdmin} /> : <UserFriendlyDashboard course={course} isAdmin={isAdmin} />;
      case 'integrations':
        return <IntegrationsHub />;
      default:
        return <AdminOverview course={course} isAdmin={isAdmin} />;
    }
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-auto">
      {renderContent()}
    </div>
  );
}
