
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronRight, 
  GripVertical,
  FileText,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Topic } from '@/types/course';
import { validateHtmlContent } from '@/utils/contentSanitizer';
import { TopicActionButtons } from './TopicActionButtons';
import { cn } from '@/lib/utils';

interface SortableTopicItemProps {
  topic: Topic;
  level: number;
  isExpanded: boolean;
  isEditing: boolean;
  editTitle: string;
  isSaving: boolean;
  onToggleExpand: (topicId: string) => void;
  onStartEdit: (topicId: string, title: string) => void;
  onSaveEdit: (topicId: string, newTitle: string) => void;
  onCancelEdit: () => void;
  onSetEditTitle: (title: string) => void;
  onDeleteTopic: (topicId: string) => void;
  onAddSubtopic: (parentId: string) => void;
  onPreviewTopic: (topic: Topic) => void;
  onDuplicateTopic: (topic: Topic) => void;
  onFixContent: (topic: Topic) => void;
  children?: React.ReactNode;
}

export const SortableTopicItem: React.FC<SortableTopicItemProps> = ({
  topic,
  level,
  isExpanded,
  isEditing,
  editTitle,
  isSaving,
  onToggleExpand,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onSetEditTitle,
  onDeleteTopic,
  onAddSubtopic,
  onPreviewTopic,
  onDuplicateTopic,
  onFixContent,
  children
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasChildren = topic.children && topic.children.length > 0;
  const indent = level * 24;

  // Validar se o conteúdo tem problemas
  const contentValidation = validateHtmlContent(topic.content);
  const hasContentIssues = !contentValidation.isValid;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSaveEdit(topic.id, editTitle);
    } else if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

  const handleConfirmEdit = () => {
    if (editTitle.trim()) {
      onSaveEdit(topic.id, editTitle.trim());
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "select-none",
        isDragging && "opacity-50 z-50"
      )}
    >
      <div 
        className={cn(
          "group flex items-center gap-2 p-3 rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all",
          "min-h-[60px]",
          hasContentIssues && "border-yellow-200 bg-yellow-50",
          isEditing && "border-blue-200 bg-blue-50"
        )}
        style={{ paddingLeft: `${16 + indent}px` }}
      >
        {/* Drag Handle */}
        {!isEditing && (
          <div 
            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
        )}

        {isEditing && <div className="w-4" />}

        {/* Expand/Collapse */}
        {hasChildren && !isEditing && (
          <button
            onClick={() => onToggleExpand(topic.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
        
        {(!hasChildren || isEditing) && <div className="w-4" />}

        {/* Icon */}
        <FileText className={cn(
          "w-5 h-5 flex-shrink-0",
          hasContentIssues ? "text-yellow-600" : "text-blue-600"
        )} />

        {/* Title or Edit Form */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editTitle}
                onChange={(e) => onSetEditTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                className="h-8 text-sm flex-1"
                autoFocus
                disabled={isSaving}
                placeholder="Digite o título do tópico..."
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleConfirmEdit}
                disabled={isSaving || !editTitle.trim()}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                title="Confirmar alteração"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancelEdit}
                disabled={isSaving}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Cancelar edição"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span 
                className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors truncate"
                onClick={() => onStartEdit(topic.id, topic.title)}
              >
                {topic.title}
              </span>
              <Badge variant="secondary" className="text-xs">
                Nível {topic.level}
              </Badge>
              {topic.questions && topic.questions.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {topic.questions.length} questão(ões)
                </Badge>
              )}
              {hasContentIssues && (
                <Badge variant="destructive" className="text-xs">
                  Formato incorreto
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <TopicActionButtons
            topic={topic}
            hasContentIssues={hasContentIssues}
            onFixContent={onFixContent}
            onPreviewTopic={onPreviewTopic}
            onStartEdit={onStartEdit}
            onDuplicateTopic={onDuplicateTopic}
            onAddSubtopic={onAddSubtopic}
            onDeleteTopic={onDeleteTopic}
          />
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && !isEditing && (
        <div className="mt-1">
          {children}
        </div>
      )}
    </div>
  );
};
