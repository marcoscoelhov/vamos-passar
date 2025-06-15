
import React from 'react';
import { StatCard } from './StatCard';
import { Course, CourseEnrollment } from '@/types/course';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Award 
} from 'lucide-react';

interface CourseStatsCardsProps {
  courses: Course[];
  enrollments: CourseEnrollment[];
}

export function CourseStatsCards({ courses, enrollments }: CourseStatsCardsProps) {
  // Calcular estatísticas
  const totalCourses = courses.length;
  const activeCourses = courses.filter(c => c.status === 'ativo').length;
  const totalStudents = enrollments.filter(e => e.enrollment_status === 'ativo').length;
  const completedCourses = enrollments.filter(e => e.enrollment_status === 'concluido').length;
  
  // Receita total
  const totalRevenue = enrollments
    .filter(e => e.enrollment_status === 'ativo' || e.enrollment_status === 'concluido')
    .reduce((sum, e) => sum + (e.amount_paid || 0), 0);

  // Duração total dos cursos
  const totalHours = courses.reduce((sum, c) => sum + (c.duration_hours || 0), 0);

  // Calcular tendências (simulado - em produção viria de dados históricos)
  const coursesGrowth = activeCourses > 0 ? '+12%' : '0%';
  const studentsGrowth = totalStudents > 0 ? '+25%' : '0%';
  const revenueGrowth = totalRevenue > 0 ? '+18%' : '0%';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        title="Total de Cursos"
        value={totalCourses}
        description={`${activeCourses} ativos`}
        icon={BookOpen}
        color="blue"
        trend={{
          value: coursesGrowth,
          direction: activeCourses > 0 ? 'up' : 'neutral'
        }}
      />
      
      <StatCard
        title="Estudantes Ativos"
        value={totalStudents}
        description="Matrículas ativas"
        icon={Users}
        color="green"
        trend={{
          value: studentsGrowth,
          direction: totalStudents > 0 ? 'up' : 'neutral'
        }}
      />
      
      <StatCard
        title="Receita Total"
        value={formatCurrency(totalRevenue)}
        description="Este mês"
        icon={DollarSign}
        color="purple"
        trend={{
          value: revenueGrowth,
          direction: totalRevenue > 0 ? 'up' : 'neutral'
        }}
      />
      
      <StatCard
        title="Cursos Concluídos"
        value={completedCourses}
        description="Certificados emitidos"
        icon={Award}
        color="amber"
        badge="Novo"
      />
      
      <StatCard
        title="Horas de Conteúdo"
        value={`${totalHours}h`}
        description="Total disponível"
        icon={Clock}
        color="red"
      />
      
      <StatCard
        title="Taxa de Conclusão"
        value={totalStudents > 0 ? `${Math.round((completedCourses / totalStudents) * 100)}%` : '0%'}
        description="Média geral"
        icon={TrendingUp}
        color="gray"
        trend={{
          value: '+5%',
          direction: 'up'
        }}
      />
    </div>
  );
}
