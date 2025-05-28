
import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { 
  Plus, 
  GripVertical,
  FileText,
  Loader2
} from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Topic, Course } from '@/types/course';
import { useTopics } from '@/hooks/useTopics';
import { useTopicHierarchy } from '@/hooks/useTopicHierarchy';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { sanitizeHtmlContent } from '@/utils/contentSanitizer';
import { TopicTreeRenderer } from './topic-hierarchy/TopicTreeRenderer';
import { NewTopicForm } from './topic-hierarchy/NewTopicForm';
import { TopicPreviewDialog } from './topic-hierarchy/TopicPreviewDialog';
import { DeleteConfirmationDialog } from './topic-hierarchy/DeleteConfirmationDialog';
import { logger } from '@/utils/logger';

interface TopicHierarchyManagerProps {
  course: Course;
  isAdmin: boolean;
  onTopicUpdated: () => void;
}

export function TopicHierarchyManager({ course, isAdmin, onTopicUpdated }: TopicHierarchyManagerProps) {
  // Estados para UI
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteTopicId, setDeleteTopicId] = useState<string | null>(null);
  const [previewTopic, setPreviewTopic] = useState<Topic | null>(null);
  
  // Estados para novo tópico
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicParent, setNewTopicParent] = useState<string | null>(null);
  
  // Estados de loading
  const [isFixingContent, setIsFixingContent] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const { addTopic, isLoading: addingTopic } = useTopics();
  const { 
    updateTopicTitle, 
    deleteTopic, 
    duplicateTopic,
    reorderTopics,
    moveTopicToParent,
    isLoading: hierarchyLoading 
  } = useTopicHierarchy();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { activeId, isDragging, handleDragStart, handleDragOver, handleDragEnd } = useDragAndDrop({
    topics: course.topics,
    onReorder: reorderTopics,
    onMoveToParent: moveTopicToParent,
  });

  // Função para encontrar um tópico recursivamente (memoizada)
  const findTopicRecursive = useCallback((topics: Topic[], id: string): Topic | null => {
    for (const topic of topics) {
      if (topic.id === id) return topic;
      if (topic.children) {
        const found = findTopicRecursive(topic.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Funções de controle de expansão
  const toggleExpanded = useCallback((topicId: string) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  }, []);

  const expandAll = useCallback(() => {
    const getAllTopicIds = (topics: Topic[]): string[] => {
      return topics.reduce((acc, topic) => {
        acc.push(topic.id);
        if (topic.children) {
          acc.push(...getAllTopicIds(topic.children));
        }
        return acc;
      }, [] as string[]);
    };
    setExpandedTopics(new Set(getAllTopicIds(course.topics)));
    logger.debug('Expanded all topics');
  }, [course.topics]);

  const collapseAll = useCallback(() => {
    setExpandedTopics(new Set());
    logger.debug('Collapsed all topics');
  }, []);

  // Funções de edição
  const startEdit = useCallback((topicId: string, title: string) => {
    setEditingTopic(topicId);
    setEditTitle(title);
    logger.debug('Started editing topic', { topicId, title });
  }, []);

  const saveEdit = useCallback(async (topicId: string, newTitle: string) => {
    if (!newTitle?.trim()) {
      return;
    }

    const trimmedNewTitle = newTitle.trim();
    const currentTopic = findTopicRecursive(course.topics, topicId);
    const currentTitle = currentTopic?.title?.trim() || '';
    
    // Se o título não mudou, apenas cancela a edição
    if (currentTitle === trimmedNewTitle) {
      setEditingTopic(null);
      setEditTitle('');
      return;
    }

    setIsSavingEdit(true);
    
    try {
      logger.debug('Saving topic edit', { topicId, oldTitle: currentTitle, newTitle: trimmedNewTitle });
      const success = await updateTopicTitle(topicId, trimmedNewTitle);
      
      if (success) {
        onTopicUpdated();
        setEditingTopic(null);
        setEditTitle('');
        logger.info('Topic title updated successfully', { topicId, newTitle: trimmedNewTitle });
      }
    } catch (error) {
      logger.error('Error updating topic title', { topicId, error });
    } finally {
      setIsSavingEdit(false);
    }
  }, [updateTopicTitle, onTopicUpdated, course.topics, findTopicRecursive]);

  const cancelEdit = useCallback(() => {
    setEditingTopic(null);
    setEditTitle('');
    setIsSavingEdit(false);
    logger.debug('Cancelled topic edit');
  }, []);

  // Funções de gerenciamento de tópicos
  const handleDeleteTopic = useCallback((topicId: string) => {
    setDeleteTopicId(topicId);
    logger.debug('Initiated topic deletion', { topicId });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteTopicId) {
      logger.debug('Confirming topic deletion', { topicId: deleteTopicId });
      const success = await deleteTopic(deleteTopicId);
      if (success) {
        onTopicUpdated();
        logger.info('Topic deleted successfully', { topicId: deleteTopicId });
      }
      setDeleteTopicId(null);
    }
  }, [deleteTopicId, deleteTopic, onTopicUpdated]);

  const handleAddSubtopic = useCallback((parentId: string) => {
    setNewTopicParent(parentId);
    setShowNewTopicForm(true);
    logger.debug('Adding subtopic', { parentId });
  }, []);

  const handleCreateNewTopic = useCallback(async () => {
    if (!newTopicTitle.trim()) {
      return;
    }

    try {
      logger.debug('Creating new topic', { title: newTopicTitle, parentId: newTopicParent });
      await addTopic(
        course.id,
        { title: newTopicTitle.trim(), content: '<p>Conteúdo do novo tópico...</p>' },
        isAdmin,
        newTopicParent || undefined
      );
      setNewTopicTitle('');
      setNewTopicParent(null);
      setShowNewTopicForm(false);
      onTopicUpdated();
      logger.info('New topic created successfully', { title: newTopicTitle });
    } catch (error) {
      logger.error('Error creating new topic', { title: newTopicTitle, error });
    }
  }, [newTopicTitle, newTopicParent, addTopic, course.id, isAdmin, onTopicUpdated]);

  const handleDuplicateTopic = useCallback(async (topic: Topic) => {
    logger.debug('Duplicating topic', { topicId: topic.id, title: topic.title });
    const success = await duplicateTopic(topic, course.id, topic.parentTopicId);
    if (success) {
      onTopicUpdated();
      logger.info('Topic duplicated successfully', { originalId: topic.id });
    }
  }, [duplicateTopic, course.id, onTopicUpdated]);

  const handleFixContent = useCallback(async (topic: Topic) => {
    setIsFixingContent(true);
    try {
      logger.debug('Fixing topic content', { topicId: topic.id });
      const sanitizedContent = sanitizeHtmlContent(topic.content);
      
      // TODO: Implementar atualização do conteúdo no banco
      logger.debug('Content sanitization completed', { 
        topicId: topic.id,
        originalLength: topic.content.length,
        sanitizedLength: sanitizedContent.length
      });
      
      onTopicUpdated();
    } catch (error) {
      logger.error('Error fixing content', { topicId: topic.id, error });
    } finally {
      setIsFixingContent(false);
    }
  }, [onTopicUpdated]);

  const handleCancelNewTopicForm = useCallback(() => {
    setShowNewTopicForm(false);
    setNewTopicTitle('');
    setNewTopicParent(null);
    logger.debug('Cancelled new topic form');
  }, []);

  // Cálculo de loading otimizado
  const isLoading = useMemo(() => 
    addingTopic || hierarchyLoading || isFixingContent
  , [addingTopic, hierarchyLoading, isFixingContent]);

  // Verificação de admin
  if (!isAdmin) {
    return (
      <>
        <Card className="p-6 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
          <p className="text-gray-600">
            Apenas administradores podem gerenciar a hierarquia de tópicos.
          </p>
        </Card>
        <ScrollToTop />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Gerenciamento Hierárquico de Tópicos</h3>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={expandAll}
                disabled={isLoading}
                type="button"
              >
                Expandir Todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={collapseAll}
                disabled={isLoading}
                type="button"
              >
                Recolher Todos
              </Button>
              <Button
                onClick={() => setShowNewTopicForm(true)}
                size="sm"
                disabled={isLoading}
                type="button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Tópico
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>• Arraste os tópicos pelo ícone de grip para reordená-los</p>
            <p>• Clique no título de um tópico para editá-lo, use os botões para confirmar ou cancelar</p>
            <p>• Use os botões de ação que aparecem ao passar o mouse sobre cada tópico</p>
            <p>• Tópicos com formatação incorreta serão destacados em amarelo</p>
          </div>
        </Card>

        {/* Topic Tree with Drag and Drop */}
        <Card className="p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-2">
              {course.topics.length > 0 ? (
                <TopicTreeRenderer
                  topics={course.topics}
                  level={0}
                  expandedTopics={expandedTopics}
                  editingTopic={editingTopic}
                  editTitle={editTitle}
                  isSavingEdit={isSavingEdit}
                  onToggleExpand={toggleExpanded}
                  onStartEdit={startEdit}
                  onSaveEdit={saveEdit}
                  onCancelEdit={cancelEdit}
                  onSetEditTitle={setEditTitle}
                  onDeleteTopic={handleDeleteTopic}
                  onAddSubtopic={handleAddSubtopic}
                  onPreviewTopic={setPreviewTopic}
                  onDuplicateTopic={handleDuplicateTopic}
                  onFixContent={handleFixContent}
                />
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum tópico encontrado</h4>
                  <p className="text-gray-600 mb-4">Comece criando o primeiro tópico do curso.</p>
                  <Button 
                    onClick={() => setShowNewTopicForm(true)}
                    disabled={isLoading}
                    type="button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Tópico
                  </Button>
                </div>
              )}
            </div>

            <DragOverlay>
              {activeId ? (
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg opacity-90">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">
                      Movendo tópico...
                    </span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </Card>

        {/* New Topic Form */}
        {showNewTopicForm && (
          <NewTopicForm
            newTopicTitle={newTopicTitle}
            newTopicParent={newTopicParent}
            isLoading={isLoading}
            onTitleChange={setNewTopicTitle}
            onCreate={handleCreateNewTopic}
            onCancel={handleCancelNewTopicForm}
          />
        )}

        {/* Preview Dialog */}
        <TopicPreviewDialog
          topic={previewTopic}
          onClose={() => setPreviewTopic(null)}
        />

        {/* Delete Confirmation */}
        <DeleteConfirmationDialog
          topicId={deleteTopicId}
          isLoading={isLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTopicId(null)}
        />
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </>
  );
}
