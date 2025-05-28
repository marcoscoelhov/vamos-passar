
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { Target, Users, BarChart3, FileText, TreePine } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';
import { AdminOverview } from './admin/AdminOverview';
import { TopicManagement } from './admin/TopicManagement';
import { QuestionForm } from './admin/QuestionForm';
import { StudentsManagement } from './admin/StudentsManagement';
import { AnalyticsDashboard } from './admin/AnalyticsDashboard';
import { AuditLogs } from './admin/AuditLogs';

export function AdminPanel() {
  const { currentCourse, profile } = useCourse();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleContentAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!currentCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Nenhum curso selecionado</p>
      </div>
    );
  }

  const isAdmin = profile?.is_admin || false;

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
            <p className="text-gray-600">Gerencie conteúdo, questões e monitore o desempenho</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="topics">Tópicos</TabsTrigger>
              <TabsTrigger value="questions">Questões</TabsTrigger>
              <TabsTrigger value="students">Alunos</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <AdminOverview course={currentCourse} />
            </TabsContent>

            <TabsContent value="analytics">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Dashboard Analítico</h2>
              </div>
              <AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="topics">
              <TopicManagement 
                course={currentCourse} 
                isAdmin={isAdmin}
                onContentAdded={handleContentAdded}
              />
            </TabsContent>

            <TabsContent value="questions">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Gerenciar Questões</h2>
              </div>
              <QuestionForm 
                topics={currentCourse.topics}
                isAdmin={isAdmin}
                onQuestionAdded={handleContentAdded}
              />
            </TabsContent>

            <TabsContent value="students">
              <StudentsManagement />
            </TabsContent>

            <TabsContent value="logs">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Logs de Auditoria</h2>
              </div>
              <AuditLogs />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <ScrollToTop />
    </>
  );
}
