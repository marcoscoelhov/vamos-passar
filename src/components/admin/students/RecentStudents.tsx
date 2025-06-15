
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RecentStudentsProps {
  students: any[];
}

export function RecentStudents({ students }: RecentStudentsProps) {
  return (
    <Card className="p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4">Usuários Recentes</h3>
      <div className="space-y-3">
        {students.slice(0, 5).map((student) => (
          <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {(student.name || student.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{student.name || 'Nome não informado'}</p>
                <p className="text-sm text-gray-600">{student.email}</p>
              </div>
            </div>
            <Badge variant={student.role === 'professor' ? 'default' : 'outline'}>
              {student.role === 'professor' ? 'Professor' : 'Aluno'}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
