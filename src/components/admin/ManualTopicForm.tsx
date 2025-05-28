import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Loader2, FileText } from 'lucide-react';
import { useTopics } from '@/hooks/useTopics';
import { Course, Topic } from '@/types/course';
import { RichTextEditor } from './RichTextEditor';
import { logger } from '@/utils/logger';

interface ManualTopicFormProps {
  course: Course;
  isAdmin: boolean;
  onTopicAdded: () => void;
}

export function ManualTopicForm({ course, isAdmin, onTopicAdded }: ManualTopicFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [parentTopicId, setParentTopicId] = useState<string>('none');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
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
      logger.error('Error in confirmAddTopic', { courseId: course.id, title, error });
      setShowConfirmDialog(false);
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

  return (
    <>
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
    </>
  );
}
