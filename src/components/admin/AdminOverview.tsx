
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Target, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  BarChart3,
  Award,
  Zap,
  Activity
} from 'lucide-react';
import { Course } from '@/types/course';
import { StatCard } from './StatCard';
import { ActivityMonitor } from './ActivityMonitor';

interface AdminOverviewProps {
  course: Course;
  isAdmin?: boolean;
}

export function AdminOverview({ course, isAdmin }: AdminOverviewProps) {
  const totalQuestions = course.topics.reduce((acc, topic) => acc + (topic.questions?.length || 0), 0);
  const completedTopics = course.topics.filter(topic => topic.completed).length;
  const pendingTopics = course.topics.length - completedTopics;
  const completionRate = course.topics.length > 0 ? Math.round((completedTopics / course.topics.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Tópicos"
          value={course.topics.length}
          description="Conteúdo disponível"
          icon={BookOpen}
          color="blue"
          trend={{ value: "+12%", direction: "up" }}
        />
        
        <StatCard
          title="Questões Criadas"
          value={totalQuestions}
          description="Avaliações ativas"
          icon={Target}
          color="purple"
          trend={{ value: "+8%", direction: "up" }}
        />
        
        <StatCard
          title="Taxa de Conclusão"
          value={`${completionRate}%`}
          description="Progresso geral"
          icon={TrendingUp}
          color="green"
          trend={{ value: "+15%", direction: "up" }}
        />
        
        <StatCard
          title="Engajamento"
          value="94%"
          description="Usuários ativos"
          icon={Activity}
          color="amber"
          trend={{ value: "+3%", direction: "up" }}
          badge="Excelente"
        />
      </div>

      {/* Layout com Resumo do Curso e Monitor de Atividade */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Resumo do Curso */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              Informações do Curso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{course.title}</h3>
              <p className="text-slate-600 leading-relaxed">{course.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-xl mb-3">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-1">{course.topics.length}</p>
                <p className="text-sm font-medium text-blue-700">Tópicos Criados</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500 rounded-xl mb-3">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-purple-600 mb-1">{totalQuestions}</p>
                <p className="text-sm font-medium text-purple-700">Questões Ativas</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">Progresso Geral</span>
                <span className="text-sm font-bold text-slate-900">{Math.round(course.progress)}%</span>
              </div>
              <Progress value={course.progress} className="h-3 bg-slate-100" />
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Rápidas */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>
              Status Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-900">Concluídos</span>
                </div>
                <Badge className="bg-emerald-500 text-white shadow-sm">
                  {completedTopics}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-amber-900">Pendentes</span>
                </div>
                <Badge className="bg-amber-500 text-white shadow-sm">
                  {pendingTopics}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Taxa</span>
                </div>
                <Badge className="bg-blue-500 text-white shadow-sm">
                  {completionRate}%
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="text-center p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
                <div className="inline-flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-slate-700">Sistema</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-slate-600">Funcionando perfeitamente</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monitor de Atividade */}
        <div className="lg:col-span-1">
          <ActivityMonitor />
        </div>
      </div>

      {/* Lista Detalhada de Tópicos */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-semibold flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Target className="w-5 h-5 text-slate-600" />
            </div>
            Estrutura do Curso
            <Badge className="bg-slate-100 text-slate-700 ml-auto">
              {course.topics.length} tópicos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {course.topics.slice(0, 5).map((topic, index) => (
              <div key={topic.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-200">
                    <span className="text-sm font-bold text-slate-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">{topic.title}</h4>
                    {topic.questions && topic.questions.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-500">
                          {topic.questions.length} questão(ões)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {topic.questions && topic.questions.length > 0 && (
                    <Badge variant="secondary" className="border-blue-200 text-blue-700 bg-blue-50">
                      {topic.questions.length} Q
                    </Badge>
                  )}
                  <div className="flex items-center gap-2">
                    {topic.completed ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <Badge className="bg-emerald-500 text-white shadow-sm">
                          Completo
                        </Badge>
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 text-amber-500" />
                        <Badge className="bg-amber-500 text-white shadow-sm">
                          Pendente
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {course.topics.length > 5 && (
              <div className="text-center pt-4">
                <Badge variant="outline" className="text-slate-600">
                  +{course.topics.length - 5} tópicos adicionais
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
