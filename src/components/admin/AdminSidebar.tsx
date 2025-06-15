import React from 'react';
import { Course } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Users, 
  BarChart3, 
  FileDown, 
  Shield, 
  History,
  Settings,
  HardDrive,
  Layout,
  UserCheck,
  Bell,
  Link
} from 'lucide-react';

interface AdminSidebarProps {
  course: Course;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AdminSidebar({ course, activeSection, onSectionChange }: AdminSidebarProps) {
  const mainSections = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'courses', label: 'Gerenciar Cursos', icon: BookOpen },
    { id: 'content', label: 'Conteúdo', icon: FileText },
    { id: 'students', label: 'Usuários', icon: Users },
  ];

  const analyticsSections = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Relatórios', icon: FileDown },
  ];

  const toolsSections = [
    { id: 'templates', label: 'Templates', icon: Layout },
    { id: 'versioning', label: 'Versionamento', icon: History },
    { id: 'backup', label: 'Backup', icon: HardDrive },
    { id: 'export', label: 'Exportar', icon: FileDown },
  ];

  const collaborationSections = [
    { id: 'collaboration', label: 'Colaboração', icon: UserCheck },
    { id: 'notifications', label: 'Notificações', icon: Bell },
  ];

  const systemSections = [
    { id: 'permissions', label: 'Permissões', icon: Shield },
    { id: 'integrations', label: 'Integrações', icon: Link },
    { id: 'audit', label: 'Auditoria', icon: History },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const renderSection = (sections: any[], title: string) => (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
        {title}
      </h3>
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "secondary" : "ghost"}
            className={`w-full justify-start gap-3 ${
              activeSection === section.id
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => onSectionChange(section.id)}
          >
            <Icon className="w-4 h-4" />
            {section.label}
          </Button>
        );
      })}
    </div>
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 truncate">
              {course.title}
            </h2>
            <p className="text-xs text-gray-500">Painel Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {renderSection(mainSections, 'Principal')}
        <Separator />
        {renderSection(analyticsSections, 'Analytics')}
        <Separator />
        {renderSection(toolsSections, 'Ferramentas')}
        <Separator />
        {renderSection(collaborationSections, 'Colaboração')}
        <Separator />
        {renderSection(systemSections, 'Sistema')}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Sistema Online
        </div>
      </div>
    </div>
  );
}
