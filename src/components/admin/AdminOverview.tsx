
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Target, Users, TrendingUp, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { Course } from '@/types/course';

interface AdminOverviewProps {
  course: Course;
}

export function AdminOverview({ course }: AdminOverviewProps) {
  const totalQuestions = course.topics.reduce((acc, topic) => acc + (topic.questions?.length || 0), 0);
  const completedTopics = course.topics.filter(topic => topic.completed).length;
  const pendingTopics = course.topics.length - completedTopics;

  return (
    <div className="space-y-8">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total de Tópicos</p>
                <p className="text-3xl font-bold text-gray-900">{course.topics.length}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Estrutura do curso
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total de Questões</p>
                <p className="text-3xl font-bold text-gray-900">{totalQuestions}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Avaliações disponíveis
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Progresso Médio</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(course.progress)}%</p>
                <div className="mt-2">
                  <Progress value={course.progress} className="h-2" />
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Status Geral</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">{completedTopics}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-600">{pendingTopics}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Concluídos / Pendentes</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes do Curso */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Curso */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Informações do Curso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-gray-600 leading-relaxed">{course.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{course.topics.length}</p>
                <p className="text-sm text-blue-700 font-medium">Tópicos Totais</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{totalQuestions}</p>
                <p className="text-sm text-green-700 font-medium">Questões Criadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Rápidas */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Estatísticas Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Tópicos Concluídos</span>
                <Badge className="bg-green-100 text-green-800">{completedTopics}</Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Tópicos Pendentes</span>
                <Badge variant="outline" className="border-amber-300 text-amber-700">{pendingTopics}</Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Taxa de Conclusão</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {course.topics.length > 0 ? Math.round((completedTopics / course.topics.length) * 100) : 0}%
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Progresso Geral: {Math.round(course.progress)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista Detalhada de Tópicos */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Estrutura do Curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {course.topics.map((topic, index) => (
              <div key={topic.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{topic.title}</h4>
                    {topic.questions && topic.questions.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {topic.questions.length} questão(ões) disponível(is)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {topic.questions && topic.questions.length > 0 && (
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {topic.questions.length} questões
                    </Badge>
                  )}
                  <div className="flex items-center gap-2">
                    {topic.completed ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 text-amber-600" />
                        <Badge variant="outline" className="border-amber-300 text-amber-700">Pendente</Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
