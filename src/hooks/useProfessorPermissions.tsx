
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProfessorPermission, ProfessorPermissionType } from '@/types/course';

export function useProfessorPermissions(userId?: string) {
  const [permissions, setPermissions] = useState<ProfessorPermission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchPermissions = async (targetUserId?: string) => {
    if (!targetUserId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('professor_permissions')
        .select('*')
        .eq('professor_id', targetUserId);

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: 'Erro ao carregar permissões',
        description: 'Não foi possível carregar as permissões do professor.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: ProfessorPermissionType): boolean => {
    return permissions.some(p => p.permission_name === permission && p.granted);
  };

  const updatePermission = async (
    professorId: string, 
    permission: ProfessorPermissionType, 
    granted: boolean,
    grantedBy: string
  ) => {
    try {
      const { error } = await supabase
        .from('professor_permissions')
        .upsert({
          professor_id: professorId,
          permission_name: permission,
          granted,
          granted_by: grantedBy,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Permissão atualizada',
        description: `Permissão ${granted ? 'concedida' : 'revogada'} com sucesso.`,
      });

      fetchPermissions(professorId);
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: 'Erro ao atualizar permissão',
        description: 'Não foi possível atualizar a permissão.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPermissions(userId);
    }
  }, [userId]);

  return {
    permissions,
    isLoading,
    hasPermission,
    updatePermission,
    refreshPermissions: () => fetchPermissions(userId),
  };
}
