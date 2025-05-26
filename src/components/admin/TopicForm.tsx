
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Course, Topic } from '@/types/course';
import { useTopics } from '@/hooks/useTopics';
import { flattenTopicHierarchy } from '@/utils/dataMappers';

interface TopicFormProps {
  course: Course;
  isAdmin: boolean;
  onTopicAdded: () => void;
}

export function TopicForm({ course, isAdmin, onTopicAdded }: TopicFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [parentTopicId, setParentTopicId] = useState<string>('');
  const { addTopic, isLoading } = useTopics();

  const allTopics = flattenTopicHierarchy(course.topics);

  const handleSubmit = async () => {
    if (!title || !content) {
      return;
    }

    try {
      await addTopic(
        course.id,
        { title, content },
        isAdmin,
        parentTopicId || undefined
      );

      // Reset form
      setTitle('');
      setContent('');
      setParentTopicId('');
      
      onTopicAdded();
    } catch (error) {
      console.error('Error adding topic:', error);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">
        Adicionar Novo {parentTopicId ? 'Subtópico' : 'Tópico'}
      </h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="parent-topic">Tópico Pai (opcional)</Label>
          <Select value={parentTopicId} onValueChange={setParentTopicId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um tópico pai ou deixe vazio para tópico principal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum (Tópico Principal)</SelectItem>
              {allTopics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {'  '.repeat(topic.level)}{topic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="topic-title">Título do {parentTopicId ? 'Subtópico' : 'Tópico'}</Label>
          <Input
            id="topic-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Digite o título do ${parentTopicId ? 'subtópico' : 'tópico'}`}
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="topic-content">Conteúdo (Markdown suportado)</Label>
          <Textarea
            id="topic-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Digite o conteúdo usando markdown..."
            rows={10}
            disabled={isLoading}
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={isLoading || !title || !content}
        >
          {isLoading ? 'Adicionando...' : `Adicionar ${parentTopicId ? 'Subtópico' : 'Tópico'}`}
        </Button>
      </div>
    </Card>
  );
}
