
import type { AvailableEvent } from './types';

export const AVAILABLE_EVENTS: AvailableEvent[] = [
  { id: 'student.enrolled', label: 'Estudante Matriculado', description: 'Disparado quando um estudante se matricula' },
  { id: 'student.completed', label: 'Curso Concluído', description: 'Disparado quando um estudante conclui um curso' },
  { id: 'course.created', label: 'Curso Criado', description: 'Disparado quando um novo curso é criado' },
  { id: 'course.updated', label: 'Curso Atualizado', description: 'Disparado quando um curso é atualizado' },
  { id: 'payment.confirmed', label: 'Pagamento Confirmado', description: 'Disparado quando um pagamento é confirmado' },
  { id: 'user.created', label: 'Usuário Criado', description: 'Disparado quando um novo usuário é criado' }
];
