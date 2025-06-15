
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Shield } from 'lucide-react';
import { StudentsOverviewProps } from './types';

export function StudentsOverview({ students }: StudentsOverviewProps) {
  const activeUsersCount = students.filter(s => 
    s.last_activity && 
    new Date(s.last_activity) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  const professorsCount = students.filter(s => s.role === 'professor').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total de Usuários</p>
            <p className="text-2xl font-bold">{students.length}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Usuários Ativos</p>
            <p className="text-2xl font-bold">{activeUsersCount}</p>
            <p className="text-xs text-gray-500">Últimos 30 dias</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Professores</p>
            <p className="text-2xl font-bold">{professorsCount}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
