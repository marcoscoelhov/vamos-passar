
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Filter, Download } from 'lucide-react';
import { StudentsFiltersProps } from './types';

export function StudentsFilters({
  searchTerm,
  setSearchTerm,
  filterRole,
  setFilterRole,
  filteredStudentsCount
}: StudentsFiltersProps) {
  return (
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
          <Badge variant="outline">{filteredStudentsCount} usuários</Badge>
        </div>
      </div>
    </Card>
  );
}
