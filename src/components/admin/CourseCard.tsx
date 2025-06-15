
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreVertical, 
  Edit, 
  Eye, 
  Users, 
  Clock,
  Star,
  Trash2
} from 'lucide-react';
import { CourseListItem } from '@/types/course';
import { ConfirmationDialog } from './ConfirmationDialog';
import { CourseFormDialog } from './CourseFormDialog';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLoadingStates } from '@/hooks/useLoadingStates';

interface CourseCardProps {
  course: CourseListItem;
  enrollmentCount: number;
  categories: any[];
  onCourseUpdated: () => void;
}

export function CourseCard({ course, enrollmentCount, categories, onCourseUpdated }: CourseCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();
  const { isLoading, setLoading } = useLoadingStates();

  const getStatusBadge = (status?: string) => {
    const statusConfig = {
      rascunho: { label: 'Rascunho', variant: 'secondary' as const },
      ativo: { label: 'Ativo', variant: 'default' as const },
      pausado: { label: 'Pausado', variant: 'outline' as const },
      encerrado: { label: 'Encerrado', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.rascunho;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleView = () => {
    // Navegar para visualizar o curso (implementar depois)
    toast({
      title: 'Visualizar Curso',
      description: 'Funcionalidade será implementada em breve.',
    });
  };

  const handleDelete = async () => {
    try {
      setLoading('delete', true);
      
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', course.id);

      if (error) throw error;

      toast({
        title: 'Curso excluído',
        description: 'O curso foi excluído com sucesso.',
      });

      onCourseUpdated();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o curso.',
        variant: 'destructive',
      });
    } finally {
      setLoading('delete', false);
    }
  };

  const handleEditSuccess = () => {
    onCourseUpdated();
    setShowEditDialog(false);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Thumbnail */}
        <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 relative">
          {course.thumbnail_url ? (
            <img 
              src={course.thumbnail_url} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-slate-400 text-6xl">📚</div>
            </div>
          )}
          <div className="absolute top-3 right-3">
            {getStatusBadge(course.status)}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-1 line-clamp-2">
                {course.title}
              </h3>
              <p className="text-sm text-slate-600 line-clamp-2">
                {course.description}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-2">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Preço */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {formatPrice(course.discount_price || course.price)}
              </span>
              {course.discount_price && course.price && (
                <span className="text-sm text-slate-500 line-through">
                  {formatPrice(course.price)}
                </span>
              )}
            </div>
            {course.max_installments && course.max_installments > 1 && (
              <p className="text-xs text-slate-600">
                ou {course.max_installments}x de {formatPrice((course.discount_price || course.price || 0) / course.max_installments)}
              </p>
            )}
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-3 mb-4 text-center">
            <div>
              <div className="flex items-center justify-center text-slate-600 mb-1">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-sm font-medium text-slate-900">
                {enrollmentCount}
              </div>
              <div className="text-xs text-slate-600">Alunos</div>
            </div>
            <div>
              <div className="flex items-center justify-center text-slate-600 mb-1">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-sm font-medium text-slate-900">
                {course.duration_hours || 0}h
              </div>
              <div className="text-xs text-slate-600">Duração</div>
            </div>
            <div>
              <div className="flex items-center justify-center text-slate-600 mb-1">
                <Star className="w-4 h-4" />
              </div>
              <div className="text-sm font-medium text-slate-900">4.8</div>
              <div className="text-xs text-slate-600">Avaliação</div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleView}
            >
              <Eye className="w-4 h-4 mr-2" />
              Visualizar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setShowEditDialog(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </Card>

      {/* Dialog de Confirmação para Exclusão */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Excluir Curso"
        description={`Tem certeza que deseja excluir o curso "${course.title}"? Esta ação não pode ser desfeita.`}
        confirmText={isLoading('delete') ? 'Excluindo...' : 'Excluir'}
        variant="destructive"
      />

      {/* Dialog de Edição */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <CourseFormDialog
          categories={categories}
          course={course}
          onSuccess={handleEditSuccess}
          onCancel={() => setShowEditDialog(false)}
        />
      </Dialog>
    </>
  );
}
