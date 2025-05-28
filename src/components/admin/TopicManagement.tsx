
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { PlusCircle, TreePine, FileText } from 'lucide-react';
import { Course } from '@/types/course';
import { TopicForm } from './TopicForm';
import { TopicHierarchyManager } from './TopicHierarchyManager';
import { BulkContentButton } from './BulkContentButton';

interface TopicManagementProps {
  course: Course;
  isAdmin: boolean;
  onContentAdded: () => void;
}

export function TopicManagement({ course, isAdmin, onContentAdded }: TopicManagementProps) {
  const [activeTab, setActiveTab] = useState('create');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTopicAdded = () => {
    setRefreshKey(prev => prev + 1);
    onContentAdded();
    // Automatically switch to hierarchy view when a topic is created
    setActiveTab('hierarchy');
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Gerenciamento de Tópicos</h2>
          </div>
          <p className="text-gray-600">
            Crie novos tópicos, importe documentos e organize a hierarquia do curso de forma integrada.
          </p>
          
          {isAdmin && (
            <div className="mt-4">
              <BulkContentButton 
                course={course} 
                onContentAdded={handleTopicAdded}
              />
            </div>
          )}
        </Card>

        {/* Unified Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Criar Tópicos
            </TabsTrigger>
            <TabsTrigger value="hierarchy" className="flex items-center gap-2">
              <TreePine className="w-4 h-4" />
              Organizar Hierarquia
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <TopicForm 
              course={course} 
              isAdmin={isAdmin}
              onTopicAdded={handleTopicAdded}
            />
          </TabsContent>

          <TabsContent value="hierarchy" className="space-y-6">
            <TopicHierarchyManager 
              key={refreshKey}
              course={course} 
              isAdmin={isAdmin}
              onTopicUpdated={onContentAdded}
            />
          </TabsContent>
        </Tabs>

        {/* Quick Actions for Better UX */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">Dica</h4>
              <p className="text-sm text-blue-700">
                {activeTab === 'create' 
                  ? 'Após criar um tópico, você será automaticamente direcionado para organizar a hierarquia.'
                  : 'Use drag-and-drop para reorganizar os tópicos ou criar subtópicos.'
                }
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab(activeTab === 'create' ? 'hierarchy' : 'create')}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              {activeTab === 'create' ? 'Ver Hierarquia' : 'Criar Tópico'}
            </Button>
          </div>
        </Card>
      </div>

      <ScrollToTop />
    </>
  );
}
