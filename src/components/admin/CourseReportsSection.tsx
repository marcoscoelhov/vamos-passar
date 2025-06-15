
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, Download, Calendar, Users, BookOpen, TrendingUp } from 'lucide-react';
import { Course } from '@/types/course';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface CourseReportsSectionProps {
  course: Course;
  isAdmin: boolean;
}

interface ReportData {
  totalStudents: number;
  activeStudents: number;
  completedTopics: number;
  averageProgress: number;
  enrollmentTrend: Array<{ date: string; count: number }>;
}

export function CourseReportsSection({ course, isAdmin }: CourseReportsSectionProps) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      fetchReportData();
    }
  }, [course.id, selectedPeriod, isAdmin]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      // Buscar dados de matrículas
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', course.id);

      if (enrollmentsError) throw enrollmentsError;

      // Buscar progresso dos usuários
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('*, topics!inner(*)')
        .eq('topics.course_id', course.id);

      if (progressError) throw progressError;

      // Calcular métricas
      const totalStudents = enrollments?.length || 0;
      const activeStudents = enrollments?.filter(e => e.enrollment_status === 'ativo').length || 0;
      const completedTopics = progress?.filter(p => p.completed).length || 0;
      
      // Calcular progresso médio
      const userProgress = new Map();
      progress?.forEach(p => {
        const userId = p.user_id;
        if (!userProgress.has(userId)) {
          userProgress.set(userId, { completed: 0, total: 0 });
        }
        userProgress.get(userId).total += 1;
        if (p.completed) {
          userProgress.get(userId).completed += 1;
        }
      });

      let totalProgressPercentage = 0;
      userProgress.forEach(user => {
        totalProgressPercentage += user.total > 0 ? (user.completed / user.total) * 100 : 0;
      });
      
      const averageProgress = userProgress.size > 0 ? totalProgressPercentage / userProgress.size : 0;

      // Trend de matrículas dos últimos dias
      const days = parseInt(selectedPeriod);
      const enrollmentTrend = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const count = enrollments?.filter(e => {
          const enrollDate = new Date(e.enrolled_at).toISOString().split('T')[0];
          return enrollDate === dateStr;
        }).length || 0;
        
        enrollmentTrend.push({ date: dateStr, count });
      }

      setReportData({
        totalStudents,
        activeStudents,
        completedTopics,
        averageProgress,
        enrollmentTrend
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: 'Erro ao carregar relatórios',
        description: 'Não foi possível carregar os dados do relatório.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDFReport = () => {
    if (!reportData) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 30;

    // Título
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Relatório do Curso: ${course.title}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Data do relatório
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, yPosition);
    yPosition += 20;

    // Métricas principais
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Métricas Principais', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total de Estudantes: ${reportData.totalStudents}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Estudantes Ativos: ${reportData.activeStudents}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Tópicos Completados: ${reportData.completedTopics}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Progresso Médio: ${reportData.averageProgress.toFixed(1)}%`, 20, yPosition);
    yPosition += 20;

    // Trend de matrículas
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Tendência de Matrículas', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    reportData.enrollmentTrend.forEach(item => {
      pdf.text(`${item.date}: ${item.count} matrículas`, 20, yPosition);
      yPosition += 8;
    });

    pdf.save(`relatorio-${course.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: 'Relatório gerado',
      description: 'O relatório em PDF foi baixado com sucesso.',
    });
  };

  if (!isAdmin) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileSpreadsheet className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Acesso Negado
        </h3>
        <p className="text-gray-600">
          Apenas administradores podem acessar relatórios.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios do Curso</h2>
          <p className="text-gray-600 mt-1">Análise detalhada do desempenho e engajamento</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={generatePDFReport}
            disabled={!reportData}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Baixar PDF
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-16 h-8 bg-gray-200 rounded"></div>
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : reportData ? (
        <>
          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Estudantes</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.totalStudents}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estudantes Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.activeStudents}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tópicos Completados</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.completedTopics}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Progresso Médio</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.averageProgress.toFixed(1)}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Gráfico de Tendência */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tendência de Matrículas</h3>
            <div className="space-y-2">
              {reportData.enrollmentTrend.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                  <span className="font-medium">{item.count} matrículas</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum dado disponível
          </h3>
          <p className="text-gray-600">
            Não há dados suficientes para gerar relatórios.
          </p>
        </Card>
      )}
    </div>
  );
}
