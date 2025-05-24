
import React from 'react';
import { Button } from '@/components/ui/button';
import { useCourse } from '@/contexts/CourseContext';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user, logout, currentCourse } = useCourse();
  const navigate = useNavigate();

  const handleAdminAccess = () => {
    navigate('/admin');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900">EduPlatform</h1>
          {currentCourse && (
            <div className="text-sm text-gray-600">
              {currentCourse.title}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <span className="text-sm text-gray-600">
                Olá, {user.name}
              </span>
              {user.isAdmin && (
                <Button
                  onClick={handleAdminAccess}
                  variant="outline"
                  size="sm"
                >
                  Admin
                </Button>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
              >
                Sair
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
