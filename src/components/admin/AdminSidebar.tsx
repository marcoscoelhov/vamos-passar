
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  BarChart3, 
  Users, 
  BookOpen, 
  FileText, 
  Target,
  TreePine,
  PlusCircle,
  Activity
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
      title: 'Resumo do Curso',
      icon: TrendingUp,
      badge: null,
      description: 'Visão geral e métricas'
    },
    {
      id: 'analytics',
      title: 'Dashboard Analítico',
      icon: BarChart3,
      badge: analytics?.activeStudents || 0,
      description: 'Relatórios e insights'
    },
    {
      id: 'students',
      title: 'Gerenciar Alunos',
      icon: Users,
      badge: analytics?.totalStudents || 0,
      description: 'Administrar usuários'
    },
    {
      id: 'topics',
      title: 'Gerenciar Tópicos',
      icon: BookOpen,
      badge: analytics?.totalTopics || 0,
      description: 'Organizar conteúdo'
    },
    {
      id: 'hierarchy',
      title: 'Organizar Hierarquia',
      icon: TreePine,
      badge: null,
      description: 'Estruturar curso'
    },
    {
      id: 'create-topic',
      title: 'Criar Tópicos',
      icon: PlusCircle,
      badge: null,
      description: 'Adicionar conteúdo'
    },
    {
      id: 'questions',
      title: 'Gerenciar Questões',
      icon: Target,
      badge: analytics?.totalQuestions || 0,
      description: 'Criar avaliações'
    },
    {
      id: 'logs',
      title: 'Logs de Auditoria',
      icon: Activity,
      badge: null,
      description: 'Histórico de ações'
    }
  ];

  return (
    <div className="w-80 h-full border-l border-gray-100 bg-gray-50/30">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-2">
          Administração
        </h2>
        <p className="text-sm text-gray-600">
          {course.title}
        </p>
      </div>
      
      <div className="p-4 space-y-2">
        {sidebarSections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full text-left p-4 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-white shadow-sm border border-gray-200' 
                  : 'hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                  <span className={`font-medium ${
                    isActive ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {section.title}
                  </span>
                </div>
                {section.badge !== null && (
                  <Badge variant="outline" className="text-xs bg-gray-50">
                    {section.badge}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 ml-7">
                {section.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
