
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Loader2, AlertTriangle } from 'lucide-react';
import { useTopics } from '@/hooks/useTopics';
import { Course, Topic } from '@/types/course';

interface TopicFormProps {
  course: Course;
  isAdmin: boolean;
  onTopicAdded: () => void;
}

export function TopicForm({ course, isAdmin, onTopicAdded }: TopicFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [parentTopicId, setParentTopicId] = useState<string>('');
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
        parentTopicId || undefined
      );
      
      // Reset form
      setTitle('');
      setContent('');
      setParentTopicId('');
      setShowConfirmDialog(false);
      onTopicAdded();
    } catch (error) {
      console.error('Error in confirmAddTopic:', error);
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
      
      if (topic.subtopics && topic.subtopics.length > 0) {
        options.push(...getTopicOptions(topic.subtopics, level + 1));
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
    <Card className="p-6">
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
              <SelectItem value="">Nenhum (tópico principal)</SelectItem>
              {getTopicOptions(course.topics)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Conteúdo
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Digite o conteúdo do tópico..."
            rows={8}
            required
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

      {/* Diálogo de confirmação */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar adição de tópico</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a adicionar um novo tópico "{title}" ao curso. 
              {parentTopicId ? ' Este será um subtópico.' : ' Este será um tópico principal.'}
              
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="text-sm"><strong>Título:</strong> {title}</p>
                <p className="text-sm"><strong>Conteúdo:</strong> {content.substring(0, 100)}...</p>
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
    </Card>
  );
}
