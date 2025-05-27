
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Loader2, AlertTriangle, FileText } from 'lucide-react';
import { useTopics } from '@/hooks/useTopics';
import { Course, Topic } from '@/types/course';
import { RichTextEditor } from './RichTextEditor';
import { DocumentImporter } from './DocumentImporter';
import { TopicSuggestions } from './TopicSuggestions';

interface TopicFormProps {
  course: Course;
  isAdmin: boolean;
  onTopicAdded: () => void;
}

interface SuggestedTopic {
  title: string;
  content: string;
  level: number;
}

export function TopicForm({ course, isAdmin, onTopicAdded }: TopicFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [parentTopicId, setParentTopicId] = useState<string>('none');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([]);
  const [previewTopic, setPreviewTopic] = useState<SuggestedTopic | null>(null);
  const { addTopic, isLoading } = useTopics();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmAddTopic = async () => {
    try {
      await addTopic(
        course.id,
        { title: title.trim(), content: content.trim() },
        isAdmin,
        parentTopicId === 'none' ? undefined : parentTopicId
      );
      
      // Reset form
      setTitle('');
      setContent('');
      setParentTopicId('none');
      setShowConfirmDialog(false);
      onTopicAdded();
    } catch (error) {
      console.error('Error in confirmAddTopic:', error);
      setShowConfirmDialog(false);
    }
  };

  const handleContentExtracted = (extractedContent: string, suggestions: SuggestedTopic[] = []) => {
    setContent(extractedContent);
    setSuggestedTopics(suggestions);
    
    // Se não há sugestões de tópicos, mas há conteúdo, sugerir criar um tópico único
    if (suggestions.length === 0 && extractedContent.trim()) {
      setTitle('Tópico Importado');
    }
  };

  const handleCreateTopicFromSuggestion = async (suggestion: SuggestedTopic) => {
    try {
      await addTopic(
        course.id,
        { title: suggestion.title, content: suggestion.content },
        isAdmin,
        undefined // Por enquanto, criar como tópico principal
      );
      
      // Remover da lista de sugestões
      setSuggestedTopics(prev => prev.filter(s => s !== suggestion));
      onTopicAdded();
    } catch (error) {
      console.error('Error creating topic from suggestion:', error);
    }
  };

  const getTopicOptions = (topics: Topic[], level = 0): JSX.Element[] => {
    const options: JSX.Element[] = [];
    
    topics.forEach(topic => {
      const indent = '  '.repeat(level);
      options.push(
        <SelectItem key={topic.id} value={topic.id}>
          {indent}{topic.title}
        </SelectItem>
      );
      
      if (topic.children && topic.children.length > 0) {
        options.push(...getTopicOptions(topic.children, level + 1));
      }
    });
    
    return options;
  };

  if (!isAdmin) {
    return (
      <Card className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
        <p className="text-gray-600">
          Apenas administradores podem adicionar novos tópicos.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Importador de Documentos */}
      <DocumentImporter onContentExtracted={handleContentExtracted} />
      
      {/* Sugestões de Tópicos */}
      <TopicSuggestions
        suggestions={suggestedTopics}
        onCreateTopic={handleCreateTopicFromSuggestion}
        onPreviewTopic={setPreviewTopic}
      />

      {/* Formulário Manual */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Criar Tópico Manualmente</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título do Tópico
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do tópico..."
              required
            />
          </div>

          <div>
            <label htmlFor="parent" className="block text-sm font-medium text-gray-700 mb-1">
              Tópico Pai (opcional)
            </label>
            <Select value={parentTopicId} onValueChange={setParentTopicId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tópico pai ou deixe em branco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum (tópico principal)</SelectItem>
                {getTopicOptions(course.topics)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Conteúdo
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Digite o conteúdo do tópico... Você pode colar conteúdo do Word com formatação preservada!"
              className="min-h-[400px]"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !title.trim() || !content.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adicionando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Tópico
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewTopic} onOpenChange={() => setPreviewTopic(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTopic?.title}</DialogTitle>
          </DialogHeader>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: previewTopic?.content || '' }}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar adição de tópico</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a adicionar um novo tópico "{title}" ao curso. 
              {parentTopicId && parentTopicId !== 'none' ? ' Este será um subtópico.' : ' Este será um tópico principal.'}
              
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="text-sm"><strong>Título:</strong> {title}</p>
                <div className="text-sm">
                  <strong>Conteúdo:</strong> 
                  <div 
                    className="mt-1 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: content.length > 200 ? content.substring(0, 200) + '...' : content 
                    }}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAddTopic} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : (
                'Confirmar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
