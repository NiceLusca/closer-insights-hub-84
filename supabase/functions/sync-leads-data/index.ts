
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WEBHOOK_URL = 'https://bot-belas-n8n.9csrtv.easypanel.host/webhook/leads-closer-oceanoazul';

// Sistema completo de processamento de leads (idêntico ao local)
interface ProcessedLead {
  row_number: number;
  data: string;
  Hora: string;
  Nome: string;
  'e-mail': string;
  Whatsapp: string;
  origem: string;
  Status: string;
  Closer: string;
  'Venda Completa': number;
  recorrente: number;
  Valor?: number | string;
  Produto?: string;
  'Coluna 1'?: string;
  parsedDate?: string; // ISO string para JSON compatibility
}

// Função de parsing de data brasileira (replicada do sistema local)
function parseBrazilianDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  const cleaned = dateStr.trim();
  if (!cleaned) return null;
  
  // Padrões de data brasileira
  const patterns = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
  ];
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      let day: number, month: number, year: number;
      
      if (pattern.source.startsWith('^(\\d{4})')) {
        // YYYY-MM-DD
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1; // JavaScript months are 0-based
        day = parseInt(match[3]);
      } else {
        // DD/MM/YYYY or DD-MM-YYYY
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1; // JavaScript months are 0-based
        year = parseInt(match[3]);
      }
      
      const date = new Date(year, month, day);
      
      // Validar se a data é válida
      if (date.getFullYear() === year && 
          date.getMonth() === month && 
          date.getDate() === day) {
        return date;
      }
    }
  }
  
  // Tentar ISO date como fallback
  try {
    const isoDate = new Date(cleaned);
    return isNaN(isoDate.getTime()) ? null : isoDate;
  } catch {
    return null;
  }
}

// Função para encontrar data no item (replicada do sistema local)
function findDateInItem(item: any): { dateValue: string | null; method: string } {
  const dateFields = [
    'data', 'Data', 'DATA',
    'date', 'Date', 'DATE',
    'data_lead', 'data_criacao', 'created_at',
    'timestamp', 'Timestamp'
  ];
  
  // Procurar em campos conhecidos
  for (const field of dateFields) {
    if (item[field] && typeof item[field] === 'string' && item[field].trim() !== '') {
      return { dateValue: item[field].trim(), method: `campo_${field}` };
    }
  }
  
  // Procurar em qualquer campo que contenha "data" no nome
  for (const [key, value] of Object.entries(item)) {
    if (key.toLowerCase().includes('data') && 
        typeof value === 'string' && 
        value.trim() !== '') {
      return { dateValue: value.trim(), method: `busca_${key}` };
    }
  }
  
  return { dateValue: null, method: 'not_found' };
}

// Função para construir lead (replicada do sistema local)
function buildLead(item: any, index: number, rawDateValue: string, parsedDate: Date | null): ProcessedLead {
  const getValue = (key: string, fallback: any = '') => {
    return item[key] !== undefined && item[key] !== null ? item[key] : fallback;
  };

  const getNumericValue = (key: string, fallback: number = 0): number => {
    const value = item[key];
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
      return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  };

  return {
    row_number: index + 1,
    data: rawDateValue || getValue('data', ''),
    Hora: getValue('Hora', getValue('hora', '')),
    Nome: getValue('Nome', getValue('nome', '')),
    'e-mail': getValue('e-mail', getValue('email', getValue('Email', ''))),
    Whatsapp: getValue('Whatsapp', getValue('whatsapp', getValue('telefone', ''))),
    origem: getValue('origem', getValue('source', getValue('Source', ''))),
    Status: getValue('Status', getValue('status', '')),
    Closer: getValue('Closer', getValue('closer', '')),
    'Venda Completa': getNumericValue('Venda Completa', getNumericValue('venda_completa', 0)),
    recorrente: getNumericValue('recorrente', getNumericValue('Recorrente', 0)),
    Valor: getValue('Valor', getValue('valor', 0)),
    Produto: getValue('Produto', getValue('produto', '')),
    'Coluna 1': getValue('Coluna 1', ''),
    parsedDate: parsedDate ? parsedDate.toISOString() : undefined
  };
}

