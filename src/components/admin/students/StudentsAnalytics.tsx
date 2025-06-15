
import React from 'react';
import { Card } from '@/components/ui/card';
import { StudentsAnalyticsProps } from './types';

export function StudentsAnalytics({ students, getProgressPercentage }: StudentsAnalyticsProps) {
  const averageProgress = Math.round(
    students.reduce((acc, student) => 
      acc + getProgressPercentage(student.progress_count, student.total_topics), 0
    ) / Math.max(students.length, 1)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Distribuição de Roles</h3>
        <div className="space-y-4">
          {['student', 'professor', 'admin'].map(role => {
            const count = students.filter(s => s.role === role || (role === 'admin' && s.is_admin)).length;
            const percentage = students.length > 0 ? (count / students.length) * 100 : 0;
            
            return (
              <div key={role} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{role === 'student' ? 'Alunos' : role === 'professor' ? 'Professores' : 'Admins'}</span>
                  <span>{count} ({Math.round(percentage)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Progresso Médio</h3>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {averageProgress}%
          </div>
          <p className="text-gray-600">Progresso médio dos usuários</p>
        </div>
      </Card>
    </div>
  );
}
