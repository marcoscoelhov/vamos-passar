
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CourseCategory } from '@/types/course';
import { Upload, DollarSign, Clock, Users, Award } from 'lucide-react';

interface CourseFormDialogProps {
  categories: CourseCategory[];
  onSuccess: () => void;
  onCancel: () => void;
  course?: any; // Para edição
}

export function CourseFormDialog({ categories, onSuccess, onCancel, course }: CourseFormDialogProps) {
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    category_id: course?.category_id || '',
    course_type: course?.course_type || 'online',
    status: course?.status || 'rascunho',
    duration_hours: course?.duration_hours || 0,
    target_audience: course?.target_audience || '',
    prerequisites: course?.prerequisites || '',
    certificate_available: course?.certificate_available || false,
    price: course?.price || 0,
    discount_price: course?.discount_price || 0,
    max_installments: course?.max_installments || 1,
    thumbnail_url: course?.thumbnail_url || '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const courseData = {
        ...formData,
        duration_hours: parseInt(formData.duration_hours.toString()) || 0,
        price: parseFloat(formData.price.toString()) || 0,
        discount_price: formData.discount_price ? parseFloat(formData.discount_price.toString()) : null,
        max_installments: parseInt(formData.max_installments.toString()) || 1,
      };

      if (course) {
        // Atualizar curso existente
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', course.id);

        if (error) throw error;

        toast({
          title: 'Curso atualizado',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        // Criar novo curso
        const { error } = await supabase
          .from('courses')
          .insert([courseData]);

        if (error) throw error;

        toast({
          title: 'Curso criado',
          description: 'O novo curso foi criado com sucesso.',
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o curso.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {course ? 'Editar Curso' : 'Criar Novo Curso'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
            Informações Básicas
          </h3>
          
          <div>
            <Label htmlFor="title">Título do Curso *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ex: Curso Completo de React"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva o que o aluno irá aprender..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="course_type">Modalidade</Label>
              <Select value={formData.course_type} onValueChange={(value) => handleInputChange('course_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="pausado">Pausado</SelectItem>
                  <SelectItem value="encerrado">Encerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration_hours">Duração (horas)</Label>
              <Input
                id="duration_hours"
                type="number"
                value={formData.duration_hours}
                onChange={(e) => handleInputChange('duration_hours', e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Público e Pré-requisitos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
            Público-Alvo e Pré-requisitos
          </h3>
          
          <div>
            <Label htmlFor="target_audience">Público-Alvo</Label>
            <Textarea
              id="target_audience"
              value={formData.target_audience}
              onChange={(e) => handleInputChange('target_audience', e.target.value)}
              placeholder="Ex: Iniciantes em programação, profissionais de marketing..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="prerequisites">Pré-requisitos</Label>
            <Textarea
              id="prerequisites"
              value={formData.prerequisites}
              onChange={(e) => handleInputChange('prerequisites', e.target.value)}
              placeholder="Ex: Conhecimento básico de HTML e CSS..."
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="certificate"
              checked={formData.certificate_available}
              onCheckedChange={(checked) => handleInputChange('certificate_available', checked)}
            />
            <Label htmlFor="certificate" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Certificado disponível
            </Label>
          </div>
        </div>

        {/* Preços */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Preços e Pagamento
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0.00"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="discount_price">Preço Promocional (R$)</Label>
              <Input
                id="discount_price"
                type="number"
                step="0.01"
                value={formData.discount_price}
                onChange={(e) => handleInputChange('discount_price', e.target.value)}
                placeholder="0.00"
                min="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="max_installments">Máximo de Parcelas</Label>
            <Select 
              value={formData.max_installments.toString()} 
              onValueChange={(value) => handleInputChange('max_installments', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num === 1 ? 'À vista' : `${num}x`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Imagem do Curso
          </h3>
          
          <div>
            <Label htmlFor="thumbnail_url">URL da Imagem</Label>
            <Input
              id="thumbnail_url"
              value={formData.thumbnail_url}
              onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : (course ? 'Atualizar Curso' : 'Criar Curso')}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