// Função principal de processamento
function processRawDataToLeads(rawData: any[]): ProcessedLead[] {
  const leads: ProcessedLead[] = [];
  
  console.log(`📊 [EDGE-FUNCTION] Processando ${rawData.length} registros...`);
  
  for (let i = 0; i < rawData.length; i++) {
    const item = rawData[i];
    
    try {
      // Encontrar data
      const { dateValue } = findDateInItem(item);
      const parsedDate = dateValue ? parseBrazilianDate(dateValue) : null;
      
      // Construir lead
      const lead = buildLead(item, i, dateValue || '', parsedDate);
      
      // Validar lead (pelo menos nome ou status deve existir)
      if (lead.Nome?.trim() || lead.Status?.trim()) {
        leads.push(lead);
      }
    } catch (error) {
      console.error(`❌ [EDGE-FUNCTION] Erro processando item ${i}:`, error);
    }
  }
  
  console.log(`✅ [EDGE-FUNCTION] ${leads.length}/${rawData.length} leads processados com sucesso`);
  return leads;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔄 [EDGE-FUNCTION] Iniciando sincronização completa...');

    // Verificar se precisa sincronizar
    const { data: metadata } = await supabase
      .from('cache_metadata')
      .select('last_webhook_sync, is_valid')
      .eq('cache_type', 'leads')
      .single();

    if (metadata) {
      const lastSync = new Date(metadata.last_webhook_sync);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastSync.getTime()) / (1000 * 60);

      if (metadata.is_valid && diffMinutes < 15) {
        console.log(`⏰ [EDGE-FUNCTION] Cache válido (${diffMinutes.toFixed(1)} min), pulando sincronização`);
        return new Response(
          JSON.stringify({ 
            message: 'Cache válido, sincronização não necessária',
            ageMinutes: diffMinutes
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    }

    // Buscar dados do webhook
    console.log('🌐 [EDGE-FUNCTION] Buscando dados do webhook...');
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook retornou ${webhookResponse.status}`);
    }

    const rawData = await webhookResponse.json();
    const dataArray = Array.isArray(rawData) ? rawData : [rawData];

    console.log(`📊 [EDGE-FUNCTION] Processando ${dataArray.length} registros do webhook...`);

    // Processar dados usando sistema completo
    const processedLeads = processRawDataToLeads(dataArray);

    // Salvar no cache
    const { error: cacheError } = await supabase
      .from('leads_cache')
      .insert({
        raw_data: dataArray,
        processed_leads: processedLeads,
        leads_count: processedLeads.length
      });

    if (cacheError) {
      console.error('❌ [EDGE-FUNCTION] Erro ao salvar cache:', cacheError);
      throw cacheError;
    }

    // Atualizar metadata
    const { error: metaError } = await supabase
      .from('cache_metadata')
      .upsert({
        cache_type: 'leads',
        last_webhook_sync: new Date().toISOString(),
        last_cache_update: new Date().toISOString(),
        webhook_hash: calculateHash(dataArray),
        total_records: processedLeads.length,
        is_valid: true
      });

    if (metaError) {
      console.error('❌ [EDGE-FUNCTION] Erro ao atualizar metadata:', metaError);
      throw metaError;
    }

    // Limpar cache antigo
    const { data: oldRecords } = await supabase
      .from('leads_cache')
      .select('id')
      .order('updated_at', { ascending: false })
      .range(5, 100);

    if (oldRecords && oldRecords.length > 0) {
      const idsToDelete = oldRecords.map(r => r.id);
      await supabase
        .from('leads_cache')
        .delete()
        .in('id', idsToDelete);
      
      console.log(`🧹 [EDGE-FUNCTION] ${idsToDelete.length} registros antigos removidos`);
    }

    console.log(`✅ [EDGE-FUNCTION] Sincronização concluída: ${processedLeads.length} leads processados`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sincronização concluída com sucesso',
        totalLeads: processedLeads.length,
        timestamp: new Date().toISOString()
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('❌ [EDGE-FUNCTION] Erro na sincronização:', error);
    
    // Marcar cache como inválido em caso de erro
    await supabase
      .from('cache_metadata')
      .update({ is_valid: false })
      .eq('cache_type', 'leads');

    return new Response(
      JSON.stringify({
        error: 'Erro na sincronização',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});

function calculateHash(data: any): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}
