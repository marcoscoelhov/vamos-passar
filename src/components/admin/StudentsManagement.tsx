
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Shield, ShieldOff, Users, TrendingUp, Calendar } from 'lucide-react';
import { useStudents } from '@/hooks/useStudents';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function StudentsManagement() {
  const {
    students,
    isLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    toggleAdminStatus,
  } = useStudents();

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  if (isLoading && students.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com busca */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Gerenciar Alunos</h2>
          <Badge variant="outline">{students.length} alunos</Badge>
        </div>
        
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de alunos */}
      <div className="space-y-4">
        {students.map((student) => (
          <Card key={student.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">
                    {student.name || 'Nome não informado'}
                  </h3>
                  {student.is_admin && (
                    <Badge className="bg-purple-100 text-purple-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <p><strong>Email:</strong> {student.email}</p>
                    <p><strong>Cadastro:</strong> {formatDate(student.created_at)}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>
                      Progresso: {student.progress_count}/{student.total_topics} tópicos
                      ({getProgressPercentage(student.progress_count, student.total_topics)}%)
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Última atividade: {
                        student.last_activity 
                          ? formatDate(student.last_activity)
                          : 'Nunca'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant={student.is_admin ? "destructive" : "outline"}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {student.is_admin ? (
                        <>
                          <ShieldOff className="w-4 h-4" />
                          Remover Admin
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4" />
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
                        onClick={() => toggleAdminStatus(student.id, student.is_admin || false)}
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
        ))}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </Button>
          
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Próxima
          </Button>
        </div>
      )}

      {students.length === 0 && !isLoading && (
        <Card className="p-8 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum aluno encontrado</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Tente ajustar os termos de busca.' : 'Ainda não há alunos cadastrados no sistema.'}
          </p>
        </Card>
      )}
    </div>
  );
}
