
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, BookOpen, HelpCircle, TrendingUp, Award, Clock } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function AnalyticsDashboard() {
  const { analytics, isLoading } = useAnalytics();

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM HH:mm', { locale: ptBR });
  };

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const pieData = analytics.difficultyStats.map((stat, index) => ({
    name: stat.difficulty,
    value: stat.count,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-6">
      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Alunos</p>
              <p className="text-2xl font-bold">{analytics.totalStudents}</p>
              <p className="text-xs text-green-600">{analytics.activeStudents} ativos</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Tópicos</p>
              <p className="text-2xl font-bold">{analytics.totalTopics}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <HelpCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Questões</p>
              <p className="text-2xl font-bold">{analytics.totalQuestions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Progresso Médio</p>
              <p className="text-2xl font-bold">{analytics.averageProgress}%</p>
              <p className="text-xs text-blue-600">{analytics.completionRate}% completos</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de estatísticas de dificuldade */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Taxa de Sucesso por Dificuldade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.difficultyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="difficulty" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}%`, 'Taxa de Sucesso']} />
              <Bar dataKey="successRate" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Gráfico de distribuição de questões */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribuição de Questões</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top performers e atividade recente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top performers */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Melhores Alunos</h3>
          </div>
          <div className="space-y-3">
            {analytics.topPerformers.map((performer, index) => (
              <div key={performer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{performer.name}</p>
                    <p className="text-sm text-gray-600">{performer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{performer.progress}%</p>
                  <Progress value={performer.progress} className="w-20 h-2" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Atividade recente */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Atividade Recente</h3>
          </div>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm">
                    <strong>{activity.user_name}</strong> concluiu o tópico{' '}
                    <strong>{activity.topic_title}</strong>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {formatDate(activity.completed_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
