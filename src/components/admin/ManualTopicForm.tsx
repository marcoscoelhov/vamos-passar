
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { useTopics } from '@/hooks/useTopics';
import { Course, Topic } from '@/types/course';
import { RichTextEditor } from './RichTextEditor';

interface ManualTopicFormProps {
  course: Course;
  isAdmin: boolean;
  onTopicAdded: () => void;
  initialParentTopicId?: string;
}

export function ManualTopicForm({ course, isAdmin, onTopicAdded, initialParentTopicId }: ManualTopicFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [parentTopicId, setParentTopicId] = useState<string>(initialParentTopicId || 'none');
  const { addTopic, isLoading } = useTopics();

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || isLoading) {
      return;
    }

    try {
      await addTopic(
        course.id,
        { title: title.trim(), content: content.trim() },
        isAdmin,
        parentTopicId === 'none' ? undefined : parentTopicId
      );
      onTopicAdded();
    } catch (error) {
      console.error('Error in handleAddTopic:', error);
    }
  };

  const getTopicOptions = (topics: Topic[], level = 0): JSX.Element[] => {
    const options: JSX.Element[] = [];
    
    topics.forEach(topic => {
      const indent = '\u00A0\u00A0'.repeat(level * 2);
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
    <form onSubmit={handleAddTopic} className="space-y-4">
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
          className="min-h-[300px]"
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
  );
}
