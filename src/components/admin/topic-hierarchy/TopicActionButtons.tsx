
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Edit2, 
  Trash2, 
  Plus, 
  Eye,
  Copy,
  RefreshCw
} from 'lucide-react';
import { Topic } from '@/types/course';

interface TopicActionButtonsProps {
  topic: Topic;
  hasContentIssues: boolean;
  onFixContent: (topic: Topic) => void;
  onPreviewTopic: (topic: Topic) => void;
  onStartEdit: (topicId: string, title: string) => void;
  onDuplicateTopic: (topic: Topic) => void;
  onAddSubtopic: (parentId: string) => void;
  onDeleteTopic: (topicId: string) => void;
}

export const TopicActionButtons: React.FC<TopicActionButtonsProps> = ({
  topic,
  hasContentIssues,
  onFixContent,
  onPreviewTopic,
  onStartEdit,
  onDuplicateTopic,
  onAddSubtopic,
  onDeleteTopic,
}) => {
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {hasContentIssues && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFixContent(topic)}
          className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700"
          title="Corrigir formatação"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPreviewTopic(topic)}
        className="h-8 w-8 p-0"
        title="Visualizar conteúdo"
      >
        <Eye className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onStartEdit(topic.id, topic.title)}
        className="h-8 w-8 p-0"
        title="Editar título"
      >
        <Edit2 className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDuplicateTopic(topic)}
        className="h-8 w-8 p-0"
        title="Duplicar tópico"
      >
        <Copy className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAddSubtopic(topic.id)}
        className="h-8 w-8 p-0"
        title="Adicionar subtópico"
      >
        <Plus className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDeleteTopic(topic.id)}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
        title="Excluir tópico"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
