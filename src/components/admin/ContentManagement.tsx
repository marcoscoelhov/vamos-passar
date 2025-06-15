
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { ListTree, Plus, FileText, BookOpen, Target } from 'lucide-react';
import { Course } from '@/types/course';
import { TopicHierarchyManager } from './TopicHierarchyManager';
import { DocumentImporter } from './DocumentImporter';
import { TopicSuggestions } from './TopicSuggestions';
import { TopicPreviewDialog } from './TopicPreviewDialog';
import { TopicCreationDialog } from './TopicCreationDialog';
import { QuestionForm } from './QuestionForm';
import { useTopics } from '@/hooks/useTopics';
import { AccessDeniedCard } from './AccessDeniedCard';

interface ContentManagementProps {
  course: Course;
  isAdmin: boolean;
  onContentAdded: () => void;
}

interface SuggestedTopic {
  title: string;
  content: string;
  level: number;
}

export function ContentManagement({ course, isAdmin, onContentAdded }: ContentManagementProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([]);
  const [previewTopic, setPreviewTopic] = useState<SuggestedTopic | null>(null);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const { addTopic } = useTopics();

  const handleTopicAdded = () => {
    setRefreshKey(prev => prev + 1);
    onContentAdded();
  };

  const handleContentExtracted = (extractedContent: string, suggestions: SuggestedTopic[] = []) => {
    setSuggestedTopics(suggestions);
  };

  const handleCreateTopicFromSuggestion = async (suggestion: SuggestedTopic) => {
    try {
      await addTopic(
        course.id,
        { title: suggestion.title, content: suggestion.content },
        isAdmin,
        undefined
      );
      setSuggestedTopics(prev => prev.filter(s => s.title !== suggestion.title));
      handleTopicAdded();
    } catch (error) {
      console.error('Error creating topic from suggestion:', error);
    }
  };
  
  if (!isAdmin) {
    return <AccessDeniedCard />;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header with Actions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Conteúdo</h2>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={showQuestions ? "default" : "outline"}
                size="sm"
                onClick={() => setShowQuestions(!showQuestions)}
                className="flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                {showQuestions ? 'Ocultar Questões' : 'Gerenciar Questões'}
              </Button>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Tópico
              </Button>
            </div>
          </div>
          <p className="text-gray-600">
            Crie e organize tópicos, importe documentos e gerencie questões para enriquecer o curso.
          </p>
        </Card>

        {/* Document Importer */}
        <DocumentImporter onContentExtracted={handleContentExtracted} />
        
        {/* Topic Suggestions */}
        {suggestedTopics.length > 0 && (
          <TopicSuggestions
            suggestions={suggestedTopics}
            onCreateTopic={handleCreateTopicFromSuggestion}
            onPreviewTopic={setPreviewTopic}
          />
        )}

        {/* Questions Management (Collapsible) */}
        {showQuestions && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Gerenciar Questões</h3>
            </div>
            <QuestionForm 
              topics={course.topics}
              isAdmin={isAdmin}
              onQuestionAdded={handleTopicAdded}
            />
          </Card>
        )}

        {/* Topic Hierarchy Manager */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ListTree className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Estrutura e Hierarquia dos Tópicos</h3>
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-4">
            Visualize e organize a estrutura completa do curso. Arraste tópicos para reordená-los ou criar hierarquias.
          </div>
          
          <TopicHierarchyManager 
            key={refreshKey}
            course={course} 
            isAdmin={isAdmin}
            onTopicUpdated={handleTopicAdded}
          />
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Questões</p>
                <p className="text-2xl font-bold text-gray-900">
                  {course.topics.reduce((acc, topic) => acc + (topic.questions?.length || 0), 0)}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ListTree className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Níveis de Hierarquia</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...course.topics.map(t => t.level), 0) + 1}
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Creation Dialog */}
        <TopicCreationDialog
          open={isCreateDialogOpen}
          onOpenChange={setCreateDialogOpen}
          course={course}
          isAdmin={isAdmin}
          onTopicAdded={handleTopicAdded}
        />
        
        {/* Preview Dialog */}
        <TopicPreviewDialog 
          topic={previewTopic} 
          onClose={() => setPreviewTopic(null)} 
        />
      </div>

      <ScrollToTop />
    </>
  );
}
