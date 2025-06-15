
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  DollarSign,
  Clock,
  Star,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { CourseCategory, Course, CourseEnrollment } from '@/types/course';
import { CourseFormDialog } from './CourseFormDialog';
import { CourseStatsCards } from './CourseStatsCards';

export function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Buscar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('course_categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Buscar cursos
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          course_categories(name, color),
          profiles!instructor_id(name)
        `)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

      // Buscar matrículas para estatísticas
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select('*');

      if (enrollmentsError) throw enrollmentsError;
      setEnrollments(enrollmentsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os cursos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category_id === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || course.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

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

  const getCourseEnrollmentCount = (courseId: string) => {
    return enrollments.filter(e => e.course_id === courseId && e.enrollment_status === 'ativo').length;
  };

  const handleCourseCreated = () => {
    fetchData();
    setIsCreateDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <CourseStatsCards courses={courses} enrollments={enrollments} />
      
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gerenciamento de Cursos</h2>
          <p className="text-slate-600 mt-1">
            Gerencie todos os seus cursos em um só lugar
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Plus className="w-4 h-4 mr-2" />
              Novo Curso
            </Button>
          </DialogTrigger>
          <CourseFormDialog 
            categories={categories}
            onSuccess={handleCourseCreated}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </Dialog>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="pausado">Pausado</SelectItem>
              <SelectItem value="encerrado">Encerrado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Grid de Cursos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
                    {getCourseEnrollmentCount(course.id)}
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
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-slate-400 text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Nenhum curso encontrado
          </h3>
          <p className="text-slate-600 mb-4">
            {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'Tente ajustar os filtros para encontrar cursos.'
              : 'Comece criando seu primeiro curso.'
            }
          </p>
          {!searchTerm && selectedCategory === 'all' && selectedStatus === 'all' && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Curso
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
