
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { CourseCategory } from '@/types/course';

interface AdvancedCourseFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  categories: CourseCategory[];
  onClearFilters: () => void;
}

export function AdvancedCourseFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  priceRange,
  onPriceRangeChange,
  categories,
  onClearFilters
}: AdvancedCourseFiltersProps) {
  const hasActiveFilters = Boolean(
    searchTerm || 
    selectedCategory !== 'all' || 
    selectedStatus !== 'all' || 
    priceRange[0] > 0 || 
    priceRange[1] < 10000
  );

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-slate-600 hover:text-slate-900"
          >
            <X className="w-4 h-4 mr-2" />
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Search and basic filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="pausado">Pausado</SelectItem>
            <SelectItem value="encerrado">Encerrado</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Data de criação</SelectItem>
              <SelectItem value="title">Nome</SelectItem>
              <SelectItem value="price">Preço</SelectItem>
              <SelectItem value="duration_hours">Duração</SelectItem>
              <SelectItem value="enrollments">Matrículas</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortOrder} onValueChange={onSortOrderChange}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Desc</SelectItem>
              <SelectItem value="asc">Asc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price range filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Faixa de preço</label>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">R$</span>
            <Input
              type="number"
              placeholder="Mín"
              value={priceRange[0]}
              onChange={(e) => onPriceRangeChange([Number(e.target.value), priceRange[1]])}
              className="w-24"
            />
          </div>
          <span className="text-slate-400">até</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">R$</span>
            <Input
              type="number"
              placeholder="Máx"
              value={priceRange[1]}
              onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
              className="w-24"
            />
          </div>
        </div>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <span className="text-sm text-slate-600">Filtros ativos:</span>
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Busca: "{searchTerm}"
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onSearchChange('')}
              />
            </Badge>
          )}
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Categoria: {categories.find(c => c.id === selectedCategory)?.name}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onCategoryChange('all')}
              />
            </Badge>
          )}
          {selectedStatus !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {selectedStatus}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onStatusChange('all')}
              />
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
}
