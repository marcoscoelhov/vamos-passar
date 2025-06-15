
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Target, 
  Activity,
  TrendingUp,
  Settings,
  GraduationCap,
  Crown,
  Zap
} from 'lucide-react';
import { Course } from '@/types/course';

interface AdminSidebarProps {
  course: Course;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  {
    id: 'overview',
    label: 'Dashboard',
    icon: TrendingUp,
    description: 'Visão geral do sistema',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'courses',
    label: 'Gerenciar Cursos',
    icon: GraduationCap,
    description: 'Múltiplos cursos e preços',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    badge: 'Novo'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Métricas e relatórios',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    id: 'students',
    label: 'Estudantes',
    icon: Users,
    description: 'Gestão de usuários',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    id: 'content',
    label: 'Conteúdo',
    icon: BookOpen,
    description: 'Tópicos e materiais',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  {
    id: 'questions',
    label: 'Avaliações',
    icon: Target,
    description: 'Questões e testes',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  {
    id: 'logs',
    label: 'Auditoria',
    icon: Activity,
    description: 'Logs do sistema',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
];

export function AdminSidebar({ course, activeSection, onSectionChange }: AdminSidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Painel Admin
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 text-xs">
                <Crown className="w-3 h-3 mr-1" />
                Administrador
              </Badge>
            </div>
          </div>
        </div>

        {/* Course Info */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-slate-600">Sistema Ativo</span>
          </div>
          <h3 className="font-semibold text-slate-900 text-sm mb-1">
            {course?.title || 'Plataforma EAD'}
          </h3>
          <p className="text-xs text-slate-600">
            Ambiente de produção
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
          Gestão Principal
        </div>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onSectionChange(item.id)}
              className={`
                w-full justify-start h-auto p-3 text-left transition-all duration-200
                ${isActive 
                  ? `${item.bgColor} ${item.color} ${item.borderColor} border shadow-sm` 
                  : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                }
              `}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`
                  p-2 rounded-lg transition-colors duration-200
                  ${isActive 
                    ? `${item.bgColor} ${item.color}` 
                    : 'bg-slate-100 text-slate-600'
                  }
                `}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {item.label}
                    </span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs opacity-75 mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Status do Sistema
            </span>
          </div>
          <div className="space-y-1 text-xs text-blue-700">
            <div className="flex justify-between">
              <span>Uptime:</span>
              <span className="font-medium">99.9%</span>
            </div>
            <div className="flex justify-between">
              <span>Usuários Online:</span>
              <span className="font-medium">42</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
