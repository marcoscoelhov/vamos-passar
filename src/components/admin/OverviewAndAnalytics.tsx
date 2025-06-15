
import React from 'react';
import { Course } from '@/types/course';
import { AdminOverview } from './AdminOverview';
import { BarChart3, TrendingUp, Award } from 'lucide-react';

interface OverviewAndAnalyticsProps {
  course: Course;
}

export function OverviewAndAnalytics({ course }: OverviewAndAnalyticsProps) {
  return (
    <div className="space-y-8">
      {/* Header Aprimorado */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 border border-gray-100 rounded-xl p-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Visão Geral do Curso
              </h1>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-600">Painel Administrativo</span>
              </div>
            </div>
          </div>
          
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
            Acompanhe métricas detalhadas, monitore o progresso dos estudantes e obtenha insights 
            valiosos sobre o desempenho e engajamento do seu curso. Use estes dados para otimizar 
            a experiência de aprendizagem.
          </p>
          
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Analytics em Tempo Real</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Métricas Detalhadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <AdminOverview course={course} />
    </div>
  );
}
