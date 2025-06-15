
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  BarChart3, 
  Users, 
  BookOpen, 
  Target,
  Activity,
  Crown,
  Zap,
  GraduationCap,
  Home
} from 'lucide-react';

interface AdminHeaderProps {
  activeSection: string;
  courseName: string;
}

const sectionInfo = {
  overview: {
    title: 'Dashboard',
    subtitle: 'Visão geral completa do sistema',
    icon: TrendingUp,
    color: 'blue',
    description: 'Monitore métricas principais e obtenha insights sobre o desempenho geral do curso'
  },
  courses: {
    title: 'Gerenciamento de Cursos',
    subtitle: 'Múltiplos cursos e precificação',
    icon: GraduationCap,
    color: 'emerald',
    description: 'Gerencie todos os seus cursos, preços, categorias e vendas em uma interface profissional'
  },
  analytics: {
    title: 'Analytics',
    subtitle: 'Métricas detalhadas e relatórios',
    icon: BarChart3,
    color: 'purple',
    description: 'Analise dados de engajamento, progresso dos estudantes e performance do conteúdo'
  },
  students: {
    title: 'Gestão de Estudantes',
    subtitle: 'Administração de usuários',
    icon: Users,
    color: 'green',
    description: 'Gerencie contas de estudantes, permissões e acompanhe o progresso individual'
  },
  content: {
    title: 'Gestão de Conteúdo',
    subtitle: 'Tópicos e materiais do curso',
    icon: BookOpen,
    color: 'amber',
    description: 'Crie, edite e organize todo o conteúdo educacional do seu curso'
  },
  questions: {
    title: 'Sistema de Avaliações',
    subtitle: 'Questões e testes',
    icon: Target,
    color: 'red',
    description: 'Desenvolva e gerencie questões para avaliar o aprendizado dos estudantes'
  },
  logs: {
    title: 'Auditoria do Sistema',
    subtitle: 'Logs e monitoramento',
    icon: Activity,
    color: 'gray',
    description: 'Monitore atividades do sistema e mantenha a segurança da plataforma'
  }
};

export function AdminHeader({ activeSection, courseName }: AdminHeaderProps) {
  const section = sectionInfo[activeSection as keyof typeof sectionInfo] || sectionInfo.overview;
  const Icon = section.icon;

  const getGradientClass = (color: string) => {
    const gradients = {
      blue: 'from-blue-500 to-blue-600',
      emerald: 'from-emerald-500 to-emerald-600',
      purple: 'from-purple-500 to-purple-600',
      green: 'from-green-500 to-green-600',
      amber: 'from-amber-500 to-amber-600',
      red: 'from-red-500 to-red-600',
      gray: 'from-gray-500 to-gray-600'
    };
    return gradients[color as keyof typeof gradients] || gradients.blue;
  };

  const getBgPattern = (color: string) => {
    const patterns = {
      blue: 'from-blue-50 via-white to-indigo-50',
      emerald: 'from-emerald-50 via-white to-green-50',
      purple: 'from-purple-50 via-white to-violet-50',
      green: 'from-green-50 via-white to-emerald-50',
      amber: 'from-amber-50 via-white to-yellow-50',
      red: 'from-red-50 via-white to-rose-50',
      gray: 'from-gray-50 via-white to-slate-50'
    };
    return patterns[color as keyof typeof patterns] || patterns.blue;
  };

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${getBgPattern(section.color)} border-0 shadow-sm`}>
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
        <div className={`w-full h-full bg-gradient-to-br ${getGradientClass(section.color)} rounded-full -translate-y-32 translate-x-32`}></div>
      </div>
      <div className="absolute bottom-0 left-0 w-48 h-48 opacity-5">
        <div className={`w-full h-full bg-gradient-to-tr ${getGradientClass(section.color)} rounded-full translate-y-24 -translate-x-24`}></div>
      </div>
      
      <div className="relative p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 bg-gradient-to-br ${getGradientClass(section.color)} rounded-2xl shadow-lg`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">
                  {section.title}
                </h1>
                <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-sm">
                  <Crown className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
                {activeSection === 'courses' && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm">
                    Novo
                  </Badge>
                )}
              </div>
              <p className="text-lg text-slate-600 font-medium mb-1">
                {section.subtitle}
              </p>
              <p className="text-slate-500 max-w-2xl leading-relaxed">
                {section.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Botão Home */}
            <Link to="/">
              <Button 
                variant="outline" 
                className="bg-white border-slate-200 hover:bg-slate-50 shadow-sm"
              >
                <Home className="w-4 h-4 mr-2" />
                Voltar ao Curso
              </Button>
            </Link>
            
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-slate-600">Sistema Ativo</span>
              </div>
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Plataforma</p>
                <p className="font-semibold text-slate-900 text-sm">
                  {courseName}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Stats Bar */}
        <div className="flex items-center gap-6 pt-4 border-t border-slate-200/50">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-slate-200/50">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700">Online</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-slate-200/50">
            <BarChart3 className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Tempo Real</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-slate-200/50">
            <Target className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Produção</span>
          </div>
          {activeSection === 'courses' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-emerald-50 backdrop-blur-sm rounded-full shadow-sm border border-emerald-200">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Mercado BR</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
