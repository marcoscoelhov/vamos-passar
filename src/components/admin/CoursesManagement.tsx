
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { CourseCategory, CourseListItem, CourseEnrollment } from '@/types/course';
import { CourseFormDialog } from './CourseFormDialog';
import { CourseStatsCards } from './CourseStatsCards';
import { AdvancedCourseFilters } from './AdvancedCourseFilters';
import { CourseGrid } from './CourseGrid';
import { EmptyCourseState } from './EmptyCourseState';
import { CourseCardSkeleton } from './CourseCardSkeleton';
import { CoursePagination } from './CoursePagination';
import { BulkCourseActions } from './BulkCourseActions';

const COURSES_PER_PAGE = 9;

export function CoursesManagement() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
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
    const coursePrice = course.discount_price || course.price || 0;
    const matchesPrice = coursePrice >= priceRange[0] && coursePrice <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPrice;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'price':
        aValue = a.discount_price || a.price || 0;
        bValue = b.discount_price || b.price || 0;
        break;
      case 'duration_hours':
        aValue = a.duration_hours || 0;
        bValue = b.duration_hours || 0;
        break;
      case 'enrollments':
        aValue = enrollments.filter(e => e.course_id === a.id && e.enrollment_status === 'ativo').length;
        bValue = enrollments.filter(e => e.course_id === b.id && e.enrollment_status === 'ativo').length;
        break;
      default:
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedCourses.length / COURSES_PER_PAGE);
  const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
  const paginatedCourses = sortedCourses.slice(startIndex, startIndex + COURSES_PER_PAGE);

  const handleCourseCreated = () => {
    fetchData();
    setIsCreateDialogOpen(false);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setPriceRange([0, 10000]);
    setCurrentPage(1);
  };

  const hasFilters = Boolean(searchTerm) || selectedCategory !== 'all' || selectedStatus !== 'all' || priceRange[0] > 0 || priceRange[1] < 10000;

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

      {/* Filtros Avançados */}
      <AdvancedCourseFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        categories={categories}
        onClearFilters={handleClearFilters}
      />

      {/* Ações em Lote */}
      <BulkCourseActions
        courses={paginatedCourses}
        selectedCourses={selectedCourses}
        onSelectedCoursesChange={setSelectedCourses}
        onCoursesUpdated={fetchData}
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
        <>
          <CourseGrid 
            courses={paginatedCourses} 
            enrollments={enrollments}
            categories={categories}
            onCourseUpdated={fetchData}
          />
          
          {/* Paginação */}
          <CoursePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
