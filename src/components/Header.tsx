
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings, User } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { LoadingSkeleton } from './LoadingSkeleton';
import { logger } from '@/utils/logger';

export function Header() {
  const {
    profile,
    isAuthenticated,
    logout,
    isLoading
  } = useCourse();

  const handleLogout = async () => {
    try {
      logger.info('User initiating logout');
      await logout();
      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Logout error', error);
    }
  };

  return (
    <header className="bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Logo />
        </div>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <LoadingSkeleton variant="avatar" className="w-32" />
          ) : isAuthenticated ? (
            <>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium">
                  {profile?.name || 'Usuário'}
                </span>
                {profile?.is_admin && (
                  <Badge variant="secondary" className="text-xs">
                    Admin
                  </Badge>
                )}
              </div>
              
              {profile?.is_admin && (
                <Link to="/admin">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2 hover:bg-accent"
                  >
                    <Settings className="w-4 h-4" />
                    Admin
                  </Button>
                </Link>
              )}
              
              <Button 
                onClick={handleLogout} 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 hover:bg-accent hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="default" size="sm">
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
