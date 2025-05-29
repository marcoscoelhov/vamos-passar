
import React from 'react';
import { Course } from '@/types/course';
import { AdminOverview } from './AdminOverview';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { StudentsManagement } from './StudentsManagement';
import { TopicForm } from './TopicForm';
import { TopicHierarchyManager } from './TopicHierarchyManager';
import { QuestionForm } from './QuestionForm';
import { AuditLogs } from './AuditLogs';
import { TopicManagement } from './TopicManagement';

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
      
      case 'topics':
        return (
          <TopicManagement 
            course={course} 
            isAdmin={isAdmin}
            onContentAdded={onContentAdded}
          />
        );
      
      case 'hierarchy':
        return (
          <TopicHierarchyManager 
            course={course} 
            isAdmin={isAdmin}
            onTopicUpdated={onContentAdded}
          />
        );
      
      case 'create-topic':
        return (
          <TopicForm 
            course={course} 
            isAdmin={isAdmin}
            onTopicAdded={onContentAdded}
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
      {/* Content Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-6xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
