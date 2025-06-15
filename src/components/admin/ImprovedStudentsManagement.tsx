
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Shield, ShieldOff, Users, TrendingUp, Calendar, UserPlus, Settings, Mail, Phone, MapPin, Edit, Trash2, MoreVertical, Download, Filter } from 'lucide-react';
import { useStudents } from '@/hooks/useStudents';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ManualStudentForm } from './ManualStudentForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Course } from '@/types/course';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ImprovedStudentsManagementProps {
  course: Course;
  isAdmin: boolean;
}

export function ImprovedStudentsManagement({ course, isAdmin }: ImprovedStudentsManagementProps) {
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

  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'professor' | 'admin'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'lastActivity'>('name');

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const filteredStudents = students
    .filter(student => {
      if (filterRole === 'all') return true;
      return student.role === filterRole || (filterRole === 'admin' && student.is_admin);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'progress':
          return getProgressPercentage(b.progress_count, b.total_topics) - 
                 getProgressPercentage(a.progress_count, a.total_topics);
        case 'lastActivity':
          return new Date(b.last_activity || 0).getTime() - new Date(a.last_activity || 0).getTime();
        default:
          return 0;
      }
    });

  if (isLoading && students.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Gestão de Usuários</h1>
        <p className="text-blue-100">Gerencie estudantes, professores e suas permissões de forma simples e intuitiva</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Gerenciar Usuários</TabsTrigger>
          <TabsTrigger value="add">Adicionar Usuário</TabsTrigger>
          <TabsTrigger value="analytics">Analytics de Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Usuários</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Usuários Ativos</p>
                  <p className="text-2xl font-bold">
                    {students.filter(s => s.last_activity && 
                      new Date(s.last_activity) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    ).length}
                  </p>
                  <p className="text-xs text-gray-500">Últimos 30 dias</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Professores</p>
                  <p className="text-2xl font-bold">
                    {students.filter(s => s.role === 'professor').length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Usuários Recentes</h3>
            <div className="space-y-3">
              {students.slice(0, 5).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {(student.name || student.email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{student.name || 'Nome não informado'}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                  </div>
                  <Badge variant={student.role === 'professor' ? 'default' : 'outline'}>
                    {student.role === 'professor' ? 'Professor' : 'Aluno'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <div className="space-y-6">
            {/* Filtros e busca */}
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-3 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por nome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Filtrar
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setFilterRole('all')}>
                        Todos os usuários
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterRole('student')}>
                        Apenas alunos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterRole('professor')}>
                        Apenas professores
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterRole('admin')}>
                        Apenas admins
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Exportar
                  </Button>
                  <Badge variant="outline">{filteredStudents.length} usuários</Badge>
                </div>
              </div>
            </Card>

            {/* Lista de usuários */}
            <div className="grid gap-4">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="p-6 hover:shadow-md transition-shadow">
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
          </div>
        </TabsContent>

        <TabsContent value="add">
          <ManualStudentForm onStudentAdded={refreshStudents} />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Distribuição de Roles</h3>
              <div className="space-y-4">
                {['student', 'professor', 'admin'].map(role => {
                  const count = students.filter(s => s.role === role || (role === 'admin' && s.is_admin)).length;
                  const percentage = students.length > 0 ? (count / students.length) * 100 : 0;
                  
                  return (
                    <div key={role} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{role === 'student' ? 'Alunos' : role === 'professor' ? 'Professores' : 'Admins'}</span>
                        <span>{count} ({Math.round(percentage)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Progresso Médio</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {Math.round(
                    students.reduce((acc, student) => 
                      acc + getProgressPercentage(student.progress_count, student.total_topics), 0
                    ) / Math.max(students.length, 1)
                  )}%
                </div>
                <p className="text-gray-600">Progresso médio dos usuários</p>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
