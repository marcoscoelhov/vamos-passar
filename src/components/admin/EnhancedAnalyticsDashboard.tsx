
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, BookOpen, HelpCircle, TrendingUp, Award, Clock, AlertTriangle, CheckCircle, Target, Lightbulb, ArrowUp, ArrowDown } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function EnhancedAnalyticsDashboard() {
  const { analytics, isLoading } = useAnalytics();
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'performance' | 'content'>('engagement');

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM HH:mm', { locale: ptBR });
  };

  // Insights acionáveis baseados nos dados
  const generateInsights = () => {
    if (!analytics) return [];

    const insights = [];

    // Insight sobre engajamento
    if (analytics.activeStudents / analytics.totalStudents < 0.5) {
      insights.push({
        type: 'warning',
        title: 'Baixo Engajamento',
        description: `Apenas ${Math.round((analytics.activeStudents / analytics.totalStudents) * 100)}% dos alunos estão ativos`,
        action: 'Considere enviar lembretes ou criar conteúdo mais interativo',
        icon: AlertTriangle,
        color: 'text-amber-600'
      });
    }

    // Insight sobre progresso
    if (analytics.averageProgress < 30) {
      insights.push({
        type: 'alert',
        title: 'Progresso Lento',
        description: `Progresso médio está em apenas ${analytics.averageProgress}%`,
        action: 'Revise o conteúdo ou ofereça suporte adicional aos alunos',
        icon: Target,
        color: 'text-red-600'
      });
    }

    // Insight sobre questões difíceis
    const hardQuestions = analytics.difficultyStats.find(d => d.difficulty === 'Difícil');
    if (hardQuestions && hardQuestions.successRate < 40) {
      insights.push({
        type: 'info',
        title: 'Questões Muito Difíceis',
        description: `Taxa de acerto em questões difíceis: ${hardQuestions.successRate}%`,
        action: 'Considere revisar as questões ou adicionar mais explicações',
        icon: Lightbulb,
        color: 'text-blue-600'
      });
    }

    // Insight positivo
    if (analytics.completionRate > 70) {
      insights.push({
        type: 'success',
        title: 'Ótima Taxa de Conclusão!',
        description: `${analytics.completionRate}% dos alunos completaram o curso`,
        action: 'Continue com a estratégia atual - está funcionando bem!',
        icon: CheckCircle,
        color: 'text-green-600'
      });
    }

    return insights;
  };

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const insights = generateInsights();

  const pieData = analytics.difficultyStats.map((stat, index) => ({
    name: stat.difficulty,
    value: stat.count,
    color: COLORS[index % COLORS.length]
  }));

  // Dados simulados para demonstração de tendências
  const trendData = [
    { month: 'Jan', students: 45, completion: 65 },
    { month: 'Fev', students: 52, completion: 68 },
    { month: 'Mar', students: 48, completion: 72 },
    { month: 'Abr', students: 61, completion: 75 },
    { month: 'Mai', students: analytics.totalStudents, completion: analytics.completionRate },
  ];

  return (
    <div className="space-y-6">
      {/* Header com insights principais */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Analytics Avançados</h1>
        <p className="text-blue-100">Insights acionáveis para melhorar seu curso</p>
      </div>

      {/* Insights acionáveis */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <Card key={index} className="p-4 border-l-4 border-l-blue-500">
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-1 ${insight.color}`} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{insight.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    <p className="text-xs text-blue-600 mt-2 font-medium">{insight.action}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Tabs value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-6">
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
                  <div className="flex items-center gap-1 text-xs">
                    <ArrowUp className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">+12% este mês</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Alunos Ativos</p>
                  <p className="text-2xl font-bold">{analytics.activeStudents}</p>
                  <p className="text-xs text-gray-500">
                    {Math.round((analytics.activeStudents / analytics.totalStudents) * 100)}% do total
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Taxa de Conclusão</p>
                  <p className="text-2xl font-bold">{analytics.completionRate}%</p>
                  <div className="flex items-center gap-1 text-xs">
                    <ArrowUp className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">+5% vs mês anterior</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Progresso Médio</p>
                  <p className="text-2xl font-bold">{analytics.averageProgress}%</p>
                  <Progress value={analytics.averageProgress} className="h-2 mt-1" />
                </div>
              </div>
            </Card>
          </div>

          {/* Gráfico de tendências */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tendências de Engajamento</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="students" stroke="#8884d8" name="Novos Alunos" />
                <Line type="monotone" dataKey="completion" stroke="#82ca9d" name="Taxa de Conclusão %" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
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
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 Dica:</strong> Considere destacar estes alunos como exemplos ou convidá-los para mentoria.
                </p>
              </div>
            </Card>

            {/* Gráfico de dificuldade */}
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
              
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Atenção:</strong> Questões com menos de 50% de acertos podem precisar de revisão.
                </p>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição de questões */}
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

            {/* Atividade recente */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Atividade Recente</h3>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
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

          {/* Métricas de conteúdo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total de Tópicos</p>
                  <p className="text-2xl font-bold">{analytics.totalTopics}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total de Questões</p>
                  <p className="text-2xl font-bold">{analytics.totalQuestions}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Média Questões/Tópico</p>
                  <p className="text-2xl font-bold">
                    {analytics.totalTopics > 0 ? Math.round(analytics.totalQuestions / analytics.totalTopics) : 0}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
