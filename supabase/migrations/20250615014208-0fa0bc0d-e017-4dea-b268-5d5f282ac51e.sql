
-- Criar enum para tipos de curso
CREATE TYPE public.course_type AS ENUM ('online', 'presencial', 'hibrido');

-- Criar enum para status do curso
CREATE TYPE public.course_status AS ENUM ('rascunho', 'ativo', 'pausado', 'encerrado');

-- Criar enum para métodos de pagamento
CREATE TYPE public.payment_method AS ENUM ('pix', 'boleto', 'cartao_credito', 'cartao_debito');

-- Criar enum para status de matrícula
CREATE TYPE public.enrollment_status AS ENUM ('pendente', 'ativo', 'concluido', 'cancelado');

-- Tabela de categorias de curso
CREATE TABLE public.course_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Atualizar tabela de cursos existente
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.course_categories(id),
ADD COLUMN IF NOT EXISTS course_type public.course_type DEFAULT 'online',
ADD COLUMN IF NOT EXISTS status public.course_status DEFAULT 'rascunho',
ADD COLUMN IF NOT EXISTS duration_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS prerequisites TEXT,
ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS certificate_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS max_installments INTEGER DEFAULT 1;

-- Tabela de matrículas
CREATE TABLE public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_status public.enrollment_status DEFAULT 'pendente',
  payment_method public.payment_method,
  amount_paid DECIMAL(10,2),
  installments INTEGER DEFAULT 1,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  certificate_issued_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Tabela de avaliações
CREATE TABLE public.course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Tabela de cupons de desconto
CREATE TABLE public.course_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir categorias padrão
INSERT INTO public.course_categories (name, description, icon, color) VALUES
('Concursos Públicos', 'Preparação para concursos federais, estaduais e municipais', 'Trophy', '#DC2626'),
('Idiomas', 'Cursos de inglês, espanhol, francês e outros idiomas', 'Globe', '#059669'),
('Tecnologia', 'Programação, desenvolvimento web, mobile e data science', 'Code', '#2563EB'),
('Negócios', 'Administração, marketing, vendas e empreendedorismo', 'TrendingUp', '#7C3AED'),
('Saúde', 'Medicina, enfermagem, fisioterapia e áreas da saúde', 'Heart', '#DB2777'),
('Educação', 'Pedagogia, licenciaturas e formação de professores', 'GraduationCap', '#EA580C');

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_coupons ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para course_categories (todos podem ver)
CREATE POLICY "Everyone can view course categories" ON public.course_categories
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify course categories" ON public.course_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Políticas RLS para course_enrollments
CREATE POLICY "Users can view their own enrollments" ON public.course_enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all enrollments" ON public.course_enrollments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Políticas RLS para course_reviews
CREATE POLICY "Users can view all reviews" ON public.course_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own reviews" ON public.course_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para course_coupons
CREATE POLICY "Everyone can view active coupons" ON public.course_coupons
  FOR SELECT USING (valid_until > NOW() OR valid_until IS NULL);

CREATE POLICY "Only admins can manage coupons" ON public.course_coupons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );
