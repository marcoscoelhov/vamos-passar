
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings, User } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const {
    profile,
    isAuthenticated,
    logout,
    isLoading
  } = useCourse();

  if (isLoading) {
    return <header className="bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Logo />
            <h1 className="text-xl font-bold text-foreground">VamosPassar</h1>
          </div>
          <div className="animate-pulse bg-muted h-8 w-20 rounded"></div>
        </div>
      </header>;
  }

  return <header className="bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Logo />
          <h1 className="text-xl font-bold text-foreground"></h1>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {isAuthenticated ? <>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{profile?.name || 'Usuário'}</span>
                {profile?.is_admin && <Badge variant="secondary" className="text-xs">Admin</Badge>}
              </div>
              
              {profile?.is_admin && <Link to="/admin">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Admin
                  </Button>
                </Link>}
              
              <Button onClick={logout} variant="ghost" size="sm" className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </> : <Link to="/login">
              <Button variant="default" size="sm">
                Entrar
              </Button>
            </Link>}
        </div>
      </div>
    </header>;
}
