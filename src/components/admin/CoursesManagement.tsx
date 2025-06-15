
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { CourseCategory, CourseListItem, CourseEnrollment } from '@/types/course';
import { CourseFormDialog } from './CourseFormDialog';
import { CourseStatsCards } from './CourseStatsCards';
import { CourseFilters } from './CourseFilters';
import { CourseGrid } from './CourseGrid';
import { EmptyCourseState } from './EmptyCourseState';
import { CourseCardSkeleton } from './CourseCardSkeleton';

export function CoursesManagement() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
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

  const handleCourseCreated = () => {
    fetchData();
    setIsCreateDialogOpen(false);
  };

  const hasFilters = Boolean(searchTerm) || selectedCategory !== 'all' || selectedStatus !== 'all';

  // Converter CourseListItem para Course para as estatísticas
  const coursesForStats = courses.map(course => ({
    ...course,
    description: course.description || '',
    topics: [],
    progress: 0
  }));

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg p-6 border">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-6 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <CourseStatsCards courses={coursesForStats} enrollments={enrollments} />
      )}
      
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
      <CourseFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        categories={categories}
      />

      {/* Grid de Cursos ou Estado Vazio */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <EmptyCourseState 
          hasFilters={hasFilters}
          onCreateCourse={() => setIsCreateDialogOpen(true)}
        />
      ) : (
        <CourseGrid 
          courses={filteredCourses} 
          enrollments={enrollments}
          categories={categories}
          onCourseUpdated={fetchData}
        />
      )}
    </div>
  );
}
