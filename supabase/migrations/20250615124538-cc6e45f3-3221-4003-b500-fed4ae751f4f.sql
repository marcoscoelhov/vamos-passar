
-- Criar tabela para gerenciar API keys
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  rate_limit INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para logs de API
CREATE TABLE public.api_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  request_size INTEGER,
  response_size INTEGER,
  ip_address INET,
  user_agent TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para configurações de webhooks
CREATE TABLE public.webhook_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  secret_token TEXT,
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  headers JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para logs de webhooks
CREATE TABLE public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_config_id UUID REFERENCES public.webhook_configs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status_code INTEGER,
  response_body TEXT,
  error_message TEXT,
  retry_attempt INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para eventos pendentes
CREATE TABLE public.webhook_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_config_id UUID REFERENCES public.webhook_configs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_queue ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para api_keys (apenas admins podem gerenciar)
CREATE POLICY "Admins can manage API keys" ON public.api_keys
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Políticas RLS para api_logs (apenas admins podem ver)
CREATE POLICY "Admins can view API logs" ON public.api_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Políticas RLS para webhook_configs (apenas admins)
CREATE POLICY "Admins can manage webhook configs" ON public.webhook_configs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Políticas RLS para webhook_logs (apenas admins)
CREATE POLICY "Admins can view webhook logs" ON public.webhook_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Políticas RLS para webhook_queue (apenas admins)
CREATE POLICY "Admins can manage webhook queue" ON public.webhook_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Função para gerar API key com prefixo
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
DECLARE
  key_suffix TEXT;
  full_key TEXT;
BEGIN
  -- Gerar 32 caracteres aleatórios
  key_suffix := encode(gen_random_bytes(24), 'base64');
  -- Remover caracteres especiais e truncar
  key_suffix := translate(key_suffix, '+/=', 'XYZ');
  key_suffix := substring(key_suffix from 1 for 32);
  
  -- Criar chave completa com prefixo
  full_key := 'lms_' || key_suffix;
  
  RETURN full_key;
END;
$$ LANGUAGE plpgsql;

-- Função para hash da API key
CREATE OR REPLACE FUNCTION hash_api_key(key TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(key, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Criar índices para performance
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_logs_created_at ON public.api_logs(created_at DESC);
CREATE INDEX idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);
CREATE INDEX idx_webhook_queue_scheduled_for ON public.webhook_queue(scheduled_for);
