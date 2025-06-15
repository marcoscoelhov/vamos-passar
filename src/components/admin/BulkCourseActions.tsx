
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Eye, CheckSquare, Square } from 'lucide-react';
import { CourseListItem } from '@/types/course';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog } from './ConfirmationDialog';

interface BulkCourseActionsProps {
  courses: CourseListItem[];
  selectedCourses: string[];
  onSelectedCoursesChange: (courseIds: string[]) => void;
  onCoursesUpdated: () => void;
}

export function BulkCourseActions({ 
  courses, 
  selectedCourses, 
  onSelectedCoursesChange, 
  onCoursesUpdated 
}: BulkCourseActionsProps) {
  const [bulkAction, setBulkAction] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const allSelected = selectedCourses.length === courses.length && courses.length > 0;
  const someSelected = selectedCourses.length > 0 && selectedCourses.length < courses.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectedCoursesChange([]);
    } else {
      onSelectedCoursesChange(courses.map(course => course.id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedCourses.length === 0) return;

    setIsProcessing(true);
    try {
      switch (bulkAction) {
        case 'delete':
          await supabase
            .from('courses')
            .delete()
            .in('id', selectedCourses);
          
          toast({
            title: 'Cursos excluídos',
            description: `${selectedCourses.length} curso(s) foram excluídos com sucesso.`,
          });
          break;

        case 'activate':
          await supabase
            .from('courses')
            .update({ status: 'ativo' })
            .in('id', selectedCourses);
          
          toast({
            title: 'Cursos ativados',
            description: `${selectedCourses.length} curso(s) foram ativados com sucesso.`,
          });
          break;

        case 'pause':
          await supabase
            .from('courses')
            .update({ status: 'pausado' })
            .in('id', selectedCourses);
          
          toast({
            title: 'Cursos pausados',
            description: `${selectedCourses.length} curso(s) foram pausados com sucesso.`,
          });
          break;

        case 'draft':
          await supabase
            .from('courses')
            .update({ status: 'rascunho' })
            .in('id', selectedCourses);
          
          toast({
            title: 'Cursos movidos para rascunho',
            description: `${selectedCourses.length} curso(s) foram movidos para rascunho.`,
          });
          break;
      }

      onSelectedCoursesChange([]);
      setBulkAction('');
      onCoursesUpdated();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast({
        title: 'Erro na ação em lote',
        description: 'Não foi possível executar a ação selecionada.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(false);
    }
  };

  const getBulkActionText = () => {
    switch (bulkAction) {
      case 'delete': return 'Excluir cursos selecionados';
      case 'activate': return 'Ativar cursos selecionados';
      case 'pause': return 'Pausar cursos selecionados';
      case 'draft': return 'Mover para rascunho';
      default: return 'Confirmar ação';
    }
  };

  if (courses.length === 0) return null;

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                ref={(ref) => {
                  if (ref) ref.indeterminate = someSelected;
                }}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedCourses.length > 0 
                  ? `${selectedCourses.length} curso(s) selecionado(s)`
                  : 'Selecionar todos'
                }
              </span>
            </div>

            {selectedCourses.length > 0 && (
              <Badge variant="secondary">
                {selectedCourses.length} de {courses.length}
              </Badge>
            )}
          </div>

          {selectedCourses.length > 0 && (
            <div className="flex items-center gap-2">
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Ação em lote" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">Ativar cursos</SelectItem>
                  <SelectItem value="pause">Pausar cursos</SelectItem>
                  <SelectItem value="draft">Mover para rascunho</SelectItem>
                  <SelectItem value="delete">Excluir cursos</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => setShowConfirmDialog(true)}
                disabled={!bulkAction || isProcessing}
                variant={bulkAction === 'delete' ? 'destructive' : 'default'}
                size="sm"
              >
                Executar
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectedCoursesChange([])}
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </Card>

      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={getBulkActionText()}
        description={`Esta ação será aplicada a ${selectedCourses.length} curso(s). ${
          bulkAction === 'delete' ? 'Esta ação não pode ser desfeita.' : ''
        }`}
        onConfirm={handleBulkAction}
        variant={bulkAction === 'delete' ? 'destructive' : 'default'}
      />
    </>
  );
}
