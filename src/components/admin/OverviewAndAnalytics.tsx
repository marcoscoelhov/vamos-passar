
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, TrendingUp } from 'lucide-react';
import { Course } from '@/types/course';
import { AdminOverview } from './AdminOverview';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { StudentsManagement } from './StudentsManagement';

interface OverviewAndAnalyticsProps {
  course: Course;
}

export function OverviewAndAnalytics({ course }: OverviewAndAnalyticsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Visão Geral e Analytics</h2>
        </div>
        <p className="text-gray-600">
          Acompanhe métricas, gerencie usuários e monitore o desempenho geral do curso.
        </p>
      </Card>

      {/* Unified Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Resumo do Curso
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard Analítico
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Gerenciar Alunos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AdminOverview course={course} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <StudentsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
