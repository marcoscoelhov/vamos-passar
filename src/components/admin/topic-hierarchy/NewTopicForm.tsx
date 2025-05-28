
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface NewTopicFormProps {
  newTopicTitle: string;
  newTopicParent: string | null;
  isLoading: boolean;
  onTitleChange: (title: string) => void;
  onCreate: () => void;
  onCancel: () => void;
}

export const NewTopicForm: React.FC<NewTopicFormProps> = ({
  newTopicTitle,
  newTopicParent,
  isLoading,
  onTitleChange,
  onCreate,
  onCancel,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      onCreate();
    }
  };

  return (
    <Card className="p-6">
      <h4 className="text-lg font-semibold mb-4">
        {newTopicParent ? 'Criar Subtópico' : 'Criar Novo Tópico'}
      </h4>
      <div className="flex items-center gap-2">
        <Input
          value={newTopicTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Digite o título do tópico..."
          onKeyDown={handleKeyDown}
          className="flex-1"
          disabled={isLoading}
        />
        <Button 
          onClick={onCreate}
          disabled={isLoading || !newTopicTitle.trim()}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
        </Button>
        <Button 
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>
    </Card>
  );
};
