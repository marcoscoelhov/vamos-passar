
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export interface Student {
  id: string;
  name: string | null;
  email: string | null;
  is_admin: boolean | null;
  created_at: string;
  progress_count: number;
  total_topics: number;
  last_activity: string | null;
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 10;

  const fetchStudents = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          is_admin,
          created_at
        `, { count: 'exact' })
        .range(start, end)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Buscar progresso dos estudantes
      const studentsWithProgress = await Promise.all(
        (data || []).map(async (student) => {
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('completed')
            .eq('user_id', student.id);

          const { data: topicsData } = await supabase
            .from('topics')
            .select('id');

          const { data: activityData } = await supabase
            .from('user_progress')
            .select('updated_at')
            .eq('user_id', student.id)
            .order('updated_at', { ascending: false })
            .limit(1);

          return {
            ...student,
            progress_count: progressData?.filter(p => p.completed).length || 0,
            total_topics: topicsData?.length || 0,
            last_activity: activityData?.[0]?.updated_at || null,
          };
        })
      );

      setStudents(studentsWithProgress);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      logger.error('Error fetching students', { page, search, error });
      toast({
        title: 'Erro ao carregar estudantes',
        description: 'Não foi possível carregar a lista de estudantes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Permissões atualizadas',
        description: `Usuário ${!currentStatus ? 'promovido a' : 'removido de'} administrador.`,
      });

      fetchStudents(currentPage, searchTerm);
    } catch (error) {
      logger.error('Error updating admin status', { userId, currentStatus, error });
      toast({
        title: 'Erro ao atualizar permissões',
        description: 'Não foi possível atualizar as permissões do usuário.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchStudents(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  return {
    students,
    isLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    toggleAdminStatus,
    refreshStudents: () => fetchStudents(currentPage, searchTerm),
  };
}
