
import React, { memo, useCallback } from 'react';
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

export const TopicActionButtons = memo<TopicActionButtonsProps>(({
  topic,
  hasContentIssues,
  onFixContent,
  onPreviewTopic,
  onStartEdit,
  onDuplicateTopic,
  onAddSubtopic,
  onDeleteTopic,
}) => {
  const handleFixContent = useCallback(() => {
    onFixContent(topic);
  }, [onFixContent, topic]);

  const handlePreviewTopic = useCallback(() => {
    onPreviewTopic(topic);
  }, [onPreviewTopic, topic]);

  const handleStartEdit = useCallback(() => {
    onStartEdit(topic.id, topic.title);
  }, [onStartEdit, topic.id, topic.title]);

  const handleDuplicateTopic = useCallback(() => {
    onDuplicateTopic(topic);
  }, [onDuplicateTopic, topic]);

  const handleAddSubtopic = useCallback(() => {
    onAddSubtopic(topic.id);
  }, [onAddSubtopic, topic.id]);

  const handleDeleteTopic = useCallback(() => {
    onDeleteTopic(topic.id);
  }, [onDeleteTopic, topic.id]);

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {hasContentIssues && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFixContent}
          className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700"
          title="Corrigir formatação"
          type="button"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePreviewTopic}
        className="h-8 w-8 p-0"
        title="Visualizar conteúdo"
        type="button"
      >
        <Eye className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleStartEdit}
        className="h-8 w-8 p-0"
        title="Editar título"
        type="button"
      >
        <Edit2 className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDuplicateTopic}
        className="h-8 w-8 p-0"
        title="Duplicar tópico"
        type="button"
      >
        <Copy className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleAddSubtopic}
        className="h-8 w-8 p-0"
        title="Adicionar subtópico"
        type="button"
      >
        <Plus className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDeleteTopic}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
        title="Excluir tópico"
        type="button"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
});

TopicActionButtons.displayName = 'TopicActionButtons';
