
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Course } from '@/types/course';
import { useTopics } from '@/hooks/useTopics';

interface TopicFormProps {
  course: Course;
  isAdmin: boolean;
  onTopicAdded: () => void;
}

export function TopicForm({ course, isAdmin, onTopicAdded }: TopicFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { addTopic, isLoading } = useTopics();

  const handleSubmit = async () => {
    if (!title || !content) {
      return;
    }

    try {
      await addTopic(
        course.id,
        { title, content },
        isAdmin
      );

      // Reset form
      setTitle('');
      setContent('');
      
      onTopicAdded();
    } catch (error) {
      console.error('Error adding topic:', error);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Adicionar Novo Tópico</h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="topic-title">Título do Tópico</Label>
          <Input
            id="topic-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite o título do tópico"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="topic-content">Conteúdo (Markdown suportado)</Label>
          <Textarea
            id="topic-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Digite o conteúdo do tópico usando markdown..."
            rows={10}
            disabled={isLoading}
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={isLoading || !title || !content}
        >
          {isLoading ? 'Adicionando...' : 'Adicionar Tópico'}
        </Button>
      </div>
    </Card>
  );
}
