
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Users, 
  BarChart3, 
  Settings,
  GraduationCap,
  FileSpreadsheet,
  Download,
  Shield,
  FileCheck
} from 'lucide-react';
import { Course } from '@/types/course';

interface AdminSidebarProps {
  course: Course;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AdminSidebar({ course, activeSection, onSectionChange }: AdminSidebarProps) {
  const menuItems = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: LayoutDashboard,
      category: 'main'
    },
    {
      id: 'courses',
      label: 'Gerenciar Cursos',
      icon: GraduationCap,
      category: 'main'
    },
    {
      id: 'topics',
      label: 'Tópicos',
      icon: BookOpen,
      badge: course.topics.length.toString(),
      category: 'content'
    },
    {
      id: 'content',
      label: 'Conteúdo',
      icon: FileText,
      category: 'content'
    },
    {
      id: 'students',
      label: 'Estudantes',
      icon: Users,
      category: 'users'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      category: 'analytics'
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: FileSpreadsheet,
      category: 'analytics'
    },
    {
      id: 'export',
      label: 'Exportar Dados',
      icon: Download,
      category: 'analytics'
    },
    {
      id: 'permissions',
      label: 'Permissões',
      icon: Shield,
      category: 'admin'
    },
    {
      id: 'audit',
      label: 'Logs de Auditoria',
      icon: FileCheck,
      category: 'admin'
    }
  ];

  const categories = {
    main: 'Principal',
    content: 'Conteúdo',
    users: 'Usuários',
    analytics: 'Análises',
    admin: 'Administração'
  };

  const groupedItems = Object.entries(categories).map(([key, label]) => ({
    category: key,
    label,
    items: menuItems.filter(item => item.category === key)
  }));

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900 text-lg">Painel Admin</h2>
            <p className="text-sm text-gray-600 truncate">{course.title}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-6">
          {groupedItems.map(({ category, label, items }) => (
            <div key={category} className="px-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {label}
              </h3>
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? 'default' : 'ghost'}
                      className={`
                        w-full justify-start gap-3 h-10 px-3
                        ${isActive 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                      onClick={() => onSectionChange(item.id)}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge 
                          variant={isActive ? 'secondary' : 'outline'}
                          className={`text-xs ${isActive ? 'bg-white/20 text-white border-white/30' : ''}`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Sistema de Gestão Educacional
        </div>
      </div>
    </div>
  );
}
