
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { FileText, Target, BookOpen } from 'lucide-react';
import { Course } from '@/types/course';
import { TopicManagement } from './TopicManagement';
import { QuestionForm } from './QuestionForm';

interface ContentManagementProps {
  course: Course;
  isAdmin: boolean;
  onContentAdded: () => void;
}

export function ContentManagement({ course, isAdmin, onContentAdded }: ContentManagementProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleContentAdded = () => {
    setRefreshKey(prev => prev + 1);
    onContentAdded();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Gerenciamento de Conteúdo</h2>
          </div>
          <p className="text-gray-600">
            Crie e organize tópicos, importe documentos e adicione questões para enriquecer o curso.
          </p>
        </Card>

        {/* Unified Content Tabs */}
        <Tabs defaultValue="topics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="topics" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Gerenciar Tópicos
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Gerenciar Questões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topics" className="space-y-6">
            <TopicManagement 
              key={refreshKey}
              course={course} 
              isAdmin={isAdmin}
              onContentAdded={handleContentAdded}
            />
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Adicionar Questões</h3>
            </div>
            <QuestionForm 
              topics={course.topics}
              isAdmin={isAdmin}
              onQuestionAdded={handleContentAdded}
            />
          </TabsContent>
        </Tabs>

        {/* Quick Navigation Tip */}
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-green-900">Fluxo Recomendado</h4>
              <p className="text-sm text-green-700">
                Primeiro crie e organize os tópicos, depois adicione questões para cada tópico.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <ScrollToTop />
    </>
  );
}
