
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Users, 
  HelpCircle, 
  TrendingUp, 
  Award, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  MessageSquare
} from 'lucide-react';
import { Course } from '@/types/course';

interface UserFriendlyDashboardProps {
  course: Course;
  isAdmin: boolean;
}

export function UserFriendlyDashboard({ course, isAdmin }: UserFriendlyDashboardProps) {
  // Mock data for demonstration
  const dashboardData = {
    totalStudents: 45,
    activeStudents: 38,
    courseProgress: 73,
    questionsAnswered: 234,
    averageScore: 82,
    recentActivity: [
      { student: 'Maria Silva', action: 'completou', topic: 'Introdução', time: '2 min atrás' },
      { student: 'João Santos', action: 'iniciou', topic: 'Fundamentos', time: '15 min atrás' },
      { student: 'Ana Costa', action: 'completou', topic: 'Exercícios', time: '1h atrás' },
    ],
    alerts: [
      { type: 'warning', message: '3 alunos não acessam há mais de 7 dias' },
      { type: 'info', message: 'Novo tópico disponível para revisão' },
    ]
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'info': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Bem-vindo ao Painel do Professor! 👋</h1>
            <p className="text-blue-100">
              Aqui você pode acompanhar o progresso dos seus alunos e gerenciar seu curso de forma simples
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">{course.title}</p>
              <p className="text-xs text-blue-100">{course.topics.length} tópicos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button className="h-20 flex-col gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
          <BookOpen className="w-6 h-6" />
          <span className="text-sm font-medium">Criar Tópico</span>
        </Button>
        <Button className="h-20 flex-col gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
          <HelpCircle className="w-6 h-6" />
          <span className="text-sm font-medium">Adicionar Questão</span>
        </Button>
        <Button className="h-20 flex-col gap-2 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">
          <Users className="w-6 h-6" />
          <span className="text-sm font-medium">Ver Alunos</span>
        </Button>
        <Button className="h-20 flex-col gap-2 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100">
          <TrendingUp className="w-6 h-6" />
          <span className="text-sm font-medium">Relatórios</span>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Alunos Matriculados</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.totalStudents}</p>
              <p className="text-xs text-green-600">
                {dashboardData.activeStudents} ativos esta semana
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Progresso Médio</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.courseProgress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${dashboardData.courseProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <HelpCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Questões Respondidas</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.questionsAnswered}</p>
              <p className="text-xs text-blue-600">
                {dashboardData.averageScore}% de acertos
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tópicos Publicados</p>
              <p className="text-2xl font-bold text-gray-900">{course.topics.length}</p>
              <p className="text-xs text-gray-600">
                {course.topics.reduce((acc, topic) => acc + (topic.questions?.length || 0), 0)} questões
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Atividade Recente</h3>
          </div>
          <div className="space-y-3">
            {dashboardData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">
                    <strong>{activity.student}</strong> {activity.action} o tópico{' '}
                    <strong>{activity.topic}</strong>
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            <Eye className="w-4 h-4 mr-2" />
            Ver Todas as Atividades
          </Button>
        </Card>

        {/* Alerts & Notifications */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Alertas e Notificações</h3>
          </div>
          <div className="space-y-3">
            {dashboardData.alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Quick Tips */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Dica do Dia</h4>
            <p className="text-sm text-blue-700">
              Adicione questões ao longo do conteúdo para manter os alunos engajados. 
              Questões frequentes ajudam na retenção do conhecimento!
            </p>
          </div>
        </Card>
      </div>

      {/* Course Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Visão Geral do Curso</h3>
          <Badge variant="outline" className="text-green-600 border-green-200">
            Curso Ativo
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Estrutura do Curso</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tópicos criados:</span>
                <strong>{course.topics.length}</strong>
              </div>
              <div className="flex justify-between text-sm">
                <span>Questões adicionadas:</span>
                <strong>{course.topics.reduce((acc, topic) => acc + (topic.questions?.length || 0), 0)}</strong>
              </div>
              <div className="flex justify-between text-sm">
                <span>Progresso médio:</span>
                <strong>{dashboardData.courseProgress}%</strong>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Performance dos Alunos</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Taxa de conclusão:</span>
                <strong>73%</strong>
              </div>
              <div className="flex justify-between text-sm">
                <span>Nota média:</span>
                <strong>{dashboardData.averageScore}%</strong>
              </div>
              <div className="flex justify-between text-sm">
                <span>Alunos ativos:</span>
                <strong>{dashboardData.activeStudents}/{dashboardData.totalStudents}</strong>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Próximas Ações</h4>
            <div className="space-y-2 text-sm">
              <p>• Revisar tópicos com baixa performance</p>
              <p>• Adicionar mais questões práticas</p>
              <p>• Verificar alunos inativos</p>
              <p>• Analisar feedback dos alunos</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
