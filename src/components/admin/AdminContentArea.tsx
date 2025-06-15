
import React from 'react';
import { Course } from '@/types/course';
import { AdminHeader } from './AdminHeader';
import { AdminOverview } from './AdminOverview';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { StudentsManagement } from './StudentsManagement';
import { QuestionForm } from './QuestionForm';
import { AuditLogs } from './AuditLogs';
import { ContentManagement } from './ContentManagement';

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
        return <AdminOverview course={course} />;
      
      case 'analytics':
        return <AnalyticsDashboard />;
      
      case 'students':
        return <StudentsManagement />;
      
      case 'content':
        return (
          <ContentManagement 
            course={course} 
            isAdmin={isAdmin}
            onContentAdded={onContentAdded}
          />
        );
      
      case 'questions':
        return (
          <QuestionForm 
            topics={course.topics}
            isAdmin={isAdmin}
            onQuestionAdded={onContentAdded}
          />
        );
      
      case 'logs':
        return <AuditLogs />;
      
      default:
        return <AdminOverview course={course} />;
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <AdminHeader 
          activeSection={activeSection}
          courseName={course.title}
        />
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
