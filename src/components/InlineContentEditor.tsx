
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Save, X, Eye } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { useTopicOperations } from '@/hooks/useTopicOperations';
import { useCourse } from '@/contexts/CourseContext';

interface InlineContentEditorProps {
  topicId: string;
  content: string;
  isAdmin: boolean;
  onContentUpdated: (newContent: string) => void;
}

export function InlineContentEditor({ 
  topicId, 
  content, 
  isAdmin, 
  onContentUpdated 
}: InlineContentEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { updateTopicContent, isLoading } = useTopicOperations();
  const { refreshCurrentTopic } = useCourse();

  const handleStartEdit = useCallback(() => {
    setEditedContent(content);
    setIsEditing(true);
    setHasUnsavedChanges(false);
  }, [content]);

  const handleContentChange = useCallback((newContent: string) => {
    setEditedContent(newContent);
    setHasUnsavedChanges(newContent !== content);
  }, [content]);

  const handleSave = useCallback(async () => {
    if (!hasUnsavedChanges) {
      setIsEditing(false);
      return;
    }

    const success = await updateTopicContent(topicId, editedContent);
    if (success) {
      onContentUpdated(editedContent);
      setIsEditing(false);
      setHasUnsavedChanges(false);
      // Refresh the topic in context to update other components
      if (refreshCurrentTopic) {
        refreshCurrentTopic();
      }
    }
  }, [topicId, editedContent, hasUnsavedChanges, updateTopicContent, onContentUpdated, refreshCurrentTopic]);

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmDiscard = window.confirm(
        'Você tem alterações não salvas. Tem certeza que deseja descartá-las?'
      );
      if (!confirmDiscard) return;
    }
    setEditedContent(content);
    setIsEditing(false);
    setHasUnsavedChanges(false);
  }, [content, hasUnsavedChanges]);

  if (!isAdmin) {
    return null;
  }

  if (!isEditing) {
    return (
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleStartEdit}
          className="flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Editar Conteúdo
        </Button>
      </div>
    );
  }

  return (
    <Card className="p-6 mb-6 border-2 border-blue-200 bg-blue-50/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Edit className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">
            Editando Conteúdo do Tópico
          </h3>
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 font-medium">
              • Alterações não salvas
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(false)}
            disabled={isLoading}
          >
            <Eye className="w-4 h-4 mr-1" />
            Visualizar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !hasUnsavedChanges}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-1" />
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-1" />
            Cancelar
          </Button>
        </div>
      </div>

      <div className="min-h-[400px]">
        <RichTextEditor
          value={editedContent}
          onChange={handleContentChange}
          placeholder="Digite o conteúdo do tópico..."
          showValidation={true}
        />
      </div>

      {hasUnsavedChanges && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded text-sm">
          <p className="text-orange-800">
            <strong>Atenção:</strong> Você tem alterações não salvas. 
            Clique em "Salvar" para manter suas alterações ou "Cancelar" para descartá-las.
          </p>
        </div>
      )}
    </Card>
  );
}
