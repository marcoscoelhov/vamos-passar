
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreVertical, 
  Edit, 
  Eye, 
  Users, 
  Clock,
  Star
} from 'lucide-react';
import { CourseListItem, CourseEnrollment } from '@/types/course';

interface CourseCardProps {
  course: CourseListItem;
  enrollmentCount: number;
}

export function CourseCard({ course, enrollmentCount }: CourseCardProps) {
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

  return (
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
          <Button variant="ghost" size="sm" className="ml-2">
            <MoreVertical className="w-4 h-4" />
          </Button>
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
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="w-4 h-4 mr-2" />
            Visualizar
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>
    </Card>
  );
}
