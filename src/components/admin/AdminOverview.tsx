
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, Users } from 'lucide-react';
import { Course } from '@/types/course';

interface AdminOverviewProps {
  course: Course;
}

export function AdminOverview({ course }: AdminOverviewProps) {
  const totalQuestions = course.topics.reduce((acc, topic) => acc + (topic.questions?.length || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Tópicos</p>
              <p className="text-2xl font-bold text-gray-900">{course.topics.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Questões</p>
              <p className="text-2xl font-bold text-gray-900">{totalQuestions}</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Progresso Médio</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(course.progress)}%</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Curso: {course.title}</h3>
        <p className="text-gray-600 mb-4">{course.description}</p>
        
        <div className="space-y-2">
          {course.topics.map((topic, index) => (
            <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium">{index + 1}. {topic.title}</span>
                {topic.questions && topic.questions.length > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {topic.questions.length} questão(ões)
                  </Badge>
                )}
              </div>
              <Badge variant={topic.completed ? "default" : "secondary"}>
                {topic.completed ? 'Concluído' : 'Pendente'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
