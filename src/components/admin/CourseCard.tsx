
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourseListItem, CourseCategory } from '@/types/course';
import { Eye, Edit, Trash2, Users, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog } from '@/components/ui/dialog';
import { CourseFormDialog } from './CourseFormDialog';
import { ConfirmationDialog } from './ConfirmationDialog';

interface CourseCardProps {
  course: CourseListItem;
  enrollmentCount: number;
  categories: CourseCategory[];
  onCourseUpdated: () => void;
}

export function CourseCard({ course, enrollmentCount, categories, onCourseUpdated }: CourseCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'rascunho': return 'bg-gray-100 text-gray-800';
      case 'pausado': return 'bg-yellow-100 text-yellow-800';
      case 'encerrado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = () => {
    if (course.course_categories?.color) {
      return course.course_categories.color;
    }
    return '#3B82F6';
  };

  const handleView = () => {
    navigate(`/admin/courses/${course.id}`);
  };

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', course.id);

      if (error) throw error;

      toast({
        title: 'Curso excluído',
        description: 'O curso foi removido com sucesso.',
      });

      onCourseUpdated();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o curso.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const displayPrice = course.discount_price || course.price || 0;

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 border border-slate-200 hover:border-slate-300">
        {/* Course Image */}
        <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
          {course.thumbnail_url ? (
            <img 
              src={course.thumbnail_url} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-slate-400 text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-slate-300 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <p className="text-sm">Sem imagem</p>
              </div>
            </div>
          )}
          
          {/* Category badge */}
          {course.course_categories && (
            <div className="absolute top-3 left-3">
              <Badge 
                className="text-white"
                style={{ backgroundColor: getCategoryColor() }}
              >
                {course.course_categories.name}
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
              {course.title}
            </CardTitle>
            <Badge className={getStatusColor(course.status || 'rascunho')}>
              {course.status?.toUpperCase() || 'RASCUNHO'}
            </Badge>
          </div>
          
          {course.description && (
            <p className="text-slate-600 text-sm line-clamp-2 mt-2">
              {course.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          {/* Course Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-slate-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center text-blue-600 mb-1">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-600">Alunos</p>
              <p className="font-semibold text-sm">{enrollmentCount}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center text-green-600 mb-1">
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-600">Duração</p>
              <p className="font-semibold text-sm">{course.duration_hours || 0}h</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center text-purple-600 mb-1">
                <DollarSign className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-600">Preço</p>
              <p className="font-semibold text-sm">
                R$ {displayPrice.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleView}
              className="flex-1 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Visualizar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <CourseFormDialog
          categories={categories}
          course={course}
          onSuccess={() => {
            setShowEditDialog(false);
            onCourseUpdated();
          }}
          onCancel={() => setShowEditDialog(false)}
        />
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir Curso"
        description={`Tem certeza que deseja excluir o curso "${course.title}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  );
}
