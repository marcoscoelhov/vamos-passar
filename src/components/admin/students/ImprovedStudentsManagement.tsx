
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, TrendingUp } from 'lucide-react';
import { useStudents } from '@/hooks/useStudents';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ManualStudentForm } from '../ManualStudentForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Course } from '@/types/course';

import { StudentsOverview } from './StudentsOverview';
import { StudentsFilters } from './StudentsFilters';
import { StudentCard } from './StudentCard';
import { StudentsAnalytics } from './StudentsAnalytics';
import { RecentStudents } from './RecentStudents';
import { StudentsPagination } from './StudentsPagination';

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
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

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
          <StudentsOverview students={students} />
          <RecentStudents students={students} />
        </TabsContent>

        <TabsContent value="users">
          <div className="space-y-6">
            <StudentsFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterRole={filterRole}
              setFilterRole={setFilterRole}
              filteredStudentsCount={filteredStudents.length}
            />

            <div className="grid gap-4">
              {filteredStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onToggleAdmin={toggleAdminStatus}
                  formatDate={formatDate}
                  getProgressPercentage={getProgressPercentage}
                />
              ))}
            </div>

            <StudentsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </TabsContent>

        <TabsContent value="add">
          <ManualStudentForm onStudentAdded={refreshStudents} />
        </TabsContent>

        <TabsContent value="analytics">
          <StudentsAnalytics 
            students={students}
            getProgressPercentage={getProgressPercentage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
