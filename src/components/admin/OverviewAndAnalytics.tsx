
import React from 'react';
import { Course } from '@/types/course';
import { AdminOverview } from './AdminOverview';

interface OverviewAndAnalyticsProps {
  course: Course;
}

export function OverviewAndAnalytics({ course }: OverviewAndAnalyticsProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-2xl font-serif font-semibold text-gray-900 mb-2">
          Visão Geral do Curso
        </h1>
        <p className="text-gray-600 leading-relaxed">
          Acompanhe métricas gerais, monitore o progresso dos alunos e obtenha insights 
          sobre o desempenho do curso.
        </p>
      </div>

      {/* Content */}
      <AdminOverview course={course} />
    </div>
  );
}
