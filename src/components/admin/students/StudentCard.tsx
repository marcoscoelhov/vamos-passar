
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Shield, ShieldOff, Mail, TrendingUp, Calendar, Edit, Trash2, MoreVertical } from 'lucide-react';
import { StudentCardProps } from './types';

export function StudentCard({ 
  student, 
  onToggleAdmin, 
  formatDate, 
  getProgressPercentage 
}: StudentCardProps) {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {(student.name || student.email || 'U')[0].toUpperCase()}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">
                {student.name || 'Nome não informado'}
              </h3>
              <Badge variant={student.role === 'professor' ? 'default' : 'outline'}>
                {student.role === 'professor' ? 'Professor' : 'Aluno'}
              </Badge>
              {student.is_admin && (
                <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
              )}
              {student.first_login && (
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  Primeiro acesso pendente
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{student.email}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>
                  Progresso: {getProgressPercentage(student.progress_count, student.total_topics)}%
                  ({student.progress_count}/{student.total_topics})
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Último acesso: {
                    student.last_activity 
                      ? formatDate(student.last_activity)
                      : 'Nunca'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="w-4 h-4 mr-2" />
                Enviar email
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Remover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant={student.is_admin ? "destructive" : "default"}
                size="sm"
                className="ml-2"
              >
                {student.is_admin ? (
                  <>
                    <ShieldOff className="w-4 h-4 mr-1" />
                    Remover Admin
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-1" />
                    Tornar Admin
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {student.is_admin ? 'Remover privilégios de administrador?' : 'Conceder privilégios de administrador?'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {student.is_admin 
                    ? `${student.name} perderá acesso ao painel administrativo e não poderá mais gerenciar conteúdo.`
                    : `${student.name} terá acesso completo ao painel administrativo e poderá gerenciar todo o conteúdo.`
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onToggleAdmin(student.id, student.is_admin || false)}
                  className={student.is_admin ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
}
