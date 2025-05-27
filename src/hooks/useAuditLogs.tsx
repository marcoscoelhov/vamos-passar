
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AuditLog {
  id: string;
  admin_id: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  old_data: any;
  new_data: any;
  created_at: string;
  admin_name?: string;
}

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterTable, setFilterTable] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 20;

  const fetchLogs = async (page = 1, table = 'all', action = 'all') => {
    setIsLoading(true);
    try {
      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('admin_logs')
        .select('*', { count: 'exact' })
        .range(start, end)
        .order('created_at', { ascending: false });

      if (table && table !== 'all') {
        query = query.eq('table_name', table);
      }

      if (action && action !== 'all') {
        query = query.eq('action', action);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Buscar nomes dos administradores
      const logsWithAdminNames = await Promise.all(
        (data || []).map(async (log) => {
          if (log.admin_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', log.admin_id)
              .single();

            return {
              ...log,
              admin_name: profileData?.name || 'Admin desconhecido',
            };
          }
          return { ...log, admin_name: 'Sistema' };
        })
      );

      setLogs(logsWithAdminNames);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Erro ao carregar logs',
        description: 'Não foi possível carregar os logs de auditoria.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage, filterTable, filterAction);
  }, [currentPage, filterTable, filterAction]);

  return {
    logs,
    isLoading,
    currentPage,
    setCurrentPage,
    totalPages,
    filterTable,
    setFilterTable,
    filterAction,
    setFilterAction,
    refreshLogs: () => fetchLogs(currentPage, filterTable, filterAction),
  };
}
