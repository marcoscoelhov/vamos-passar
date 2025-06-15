
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  BarChart3, 
  Users, 
  BookOpen, 
  Target,
  Activity,
  GraduationCap,
  Building2
} from 'lucide-react';
import { Course } from '@/types/course';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AdminSidebarProps {
  course: Course;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AdminSidebar({ course, activeSection, onSectionChange }: AdminSidebarProps) {
  const { analytics } = useAnalytics();

  const sidebarSections = [
    {
      id: 'overview',
      title: 'Dashboard',
      icon: TrendingUp,
      badge: null,
      description: 'Visão geral do sistema',
      color: 'blue'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: BarChart3,
      badge: analytics?.activeStudents || 0,
      description: 'Métricas e relatórios',
      color: 'purple'
    },
    {
      id: 'students',
      title: 'Estudantes',
      icon: Users,
      badge: analytics?.totalStudents || 0,
      description: 'Gestão de usuários',
      color: 'green'
    },
    {
      id: 'content',
      title: 'Conteúdo',
      icon: BookOpen,
      badge: analytics?.totalTopics || 0,
      description: 'Tópicos e materiais',
      color: 'amber'
    },
    {
      id: 'questions',
      title: 'Avaliações',
      icon: Target,
      badge: analytics?.totalQuestions || 0,
      description: 'Questões e testes',
      color: 'red'
    },
    {
      id: 'logs',
      title: 'Auditoria',
      icon: Activity,
      badge: null,
      description: 'Logs do sistema',
      color: 'gray'
    }
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive 
        ? 'bg-blue-50 text-blue-700 border-blue-200' 
        : 'hover:bg-blue-50 hover:text-blue-700',
      purple: isActive 
        ? 'bg-purple-50 text-purple-700 border-purple-200' 
        : 'hover:bg-purple-50 hover:text-purple-700',
      green: isActive 
        ? 'bg-green-50 text-green-700 border-green-200' 
        : 'hover:bg-green-50 hover:text-green-700',
      amber: isActive 
        ? 'bg-amber-50 text-amber-700 border-amber-200' 
        : 'hover:bg-amber-50 hover:text-amber-700',
      red: isActive 
        ? 'bg-red-50 text-red-700 border-red-200' 
        : 'hover:bg-red-50 hover:text-red-700',
      gray: isActive 
        ? 'bg-gray-50 text-gray-700 border-gray-200' 
        : 'hover:bg-gray-50 hover:text-gray-700'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const getIconColorClass = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive ? 'text-blue-600' : 'text-blue-500',
      purple: isActive ? 'text-purple-600' : 'text-purple-500',
      green: isActive ? 'text-green-600' : 'text-green-500',
      amber: isActive ? 'text-amber-600' : 'text-amber-500',
      red: isActive ? 'text-red-600' : 'text-red-500',
      gray: isActive ? 'text-gray-600' : 'text-gray-500'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="w-72 min-h-screen bg-white border-r border-gray-200 shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <Building2 className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Painel Admin
            </h1>
            <p className="text-sm text-slate-600">Centro de Controle</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-600">Curso Ativo</span>
          </div>
          <h3 className="font-semibold text-slate-900 text-sm leading-relaxed">
            {course.title}
          </h3>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Status</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-green-600">Ativo</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <div className="flex-1 py-6">
        <div className="px-4 mb-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Navegação
          </h2>
        </div>
        
        <nav className="space-y-2 px-3">
          {sidebarSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive 
                    ? `${getColorClasses(section.color, true)} border shadow-sm` 
                    : `text-slate-700 ${getColorClasses(section.color, false)}`
                }`}
              >
                <div className={`mr-3 p-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-white shadow-sm' 
                    : 'bg-slate-100 group-hover:bg-white group-hover:shadow-sm'
                }`}>
                  <Icon className={`h-4 w-4 ${getIconColorClass(section.color, isActive)}`} />
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="truncate font-medium">{section.title}</span>
                    {section.badge !== null && (
                      <Badge 
                        variant="secondary" 
                        className={`ml-2 text-xs px-2 py-1 ${
                          isActive 
                            ? 'bg-white shadow-sm border-gray-200 text-slate-600' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {section.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    {section.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-slate-50">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-slate-600">Sistema Online</span>
          </div>
          <p className="text-xs text-slate-500">
            Admin Panel v2.0
          </p>
        </div>
      </div>
    </div>
  );
}
