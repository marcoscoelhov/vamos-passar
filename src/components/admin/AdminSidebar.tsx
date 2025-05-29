
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  BarChart3, 
  Users, 
  BookOpen, 
  Target,
  TreePine,
  PlusCircle,
  Activity,
  GraduationCap
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
      title: 'Visão Geral',
      icon: TrendingUp,
      badge: null,
      description: 'Dashboard principal'
    },
    {
      id: 'analytics',
      title: 'Análises',
      icon: BarChart3,
      badge: analytics?.activeStudents || 0,
      description: 'Relatórios e métricas'
    },
    {
      id: 'students',
      title: 'Estudantes',
      icon: Users,
      badge: analytics?.totalStudents || 0,
      description: 'Gerenciar usuários'
    },
    {
      id: 'topics',
      title: 'Tópicos',
      icon: BookOpen,
      badge: analytics?.totalTopics || 0,
      description: 'Gerenciar conteúdo'
    },
    {
      id: 'hierarchy',
      title: 'Hierarquia',
      icon: TreePine,
      badge: null,
      description: 'Organizar estrutura'
    },
    {
      id: 'create-topic',
      title: 'Criar Tópico',
      icon: PlusCircle,
      badge: null,
      description: 'Adicionar conteúdo'
    },
    {
      id: 'questions',
      title: 'Questões',
      icon: Target,
      badge: analytics?.totalQuestions || 0,
      description: 'Gerenciar avaliações'
    },
    {
      id: 'logs',
      title: 'Logs',
      icon: Activity,
      badge: null,
      description: 'Auditoria do sistema'
    }
  ];

  return (
    <div className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-6 h-6 text-blue-600" />
          <h1 className="text-lg font-serif font-semibold text-gray-900">
            Administração
          </h1>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-900 mb-1">
            Curso Ativo
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            {course.title}
          </p>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {sidebarSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`w-full group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{section.title}</span>
                    {section.badge !== null && (
                      <Badge 
                        variant={isActive ? "default" : "outline"} 
                        className={`ml-2 text-xs ${
                          isActive 
                            ? 'bg-blue-100 text-blue-700 border-blue-200' 
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {section.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {section.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Painel Administrativo
          </p>
          <p className="text-xs text-gray-400 mt-1">
            v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
