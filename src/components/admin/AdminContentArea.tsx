
import React from 'react';
import { Course } from '@/types/course';
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
    <div className="flex-1 bg-white">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-6xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
