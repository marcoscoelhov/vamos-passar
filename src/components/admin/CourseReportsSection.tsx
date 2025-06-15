
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  Download,
  FileText,
  DollarSign
} from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface CourseReport {
  courseId: string;
  courseName: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completions: number;
  revenue: number;
  completionRate: number;
  averageProgress: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  enrollments: number;
}

interface StatusData {
  status: string;
  count: number;
  color: string;
}

export function CourseReportsSection() {
  const [reports, setReports] = useState<CourseReport[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [reportType, setReportType] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    fetchReportsData();
  }, [dateRange, reportType]);

  const fetchReportsData = async () => {
    setIsLoading(true);
    try {
      // Buscar dados de cursos e matrículas
      const { data: courses } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          status,
          price,
          discount_price,
          course_enrollments (
            id,
            enrollment_status,
            amount_paid,
            enrolled_at,
            completed_at
          )
        `);

      if (courses) {
        // Processar dados para relatórios
        const reportsData = courses.map(course => {
          const enrollments = course.course_enrollments || [];
          const activeEnrollments = enrollments.filter(e => e.enrollment_status === 'ativo');
          const completions = enrollments.filter(e => e.enrollment_status === 'concluido');
          const revenue = enrollments.reduce((sum, e) => sum + (e.amount_paid || 0), 0);
          
          return {
            courseId: course.id,
            courseName: course.title,
            totalEnrollments: enrollments.length,
            activeEnrollments: activeEnrollments.length,
            completions: completions.length,
            revenue,
            completionRate: enrollments.length > 0 ? (completions.length / enrollments.length) * 100 : 0,
            averageProgress: 75 // Simulado - seria calculado com base no progresso real
          };
        });

        setReports(reportsData);

        // Dados de receita por mês (simulado)
        const monthlyRevenue = [
          { month: 'Jan', revenue: 12000, enrollments: 45 },
          { month: 'Fev', revenue: 15000, enrollments: 52 },
          { month: 'Mar', revenue: 18000, enrollments: 61 },
          { month: 'Abr', revenue: 22000, enrollments: 73 },
          { month: 'Mai', revenue: 25000, enrollments: 89 },
          { month: 'Jun', revenue: 28000, enrollments: 95 }
        ];
        setRevenueData(monthlyRevenue);

        // Dados de status dos cursos
        const statusCounts = courses.reduce((acc, course) => {
          const status = course.status || 'rascunho';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const statusColors = {
          ativo: '#22c55e',
          pausado: '#f59e0b',
          rascunho: '#6b7280',
          encerrado: '#ef4444'
        };

        const statusArray = Object.entries(statusCounts).map(([status, count]) => ({
          status: status.charAt(0).toUpperCase() + status.slice(1),
          count,
          color: statusColors[status as keyof typeof statusColors] || '#6b7280'
        }));

        setStatusData(statusArray);
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast({
        title: 'Erro ao carregar relatórios',
        description: 'Não foi possível carregar os dados dos relatórios.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    const csvContent = [
      ['Curso', 'Total Matrículas', 'Matrículas Ativas', 'Conclusões', 'Receita', 'Taxa Conclusão'],
      ...reports.map(report => [
        report.courseName,
        report.totalEnrollments,
        report.activeEnrollments,
        report.completions,
        `R$ ${report.revenue.toFixed(2)}`,
        `${report.completionRate.toFixed(1)}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-cursos-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Relatório exportado',
      description: 'O arquivo CSV foi baixado com sucesso.',
    });
  };

  const totalRevenue = reports.reduce((sum, report) => sum + report.revenue, 0);
  const totalEnrollments = reports.reduce((sum, report) => sum + report.totalEnrollments, 0);
  const averageCompletionRate = reports.length > 0 
    ? reports.reduce((sum, report) => sum + report.completionRate, 0) / reports.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios e Analytics</h2>
          <p className="text-gray-600 mt-1">Análise detalhada do desempenho dos cursos</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo de relatório" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Visão Geral</SelectItem>
              <SelectItem value="revenue">Receita</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="students">Estudantes</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportReport} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {totalRevenue.toLocaleString('pt-BR')}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Matrículas</p>
              <p className="text-2xl font-bold text-blue-600">{totalEnrollments}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taxa Média Conclusão</p>
              <p className="text-2xl font-bold text-purple-600">
                {averageCompletionRate.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cursos Ativos</p>
              <p className="text-2xl font-bold text-orange-600">
                {statusData.find(s => s.status === 'Ativo')?.count || 0}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Receita */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Receita Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`R$ ${value}`, 'Receita']} />
              <Bar dataKey="revenue" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Gráfico de Status dos Cursos */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Status dos Cursos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                label={({ status, count }) => `${status}: ${count}`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tabela de Performance dos Cursos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance por Curso</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Curso</th>
                <th className="text-right py-3 px-4">Matrículas</th>
                <th className="text-right py-3 px-4">Conclusões</th>
                <th className="text-right py-3 px-4">Taxa Conclusão</th>
                <th className="text-right py-3 px-4">Receita</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.courseId} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{report.courseName}</td>
                  <td className="py-3 px-4 text-right">{report.totalEnrollments}</td>
                  <td className="py-3 px-4 text-right">{report.completions}</td>
                  <td className="py-3 px-4 text-right">
                    <Badge 
                      variant={report.completionRate >= 70 ? 'default' : 'secondary'}
                      className={report.completionRate >= 70 ? 'bg-green-100 text-green-800' : ''}
                    >
                      {report.completionRate.toFixed(1)}%
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    R$ {report.revenue.toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
