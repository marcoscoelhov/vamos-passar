
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { Plus, FileText, BookOpen } from 'lucide-react';
import { Course } from '@/types/course';
import { TopicHierarchyManager } from './TopicHierarchyManager';
import { TopicCreationDialog } from './TopicCreationDialog';
import { AccessDeniedCard } from './AccessDeniedCard';

interface TopicManagementProps {
  course: Course;
  isAdmin: boolean;
  onContentAdded: () => void;
}

export function TopicManagement({ course, isAdmin, onContentAdded }: TopicManagementProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const handleTopicAdded = () => {
    setRefreshKey(prev => prev + 1);
    onContentAdded();
  };
  
  if (!isAdmin) {
    return <AccessDeniedCard />;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Tópicos</h2>
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Tópico
            </Button>
          </div>
          <p className="text-gray-600">
            Crie, edite e organize a estrutura completa dos tópicos do curso.
          </p>
        </Card>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Tópicos</p>
                <p className="text-2xl font-bold text-gray-900">{course.topics.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Níveis de Hierarquia</p>
                <p className="text-2xl font-bold text-gray-900">
                  {course.topics.length > 0 ? Math.max(...course.topics.map(t => t.level), 0) + 1 : 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Topic Hierarchy Manager */}
        <TopicHierarchyManager 
          key={refreshKey}
          course={course} 
          isAdmin={isAdmin}
          onTopicUpdated={handleTopicAdded}
        />
        
        {/* Creation Dialog */}
        <TopicCreationDialog
          open={isCreateDialogOpen}
          onOpenChange={setCreateDialogOpen}
          course={course}
          isAdmin={isAdmin}
          onTopicAdded={handleTopicAdded}
        />
      </div>

      <ScrollToTop />
    </>
  );
}
