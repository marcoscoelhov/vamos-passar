
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Nenhum curso selecionado
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Selecione um curso para acessar o painel administrativo e começar a gerenciar seu conteúdo educacional.
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = profile?.is_admin || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex">
      {/* Administrative Sidebar - Left */}
      <AdminSidebar 
        course={currentCourse}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      {/* Main Content Area - Right */}
      <AdminContentArea 
        key={refreshKey}
        activeSection={activeSection}
        course={currentCourse}
        isAdmin={isAdmin}
        onContentAdded={handleContentAdded}
      />
    </div>
  );
}
