
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Clock, Award, DollarSign } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_categories (
            name,
            color
          ),
          profiles (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: enrollments } = useQuery({
    queryKey: ['course-enrollments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', id);

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Curso não encontrado</h2>
          <Button onClick={() => navigate('/admin')}>
            Voltar ao Admin
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'rascunho': return 'bg-gray-100 text-gray-800';
      case 'pausado': return 'bg-yellow-100 text-yellow-800';
      case 'encerrado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeEnrollments = enrollments?.filter(e => e.enrollment_status === 'ativo').length || 0;
  const totalRevenue = enrollments?.reduce((sum, e) => sum + (e.amount_paid || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{course.title}</h1>
            <p className="text-slate-600 mt-1">Detalhes do curso</p>
          </div>
        </div>

        {/* Course Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(course.status || 'rascunho')}>
                    {course.status?.toUpperCase() || 'RASCUNHO'}
                  </Badge>
                  <Badge variant="outline">
                    {course.course_type?.toUpperCase() || 'ONLINE'}
                  </Badge>
                </div>

                {course.description && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Descrição</h4>
                    <p className="text-slate-600 leading-relaxed">{course.description}</p>
                  </div>
                )}

                {course.target_audience && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Público-Alvo</h4>
                    <p className="text-slate-600">{course.target_audience}</p>
                  </div>
                )}

                {course.prerequisites && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Pré-requisitos</h4>
                    <p className="text-slate-600">{course.prerequisites}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Curso</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-slate-600">Duração</p>
                    <p className="font-semibold">{course.duration_hours || 0}h</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-slate-600">Certificado</p>
                    <p className="font-semibold">
                      {course.certificate_available ? 'Disponível' : 'Não disponível'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-slate-600">Preço</p>
                    <p className="font-semibold">
                      R$ {(course.price || 0).toFixed(2)}
                      {course.discount_price && (
                        <span className="text-sm text-green-600 ml-2">
                          (Promocional: R$ {course.discount_price.toFixed(2)})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-slate-600">Matrículas</p>
                    <p className="font-semibold">{activeEnrollments} alunos ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{activeEnrollments}</p>
                  <p className="text-sm text-blue-600">Alunos Ativos</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    R$ {totalRevenue.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600">Receita Total</p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {course.max_installments || 1}x
                  </p>
                  <p className="text-sm text-purple-600">Máx. Parcelas</p>
                </div>
              </CardContent>
            </Card>

            {/* Category Info */}
            {course.course_categories && (
              <Card>
                <CardHeader>
                  <CardTitle>Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="p-4 rounded-lg text-center"
                    style={{ 
                      backgroundColor: `${course.course_categories.color}20`,
                      borderColor: course.course_categories.color 
                    }}
                  >
                    <p className="font-semibold">{course.course_categories.name}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructor Info */}
            {course.profiles && (
              <Card>
                <CardHeader>
                  <CardTitle>Instrutor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">{course.profiles.name}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
