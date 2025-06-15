
-- Criar tabela para mapear produtos do Kwify para cursos
CREATE TABLE public.kwify_product_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kwify_product_id TEXT NOT NULL UNIQUE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  product_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar índices para melhor performance
CREATE INDEX idx_kwify_product_mappings_product_id ON public.kwify_product_mappings(kwify_product_id);
CREATE INDEX idx_kwify_product_mappings_course_id ON public.kwify_product_mappings(course_id);

-- Habilitar RLS
ALTER TABLE public.kwify_product_mappings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - apenas admins podem gerenciar mapeamentos
CREATE POLICY "Admins can manage kwify mappings" 
  ON public.kwify_product_mappings 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Adicionar colunas para rastrear origem da matrícula
ALTER TABLE public.course_enrollments 
ADD COLUMN enrollment_source TEXT DEFAULT 'manual',
ADD COLUMN external_reference TEXT;

-- Índice para referência externa
CREATE INDEX idx_course_enrollments_external_ref ON public.course_enrollments(external_reference);
