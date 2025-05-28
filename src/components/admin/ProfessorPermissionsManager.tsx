
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Settings, BookOpen, BarChart3, Users, TreePine, FileUp } from 'lucide-react';
import { PROFESSOR_PERMISSIONS, ProfessorPermissionType } from '@/types/course';
import { useProfessorPermissions } from '@/hooks/useProfessorPermissions';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProfessorPermissionsManagerProps {
  professorId: string;
  professorName: string;
  currentUserId: string;
}

export function ProfessorPermissionsManager({ 
  professorId, 
  professorName, 
  currentUserId 
}: ProfessorPermissionsManagerProps) {
  const { permissions, isLoading, hasPermission, updatePermission } = useProfessorPermissions(professorId);

  const permissionConfig = [
    {
      key: PROFESSOR_PERMISSIONS.MANAGE_TOPICS,
      label: 'Gerenciar Tópicos',
      description: 'Criar, editar e excluir tópicos',
      icon: BookOpen,
    },
    {
      key: PROFESSOR_PERMISSIONS.MANAGE_QUESTIONS,
      label: 'Gerenciar Questões',
      description: 'Criar, editar e excluir questões',
      icon: Settings,
    },
    {
      key: PROFESSOR_PERMISSIONS.VIEW_ANALYTICS,
      label: 'Ver Analytics',
      description: 'Acessar dashboard de analytics',
      icon: BarChart3,
    },
    {
      key: PROFESSOR_PERMISSIONS.MANAGE_STUDENTS,
      label: 'Gerenciar Alunos',
      description: 'Ver e gerenciar informações dos alunos',
      icon: Users,
    },
    {
      key: PROFESSOR_PERMISSIONS.MANAGE_HIERARCHY,
      label: 'Gerenciar Hierarquia',
      description: 'Organizar estrutura de tópicos',
      icon: TreePine,
    },
    {
      key: PROFESSOR_PERMISSIONS.BULK_CONTENT,
      label: 'Importação em Massa',
      description: 'Importar conteúdo em massa',
      icon: FileUp,
    },
  ];

  const handlePermissionChange = async (permission: ProfessorPermissionType, granted: boolean) => {
    await updatePermission(professorId, permission, granted, currentUserId);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="md" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Permissões de {professorName}</h3>
        <Badge variant="outline">Professor</Badge>
      </div>

      <div className="space-y-4">
        {permissionConfig.map((config) => {
          const IconComponent = config.icon;
          const isGranted = hasPermission(config.key);
          
          return (
            <div key={config.key} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-start gap-3">
                <IconComponent className="w-5 h-5 mt-1 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">{config.label}</Label>
                  <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                </div>
              </div>
              
              <Switch
                checked={isGranted}
                onCheckedChange={(checked) => handlePermissionChange(config.key, checked)}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 rounded-md">
        <p className="text-sm text-yellow-800">
          <strong>Nota:</strong> As permissões entram em vigor imediatamente. 
          O professor precisará recarregar a página para ver as mudanças.
        </p>
      </div>
    </Card>
  );
}
