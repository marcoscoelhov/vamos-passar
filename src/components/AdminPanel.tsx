
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Target, Users } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';
import { AdminOverview } from './admin/AdminOverview';
import { TopicForm } from './admin/TopicForm';
import { QuestionForm } from './admin/QuestionForm';

export function AdminPanel() {
  const { currentCourse, profile } = useCourse();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleContentAdded = () => {
    // Trigger a refresh of the course data
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Gerencie conteúdo e questões do curso</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="topics">Tópicos</TabsTrigger>
            <TabsTrigger value="questions">Questões</TabsTrigger>
            <TabsTrigger value="students">Alunos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview course={currentCourse} />
          </TabsContent>

          <TabsContent value="topics">
            <div className="flex items-center gap-2 mb-6">
              <PlusCircle className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Gerenciar Tópicos</h2>
            </div>
            <TopicForm 
              course={currentCourse} 
              isAdmin={isAdmin}
              onTopicAdded={handleContentAdded}
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
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Gerenciar Alunos</h2>
            </div>
            <div className="bg-white rounded-lg p-8 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gestão de Alunos</h3>
              <p className="text-gray-600">
                Funcionalidade em desenvolvimento. Aqui você poderá gerenciar alunos, 
                ver relatórios de progresso e estatísticas de uso.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
