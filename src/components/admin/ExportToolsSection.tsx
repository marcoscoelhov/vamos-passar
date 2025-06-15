
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Download, 
  FileText, 
  Database, 
  Users,
  BookOpen,
  DollarSign,
  Calendar,
  Settings
} from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExportOptions {
  courses: boolean;
  students: boolean;
  enrollments: boolean;
  revenue: boolean;
  progress: boolean;
  analytics: boolean;
}

export function ExportToolsSection() {
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    courses: true,
    students: false,
    enrollments: false,
    revenue: false,
    progress: false,
    analytics: false
  });
  const { toast } = useToast();

  const handleExportOptionChange = (option: keyof ExportOptions, checked: boolean) => {
    setExportOptions(prev => ({ ...prev, [option]: checked }));
  };

  const exportData = async () => {
    setIsExporting(true);
    try {
      const exportData: any = {};

      // Exportar cursos
      if (exportOptions.courses) {
        const { data: courses } = await supabase
          .from('courses')
          .select(`
            id,
            title,
            description,
            status,
            price,
            discount_price,
            duration_hours,
            created_at,
            course_categories(name)
          `);
        exportData.courses = courses;
      }

      // Exportar estudantes
      if (exportOptions.students) {
        const { data: students } = await supabase
          .from('profiles')
          .select('id, name, email, role, created_at')
          .eq('role', 'student');
        exportData.students = students;
      }

      // Exportar matrículas
      if (exportOptions.enrollments) {
        const { data: enrollments } = await supabase
          .from('course_enrollments')
          .select(`
            id,
            enrollment_status,
            enrolled_at,
            completed_at,
            amount_paid,
            courses(title),
            profiles(name, email)
          `);
        exportData.enrollments = enrollments;
      }

      // Exportar dados de receita
      if (exportOptions.revenue) {
        const { data: revenue } = await supabase
          .from('course_enrollments')
          .select(`
            amount_paid,
            enrolled_at,
            courses(title, price)
          `)
          .not('amount_paid', 'is', null);
        exportData.revenue = revenue;
      }

      // Simular progresso dos estudantes
      if (exportOptions.progress) {
        const { data: progress } = await supabase
          .from('user_progress')
          .select(`
            completed,
            completed_at,
            profiles(name, email),
            topics(title, course_id)
          `);
        exportData.progress = progress;
      }

      // Gerar arquivo de exportação
      if (exportFormat === 'csv') {
        generateCSVExport(exportData);
      } else {
        generateJSONExport(exportData);
      }

      toast({
        title: 'Exportação concluída',
        description: 'Os dados foram exportados com sucesso.',
      });

    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os dados.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSVExport = (data: any) => {
    const sheets = Object.keys(data);
    
    if (sheets.length === 1) {
      // Exportar uma única planilha
      const sheetData = data[sheets[0]];
      if (sheetData && sheetData.length > 0) {
        const headers = Object.keys(sheetData[0]);
        const csvContent = [
          headers.join(','),
          ...sheetData.map((row: any) => 
            headers.map(header => {
              const value = row[header];
              return typeof value === 'object' ? JSON.stringify(value) : value;
            }).join(',')
          )
        ].join('\n');

        downloadFile(csvContent, `${sheets[0]}-export.csv`, 'text/csv');
      }
    } else {
      // Exportar múltiplas planilhas em arquivos separados
      sheets.forEach(sheetName => {
        const sheetData = data[sheetName];
        if (sheetData && sheetData.length > 0) {
          const headers = Object.keys(sheetData[0]);
          const csvContent = [
            headers.join(','),
            ...sheetData.map((row: any) => 
              headers.map(header => {
                const value = row[header];
                return typeof value === 'object' ? JSON.stringify(value) : value;
              }).join(',')
            )
          ].join('\n');

          downloadFile(csvContent, `${sheetName}-export.csv`, 'text/csv');
        }
      });
    }
  };

  const generateJSONExport = (data: any) => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, 'data-export.json', 'application/json');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const backupDatabase = async () => {
    setIsExporting(true);
    try {
      // Fazer backup completo de todas as tabelas principais
      const tableNames = ['courses', 'course_categories', 'course_enrollments', 'profiles', 'topics', 'questions'];
      const backupData: any = {};

      for (const tableName of tableNames) {
        try {
          const { data } = await supabase.from(tableName as any).select('*');
          backupData[tableName] = data;
        } catch (error) {
          console.error(`Error backing up table ${tableName}:`, error);
          backupData[tableName] = [];
        }
      }

      const backupContent = JSON.stringify(backupData, null, 2);
      const timestamp = new Date().toISOString().split('T')[0];
      downloadFile(backupContent, `backup-completo-${timestamp}.json`, 'application/json');

      toast({
        title: 'Backup realizado',
        description: 'Backup completo do banco de dados foi criado.',
      });

    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: 'Erro no backup',
        description: 'Não foi possível criar o backup.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ferramentas de Exportação</h2>
        <p className="text-gray-600 mt-1">Exporte dados e crie backups do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exportação Personalizada */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportação Personalizada
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Formato de Exportação
              </label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Período (Opcional)
              </label>
              <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Dados para Exportar
              </label>
              <div className="space-y-3">
                {[
                  { key: 'courses', label: 'Cursos', icon: BookOpen },
                  { key: 'students', label: 'Estudantes', icon: Users },
                  { key: 'enrollments', label: 'Matrículas', icon: Calendar },
                  { key: 'revenue', label: 'Receita', icon: DollarSign },
                  { key: 'progress', label: 'Progresso', icon: Settings },
                  { key: 'analytics', label: 'Analytics', icon: FileText }
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={exportOptions[key as keyof ExportOptions]}
                      onCheckedChange={(checked) => 
                        handleExportOptionChange(key as keyof ExportOptions, checked as boolean)
                      }
                    />
                    <label htmlFor={key} className="flex items-center gap-2 text-sm">
                      <Icon className="w-4 h-4" />
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={exportData} 
              disabled={isExporting || !Object.values(exportOptions).some(Boolean)}
              className="w-full"
            >
              {isExporting ? 'Exportando...' : 'Exportar Dados'}
            </Button>
          </div>
        </Card>

        {/* Backup e Restauração */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Backup e Restauração
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Backup Completo</h4>
              <p className="text-sm text-blue-700 mb-3">
                Cria um backup completo de todos os dados do sistema incluindo cursos, 
                usuários, matrículas e configurações.
              </p>
              <Button 
                onClick={backupDatabase}
                disabled={isExporting}
                variant="outline"
                className="w-full"
              >
                {isExporting ? 'Criando Backup...' : 'Criar Backup Completo'}
              </Button>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Backup Automático</h4>
              <p className="text-sm text-yellow-700 mb-3">
                Configure backups automáticos diários para maior segurança dos dados.
              </p>
              <Button variant="outline" className="w-full" disabled>
                Configurar Backup Automático
              </Button>
              <p className="text-xs text-yellow-600 mt-1">
                * Funcionalidade disponível em breve
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Restaurar Backup</h4>
              <p className="text-sm text-green-700 mb-3">
                Restaure o sistema a partir de um arquivo de backup anterior.
              </p>
              <Button variant="outline" className="w-full" disabled>
                Restaurar do Backup
              </Button>
              <p className="text-xs text-green-600 mt-1">
                * Funcionalidade disponível em breve
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
