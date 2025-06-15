
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings, User, Menu, X } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { LoadingSkeleton } from './LoadingSkeleton';
import { logger } from '@/utils/logger';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    profile,
    isAuthenticated,
    logout,
    isLoading
  } = useCourse();

  const handleLogout = async () => {
    try {
      logger.info('User logging out');
      await logout();
    } catch (error) {
      logger.error('Logout error', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isLoading ? (
              <LoadingSkeleton variant="avatar" className="w-32" />
            ) : isAuthenticated ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 font-ui">
                      {profile?.name || 'Usuário'}
                    </p>
                    {profile?.is_admin && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
                
                {profile?.is_admin && (
                  <Link to="/admin">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="btn-medium-ghost font-ui"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                
                <Button 
                  onClick={handleLogout} 
                  variant="ghost" 
                  size="sm" 
                  className="btn-medium-ghost font-ui text-gray-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button className="btn-medium-primary font-ui">
                  Entrar
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-100">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 font-ui">
                      {profile?.name || 'Usuário'}
                    </p>
                    {profile?.is_admin && (
                      <Badge variant="secondary" className="text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
                
                {profile?.is_admin && (
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start font-ui"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Painel Admin
                    </Button>
                  </Link>
                )}
                
                <Button 
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }} 
                  variant="ghost" 
                  className="w-full justify-start font-ui text-gray-600"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sair
                </Button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full btn-medium-primary font-ui">
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
