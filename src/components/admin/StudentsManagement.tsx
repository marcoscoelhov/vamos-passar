import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Shield, ShieldOff, Users, TrendingUp, Calendar, UserPlus, Settings } from 'lucide-react';
import { useStudents } from '@/hooks/useStudents';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ManualStudentForm } from './ManualStudentForm';
import { ProfessorPermissionsManager } from './ProfessorPermissionsManager';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Course } from '@/types/course';

interface StudentsManagementProps {
  course: Course;
  isAdmin: boolean;
}

export function StudentsManagement({ course, isAdmin }: StudentsManagementProps) {
  const {
    students,
    isLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    toggleAdminStatus,
    refreshStudents,
  } = useStudents();

  const [selectedProfessor, setSelectedProfessor] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
      case 'professor':
        return <Badge className="bg-blue-100 text-blue-800">Professor</Badge>;
      case 'student':
        return <Badge variant="outline">Aluno</Badge>;
      default:
        return <Badge variant="outline">Aluno</Badge>;
    }
  };

  const professors = students.filter(student => student.role === 'professor');

  if (isLoading && students.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Gerenciar Usuários</TabsTrigger>
          <TabsTrigger value="add">Adicionar Usuário</TabsTrigger>
          <TabsTrigger value="permissions">Permissões de Professores</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          {/* Header com busca */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Lista de Usuários</h2>
              <Badge variant="outline">{students.length} usuários</Badge>
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

          {/* Lista de usuários */}
          <div className="space-y-4">
            {students.map((student) => (
              <Card key={student.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {student.name || 'Nome não informado'}
                      </h3>
                      {getRoleBadge(student.role || 'student')}
                      {student.first_login && (
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          Primeiro acesso pendente
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
                    {student.role === 'professor' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProfessor(student.id)}
                        className="flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Permissões
                      </Button>
                    )}
                    
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
            <div className="flex justify-center items-center gap-2 mt-6">
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
              <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Tente ajustar os termos de busca.' : 'Ainda não há usuários cadastrados no sistema.'}
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="add">
          <ManualStudentForm onStudentAdded={refreshStudents} />
        </TabsContent>

        <TabsContent value="permissions">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Gerenciar Permissões de Professores</h2>
            </div>

            {professors.length === 0 ? (
              <Card className="p-8 text-center">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum professor cadastrado</h3>
                <p className="text-gray-600">
                  Adicione professores na aba "Adicionar Usuário" para gerenciar suas permissões.
                </p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {professors.map((professor) => (
                  <ProfessorPermissionsManager
                    key={professor.id}
                    course={course}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedProfessor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Gerenciar Permissões</h3>
              <Button variant="ghost" onClick={() => setSelectedProfessor(null)}>
                ✕
              </Button>
            </div>
            <div className="p-4">
              <ProfessorPermissionsManager
                course={course}
                isAdmin={isAdmin}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
