
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { TrendingUp, BookOpen, FileText } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';
import { OverviewAndAnalytics } from './admin/OverviewAndAnalytics';
import { ContentManagement } from './admin/ContentManagement';
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
            <p className="text-gray-600">Gerencie conteúdo, monitore desempenho e administre usuários</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewAndAnalytics 
                key={refreshKey}
                course={currentCourse} 
              />
            </TabsContent>

            <TabsContent value="content">
              <ContentManagement 
                course={currentCourse} 
                isAdmin={isAdmin}
                onContentAdded={handleContentAdded}
              />
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
