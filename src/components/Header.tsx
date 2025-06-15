
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings, User, Menu, X, Crown } from 'lucide-react';
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
    <header className="bg-gradient-to-r from-white via-slate-50 to-white border-b border-gray-100/50 sticky top-0 z-40 backdrop-blur-sm">
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
                <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-inner">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900 font-ui">
                      {profile?.name || 'Usuário'}
                    </p>
                    {profile?.is_admin && (
                      <div className="flex items-center gap-1 mt-1">
                        <Crown className="w-3 h-3 text-amber-500" />
                        <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 text-xs px-2 py-0.5 shadow-sm">
                          Administrador
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                
                {profile?.is_admin && (
                  <Link to="/admin">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="btn-medium-ghost font-ui bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-200 shadow-sm"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Painel Admin
                    </Button>
                  </Link>
                )}
                
                <Button 
                  onClick={handleLogout} 
                  variant="ghost" 
                  size="sm" 
                  className="btn-medium-ghost font-ui text-gray-600 hover:text-gray-800 hover:bg-gray-100/80 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button className="btn-medium-primary font-ui bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md transition-all duration-200">
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
              className="p-2 hover:bg-gray-100/80 transition-colors duration-200"
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
          <div className="md:hidden mt-4 pt-4 border-t border-gray-100 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-inner">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 font-ui">
                      {profile?.name || 'Usuário'}
                    </p>
                    {profile?.is_admin && (
                      <div className="flex items-center gap-1 mt-1">
                        <Crown className="w-3 h-3 text-amber-500" />
                        <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 text-xs">
                          Admin
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                
                {profile?.is_admin && (
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start font-ui hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
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
                  className="w-full justify-start font-ui text-gray-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sair
                </Button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full btn-medium-primary font-ui bg-gradient-to-r from-blue-600 to-blue-700">
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
