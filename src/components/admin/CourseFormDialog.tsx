
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
import { Upload, DollarSign, Clock, Users, Award, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const courseSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(100, 'Título muito longo'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Categoria é obrigatória'),
  course_type: z.enum(['online', 'presencial', 'hibrido']),
  status: z.enum(['rascunho', 'ativo', 'pausado', 'encerrado']),
  duration_hours: z.number().min(0, 'Duração deve ser positiva').max(1000, 'Duração muito alta'),
  target_audience: z.string().optional(),
  prerequisites: z.string().optional(),
  certificate_available: z.boolean(),
  price: z.number().min(0, 'Preço deve ser positivo').max(99999, 'Preço muito alto'),
  discount_price: z.number().min(0, 'Preço promocional deve ser positivo').max(99999, 'Preço muito alto').optional().nullable(),
  max_installments: z.number().min(1, 'Mínimo 1 parcela').max(12, 'Máximo 12 parcelas'),
  thumbnail_url: z.string().url('URL inválida').optional().or(z.literal('')),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormDialogProps {
  categories: CourseCategory[];
  onSuccess: () => void;
  onCancel: () => void;
  course?: any; // Para edição
}

export function CourseFormDialog({ categories, onSuccess, onCancel, course }: CourseFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
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
      discount_price: course?.discount_price || null,
      max_installments: course?.max_installments || 1,
      thumbnail_url: course?.thumbnail_url || '',
    },
  });

  const onSubmit = async (data: CourseFormData) => {
    setIsLoading(true);

    try {
      // Validação adicional
      if (data.discount_price && data.discount_price >= data.price) {
        form.setError('discount_price', {
          message: 'Preço promocional deve ser menor que o preço normal'
        });
        return;
      }

      const courseData = {
        ...data,
        discount_price: data.discount_price || null,
        thumbnail_url: data.thumbnail_url || null,
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
        description: 'Não foi possível salvar o curso. Verifique os dados e tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {course ? 'Editar Curso' : 'Criar Novo Curso'}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
              Informações Básicas
            </h3>
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Curso *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Curso Completo de React" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o que o aluno irá aprender..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="course_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modalidade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="presencial">Presencial</SelectItem>
                        <SelectItem value="hibrido">Híbrido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="rascunho">Rascunho</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="pausado">Pausado</SelectItem>
                        <SelectItem value="encerrado">Encerrado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração (horas)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        max="1000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Público e Pré-requisitos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
              Público-Alvo e Pré-requisitos
            </h3>
            
            <FormField
              control={form.control}
              name="target_audience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Público-Alvo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Iniciantes em programação, profissionais de marketing..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prerequisites"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pré-requisitos</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Conhecimento básico de HTML e CSS..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="certificate_available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Certificado disponível
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Preços */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Preços e Pagamento
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        max="99999"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Promocional (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        max="99999"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="max_installments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Máximo de Parcelas</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num === 1 ? 'À vista' : `${num}x`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Thumbnail */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Imagem do Curso
            </h3>
            
            <FormField
              control={form.control}
              name="thumbnail_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://exemplo.com/imagem.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
      </Form>
    </DialogContent>
  );
}
