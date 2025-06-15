
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCourse } from '@/contexts/CourseContext';

interface KwifyMapping {
  id: string;
  kwify_product_id: string;
  course_id: string;
  product_name: string;
  is_active: boolean;
  created_at: string;
  courses?: {
    title: string;
  };
}

interface Course {
  id: string;
  title: string;
}

export function KwifyProductMapping() {
  const [mappings, setMappings] = useState<KwifyMapping[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMapping, setNewMapping] = useState({
    kwify_product_id: '',
    course_id: '',
    product_name: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadMappings();
    loadCourses();
  }, []);

  const loadMappings = async () => {
    try {
      const { data, error } = await supabase
        .from('kwify_product_mappings')
        .select(`
          *,
          courses (
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMappings(data || []);
    } catch (error) {
      console.error('Error loading mappings:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os mapeamentos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('status', 'ativo')
        .order('title');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const handleAddMapping = async () => {
    if (!newMapping.kwify_product_id || !newMapping.course_id) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('kwify_product_mappings')
        .insert([newMapping]);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Mapeamento criado com sucesso!',
      });

      setNewMapping({ kwify_product_id: '', course_id: '', product_name: '' });
      setShowAddForm(false);
      loadMappings();
    } catch (error) {
      console.error('Error adding mapping:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o mapeamento.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('kwify_product_mappings')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Mapeamento ${!isActive ? 'ativado' : 'desativado'} com sucesso!`,
      });

      loadMappings();
    } catch (error) {
      console.error('Error toggling mapping:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o mapeamento.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMapping = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este mapeamento?')) return;

    try {
      const { error } = await supabase
        .from('kwify_product_mappings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Mapeamento excluído com sucesso!',
      });

      loadMappings();
    } catch (error) {
      console.error('Error deleting mapping:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o mapeamento.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Mapeamento de Produtos Kwify</h3>
          <p className="text-gray-600">Configure quais produtos do Kwify correspondem a quais cursos</p>
        </div>
        
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Mapeamento
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6">
          <h4 className="text-md font-medium mb-4">Novo Mapeamento</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="kwify_product_id">ID do Produto Kwify *</Label>
              <Input
                id="kwify_product_id"
                value={newMapping.kwify_product_id}
                onChange={(e) => setNewMapping(prev => ({ ...prev, kwify_product_id: e.target.value }))}
                placeholder="ex: produto-123"
              />
            </div>
            
            <div>
              <Label htmlFor="course_id">Curso *</Label>
              <Select value={newMapping.course_id} onValueChange={(value) => setNewMapping(prev => ({ ...prev, course_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="product_name">Nome do Produto (opcional)</Label>
              <Input
                id="product_name"
                value={newMapping.product_name}
                onChange={(e) => setNewMapping(prev => ({ ...prev, product_name: e.target.value }))}
                placeholder="Nome descritivo"
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAddMapping}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {mappings.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum mapeamento configurado</h3>
            <p className="text-gray-600 mb-4">Configure mapeamentos para conectar produtos do Kwify aos seus cursos.</p>
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Primeiro Mapeamento
            </Button>
          </Card>
        ) : (
          mappings.map((mapping) => (
            <Card key={mapping.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">
                      {mapping.product_name || mapping.kwify_product_id}
                    </h4>
                    <Badge variant={mapping.is_active ? "default" : "secondary"}>
                      {mapping.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>ID Kwify:</strong> {mapping.kwify_product_id}</p>
                    <p><strong>Curso:</strong> {mapping.courses?.title}</p>
                    <p><strong>Criado em:</strong> {new Date(mapping.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(mapping.id, mapping.is_active)}
                  >
                    {mapping.is_active ? 'Desativar' : 'Ativar'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteMapping(mapping.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
