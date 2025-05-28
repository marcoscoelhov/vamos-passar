import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Edit2, 
  Trash2, 
  GripVertical,
  FileText,
  Eye,
  Copy,
  Loader2,
  RefreshCw,
  Check,
  X
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
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Topic, Course } from '@/types/course';
import { useTopics } from '@/hooks/useTopics';
import { useTopicHierarchy } from '@/hooks/useTopicHierarchy';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { sanitizeHtmlContent, validateHtmlContent } from '@/utils/contentSanitizer';
import { cn } from '@/lib/utils';

interface TopicHierarchyManagerProps {
  course: Course;
  isAdmin: boolean;
  onTopicUpdated: () => void;
}

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

const SortableTopicItem: React.FC<SortableTopicItemProps> = ({
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

export function TopicHierarchyManager({ course, isAdmin, onTopicUpdated }: TopicHierarchyManagerProps) {
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteTopicId, setDeleteTopicId] = useState<string | null>(null);
  const [previewTopic, setPreviewTopic] = useState<Topic | null>(null);
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicParent, setNewTopicParent] = useState<string | null>(null);
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

  const startEdit = useCallback((topicId: string, title: string) => {
    console.log('Iniciando edição do tópico:', { topicId, title });
    setEditingTopic(topicId);
    setEditTitle(title);
  }, []);

  const saveEdit = useCallback(async (topicId: string, newTitle: string) => {
    console.log('Tentando salvar edição:', { topicId, newTitle, editTitle });
    
    const trimmedNewTitle = newTitle.trim();
    const currentTopic = course.topics.find(t => t.id === topicId);
    const currentTitle = currentTopic?.title?.trim() || '';
    
    console.log('Comparando títulos:', { 
      currentTitle, 
      trimmedNewTitle, 
      isEqual: currentTitle === trimmedNewTitle 
    });

    // Se o título não mudou ou está vazio, apenas cancela a edição
    if (!trimmedNewTitle || currentTitle === trimmedNewTitle) {
      console.log('Título não mudou ou está vazio, cancelando edição');
      setEditingTopic(null);
      setEditTitle('');
      return;
    }

    setIsSavingEdit(true);
    console.log('Iniciando atualização do título...');
    
    try {
      const success = await updateTopicTitle(topicId, trimmedNewTitle);
      console.log('Resultado da atualização:', success);
      
      if (success) {
        console.log('Título atualizado com sucesso');
        onTopicUpdated();
        setEditingTopic(null);
        setEditTitle('');
      } else {
        console.error('Falha ao atualizar título');
      }
    } catch (error) {
      console.error('Erro durante a atualização:', error);
    } finally {
      setIsSavingEdit(false);
      console.log('Estado de loading resetado');
    }
  }, [updateTopicTitle, onTopicUpdated, course.topics]);

  const cancelEdit = useCallback(() => {
    console.log('Cancelando edição');
    setEditingTopic(null);
    setEditTitle('');
    setIsSavingEdit(false);
  }, []);

  const handleDeleteTopic = useCallback((topicId: string) => {
    setDeleteTopicId(topicId);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteTopicId) {
      const success = await deleteTopic(deleteTopicId);
      if (success) {
        onTopicUpdated();
      }
      setDeleteTopicId(null);
    }
  }, [deleteTopicId, deleteTopic, onTopicUpdated]);

  const handleAddSubtopic = useCallback((parentId: string) => {
    setNewTopicParent(parentId);
    setShowNewTopicForm(true);
  }, []);

  const handleCreateNewTopic = useCallback(async () => {
    if (newTopicTitle.trim()) {
      try {
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
      } catch (error) {
        console.error('Erro ao criar tópico:', error);
      }
    }
  }, [newTopicTitle, newTopicParent, addTopic, course.id, isAdmin, onTopicUpdated]);

  const handleDuplicateTopic = useCallback(async (topic: Topic) => {
    const success = await duplicateTopic(topic, course.id, topic.parentTopicId);
    if (success) {
      onTopicUpdated();
    }
  }, [duplicateTopic, course.id, onTopicUpdated]);

  const handleFixContent = useCallback(async (topic: Topic) => {
    setIsFixingContent(true);
    try {
      const sanitizedContent = sanitizeHtmlContent(topic.content);
      
      // Aqui você implementaria a atualização do conteúdo no banco
      // Por exemplo: await updateTopicContent(topic.id, sanitizedContent);
      
      console.log('Conteúdo original:', topic.content);
      console.log('Conteúdo corrigido:', sanitizedContent);
      
      onTopicUpdated();
    } catch (error) {
      console.error('Erro ao corrigir conteúdo:', error);
    } finally {
      setIsFixingContent(false);
    }
  }, [onTopicUpdated]);

  const renderTopicTree = useCallback((topics: Topic[], level = 0) => {
    const topicIds = topics.map(topic => topic.id);
    
    return (
      <SortableContext items={topicIds} strategy={verticalListSortingStrategy}>
        {topics.map(topic => (
          <SortableTopicItem
            key={topic.id}
            topic={topic}
            level={level}
            isExpanded={expandedTopics.has(topic.id)}
            isEditing={editingTopic === topic.id}
            editTitle={editTitle}
            isSaving={isSavingEdit}
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
          >
            {topic.children && topic.children.length > 0 && 
              renderTopicTree(topic.children, level + 1)
            }
          </SortableTopicItem>
        ))}
      </SortableContext>
    );
  }, [
    expandedTopics, 
    editingTopic, 
    editTitle,
    isSavingEdit,
    toggleExpanded, 
    startEdit, 
    saveEdit, 
    cancelEdit, 
    handleDeleteTopic, 
    handleAddSubtopic, 
    handleDuplicateTopic,
    handleFixContent
  ]);

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

  const isLoading = addingTopic || hierarchyLoading || isFixingContent;

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
                onClick={() => setExpandedTopics(new Set(course.topics.map(t => t.id)))}
                disabled={isLoading}
              >
                Expandir Todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedTopics(new Set())}
                disabled={isLoading}
              >
                Recolher Todos
              </Button>
              <Button
                onClick={() => setShowNewTopicForm(true)}
                size="sm"
                disabled={isLoading}
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
                renderTopicTree(course.topics)
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum tópico encontrado</h4>
                  <p className="text-gray-600 mb-4">Comece criando o primeiro tópico do curso.</p>
                  <Button 
                    onClick={() => setShowNewTopicForm(true)}
                    disabled={isLoading}
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
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">
              {newTopicParent ? 'Criar Subtópico' : 'Criar Novo Tópico'}
            </h4>
            <div className="flex items-center gap-2">
              <Input
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                placeholder="Digite o título do tópico..."
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleCreateNewTopic()}
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={handleCreateNewTopic}
                disabled={isLoading || !newTopicTitle.trim()}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowNewTopicForm(false);
                  setNewTopicTitle('');
                  setNewTopicParent(null);
                }}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        {/* Preview Dialog */}
        {previewTopic && (
          <AlertDialog open={!!previewTopic} onOpenChange={() => setPreviewTopic(null)}>
            <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <AlertDialogHeader>
                <AlertDialogTitle>{previewTopic.title}</AlertDialogTitle>
              </AlertDialogHeader>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: previewTopic.content }}
              />
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setPreviewTopic(null)}>
                  Fechar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteTopicId} onOpenChange={() => setDeleteTopicId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este tópico? Esta ação não pode ser desfeita.
                Se o tópico tiver subtópicos, você precisará excluí-los primeiro.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteTopicId(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Excluir'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </>
  );
}
