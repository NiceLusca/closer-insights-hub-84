
-- Criar tabela para cache dos leads processados
CREATE TABLE public.leads_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  raw_data JSONB NOT NULL,
  processed_leads JSONB NOT NULL,
  leads_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para metadados do cache
CREATE TABLE public.cache_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_type TEXT NOT NULL,
  last_webhook_sync TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_cache_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  webhook_hash TEXT,
  total_records INTEGER DEFAULT 0,
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cache_type)
);

-- Inserir registro inicial para controle do cache de leads
INSERT INTO public.cache_metadata (cache_type, webhook_hash, total_records) 
VALUES ('leads', '', 0) 
ON CONFLICT (cache_type) DO NOTHING;

-- Habilitar RLS (Row Level Security) - dados públicos para esta aplicação
ALTER TABLE public.leads_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_metadata ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para acesso aos dados (ajuste conforme necessário)
CREATE POLICY "Allow public access to leads_cache" ON public.leads_cache FOR ALL USING (true);
CREATE POLICY "Allow public access to cache_metadata" ON public.cache_metadata FOR ALL USING (true);

-- Criar índices para performance
CREATE INDEX idx_leads_cache_updated_at ON public.leads_cache(updated_at DESC);
CREATE INDEX idx_cache_metadata_cache_type ON public.cache_metadata(cache_type);
CREATE INDEX idx_cache_metadata_last_webhook_sync ON public.cache_metadata(last_webhook_sync DESC);
