
import React, { useState } from 'react';
import { useCourse } from '@/contexts/CourseContext';
import { AdminSidebar } from './admin/AdminSidebar';
import { AdminContentArea } from './admin/AdminContentArea';

export function AdminPanel() {
  const { currentCourse, profile } = useCourse();
  const [activeSection, setActiveSection] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleContentAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!currentCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-serif font-semibold text-gray-900 mb-2">
            Nenhum curso selecionado
          </h2>
          <p className="text-gray-600">
            Selecione um curso para acessar o painel administrativo
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = profile?.is_admin || false;

  return (
    <div className="min-h-screen bg-white flex">
      {/* Main Content Area */}
      <AdminContentArea 
        key={refreshKey}
        activeSection={activeSection}
        course={currentCourse}
        isAdmin={isAdmin}
        onContentAdded={handleContentAdded}
      />
      
      {/* Administrative Sidebar */}
      <AdminSidebar 
        course={currentCourse}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
    </div>
  );
}
