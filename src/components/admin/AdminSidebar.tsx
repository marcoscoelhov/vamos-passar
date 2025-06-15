
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  FileText, 
  GraduationCap, 
  Users, 
  BarChart3, 
  Shield,
  Link2,
  Settings,
  HelpCircle,
  Bell
} from 'lucide-react';
import type { Course } from '@/types/course';

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
      description: 'Dashboard principal'
    },
    {
      id: 'content',
      label: 'Conteúdo',
      icon: FileText,
      description: 'Gerenciar tópicos e materiais'
    },
    {
      id: 'courses',
      label: 'Cursos',
      icon: GraduationCap,
      description: 'Administrar cursos'
    },
    {
      id: 'students',
      label: 'Estudantes',
      icon: Users,
      description: 'Gerenciar alunos'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Relatórios e métricas'
    },
    {
      id: 'integrations',
      label: 'Integrações',
      icon: Link2,
      description: 'APIs e webhooks',
      badge: 'Novo'
    },
    {
      id: 'permissions',
      label: 'Permissões',
      icon: Shield,
      description: 'Controle de acesso'
    }
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 truncate">{course.title}</h2>
            <p className="text-sm text-gray-500">Painel Administrativo</p>
          </div>
        </div>
        
        {/* Course Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-600 font-medium">Tópicos</p>
            <p className="text-lg font-bold text-blue-700">12</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-green-600 font-medium">Alunos</p>
            <p className="text-lg font-bold text-green-700">248</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-auto p-4 transition-all duration-200 ${
                isActive 
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" 
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              }`}
              onClick={() => onSectionChange(item.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                    {item.description}
                  </p>
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button variant="ghost" className="w-full justify-start gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-700">
          <Settings className="w-4 h-4" />
          Configurações
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-700">
          <HelpCircle className="w-4 h-4" />
          Ajuda & Suporte
        </Button>
      </div>
    </div>
  );
}
