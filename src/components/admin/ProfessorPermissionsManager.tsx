
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Shield, UserPlus, Search, Check, X } from 'lucide-react';
import { Course } from '@/types/course';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfessorPermissionsManagerProps {
  course: Course;
  isAdmin: boolean;
}

interface Professor {
  id: string;
  name: string;
  email: string;
  permissions: Permission[];
}

interface Permission {
  id: string;
  permission_name: string;
  granted: boolean;
  granted_by: string;
  created_at: string;
}

const AVAILABLE_PERMISSIONS = [
  { name: 'manage_content', label: 'Gerenciar Conteúdo', description: 'Criar e editar tópicos e questões' },
  { name: 'manage_students', label: 'Gerenciar Estudantes', description: 'Visualizar e gerenciar matrículas' },
  { name: 'view_analytics', label: 'Ver Analytics', description: 'Acessar relatórios e análises' },
  { name: 'export_data', label: 'Exportar Dados', description: 'Baixar relatórios e dados do curso' },
  { name: 'manage_questions', label: 'Gerenciar Questões', description: 'Criar e editar questões' },
];

export function ProfessorPermissionsManager({ course, isAdmin }: ProfessorPermissionsManagerProps) {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [newProfessorEmail, setNewProfessorEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      fetchProfessors();
    }
  }, [isAdmin]);

  const fetchProfessors = async () => {
    try {
      setIsLoading(true);
      
      // Buscar professores
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'professor');

      if (profilesError) throw profilesError;

      // Buscar permissões
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('professor_permissions')
        .select('*');

      if (permissionsError) throw permissionsError;

      // Combinar dados
      const professorsWithPermissions = profilesData?.map(prof => ({
        id: prof.id,
        name: prof.name || prof.email,
        email: prof.email,
        permissions: permissionsData?.filter(p => p.professor_id === prof.id) || []
      })) || [];

      setProfessors(professorsWithPermissions);
    } catch (error) {
      console.error('Error fetching professors:', error);
      toast({
        title: 'Erro ao carregar professores',
        description: 'Não foi possível carregar a lista de professores.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addProfessor = async () => {
    if (!newProfessorEmail.trim()) return;

    try {
      // Verificar se o usuário existe
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', newProfessorEmail.trim())
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      if (!existingUser) {
        toast({
          title: 'Usuário não encontrado',
          description: 'Não existe um usuário com este email.',
          variant: 'destructive',
        });
        return;
      }

      // Atualizar role para professor
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'professor' })
        .eq('id', existingUser.id);

      if (updateError) throw updateError;

      // Adicionar permissões básicas
      const basicPermissions = ['view_analytics', 'manage_content'];
      for (const permission of basicPermissions) {
        await supabase
          .from('professor_permissions')
          .insert({
            professor_id: existingUser.id,
            permission_name: permission,
            granted: true,
            granted_by: (await supabase.auth.getUser()).data.user?.id
          });
      }

      setNewProfessorEmail('');
      fetchProfessors();
      
      toast({
        title: 'Professor adicionado',
        description: 'O professor foi adicionado com permissões básicas.',
      });
    } catch (error) {
      console.error('Error adding professor:', error);
      toast({
        title: 'Erro ao adicionar professor',
        description: 'Não foi possível adicionar o professor.',
        variant: 'destructive',
      });
    }
  };

  const togglePermission = async (professorId: string, permissionName: string, granted: boolean) => {
    try {
      const existingPermission = professors
        .find(p => p.id === professorId)
        ?.permissions.find(perm => perm.permission_name === permissionName);

      if (existingPermission) {
        // Atualizar permissão existente
        const { error } = await supabase
          .from('professor_permissions')
          .update({ granted, updated_at: new Date().toISOString() })
          .eq('id', existingPermission.id);

        if (error) throw error;
      } else {
        // Criar nova permissão
        const { error } = await supabase
          .from('professor_permissions')
          .insert({
            professor_id: professorId,
            permission_name: permissionName,
            granted,
            granted_by: (await supabase.auth.getUser()).data.user?.id
          });

        if (error) throw error;
      }

      fetchProfessors();
      
      toast({
        title: granted ? 'Permissão concedida' : 'Permissão revogada',
        description: `A permissão foi ${granted ? 'concedida' : 'revogada'} com sucesso.`,
      });
    } catch (error) {
      console.error('Error toggling permission:', error);
      toast({
        title: 'Erro ao alterar permissão',
        description: 'Não foi possível alterar a permissão.',
        variant: 'destructive',
      });
    }
  };

  const filteredProfessors = professors.filter(prof =>
    prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Acesso Negado
        </h3>
        <p className="text-gray-600">
          Apenas administradores podem gerenciar permissões.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Permissões</h2>
        <p className="text-gray-600 mt-1">Controle as permissões dos professores no sistema</p>
      </div>

      {/* Adicionar Professor */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Adicionar Novo Professor</h3>
        <div className="flex gap-3">
          <Input
            placeholder="Email do professor"
            value={newProfessorEmail}
            onChange={(e) => setNewProfessorEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addProfessor()}
          />
          <Button onClick={addProfessor} className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Adicionar
          </Button>
        </div>
      </Card>

      {/* Busca */}
      <Card className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar professores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Lista de Professores */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="w-32 h-4 bg-gray-200 rounded"></div>
                <div className="w-48 h-3 bg-gray-200 rounded"></div>
                <div className="flex gap-2">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="w-20 h-6 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProfessors.map(professor => (
            <Card key={professor.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{professor.name}</h3>
                  <p className="text-sm text-gray-600">{professor.email}</p>
                </div>
                <Badge variant="outline">Professor</Badge>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Permissões</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AVAILABLE_PERMISSIONS.map(permission => {
                    const hasPermission = professor.permissions.find(
                      p => p.permission_name === permission.name && p.granted
                    );

                    return (
                      <div key={permission.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{permission.label}</div>
                          <div className="text-xs text-gray-600">{permission.description}</div>
                        </div>
                        <Switch
                          checked={!!hasPermission}
                          onCheckedChange={(checked) => 
                            togglePermission(professor.id, permission.name, checked)
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}

          {filteredProfessors.length === 0 && (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum professor encontrado
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Tente alterar os termos de busca.' : 'Adicione professores para gerenciar suas permissões.'}
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
