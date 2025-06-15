
import type { Permission } from './types';

export const AVAILABLE_PERMISSIONS: Permission[] = [
  { id: 'courses:read', label: 'Ler Cursos', description: 'Visualizar informações de cursos' },
  { id: 'courses:write', label: 'Escrever Cursos', description: 'Criar, editar e excluir cursos' },
  { id: 'students:read', label: 'Ler Estudantes', description: 'Visualizar informações de estudantes' },
  { id: 'students:write', label: 'Escrever Estudantes', description: 'Gerenciar estudantes' },
  { id: 'analytics:read', label: 'Ler Analytics', description: 'Acessar relatórios e métricas' },
  { id: 'webhooks:manage', label: 'Gerenciar Webhooks', description: 'Configurar webhooks' }
];
