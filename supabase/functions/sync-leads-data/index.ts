
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  Valor?: any;
  Produto?: string;
  'Coluna 1'?: string;
  parsedDate?: Date;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    console.log('🚀 [SYNC-LEADS] === INICIANDO SINCRONIZAÇÃO ===');
    
    const { force = false } = await req.json().catch(() => ({}));
    console.log('🔧 [SYNC-LEADS] Modo forçado:', force);

    // CORREÇÃO 1: Verificar se cache existe e está válido
    if (!force) {
      const { data: cacheStatus } = await supabase
        .from('cache_metadata')
        .select('last_webhook_sync, is_valid')
        .eq('cache_type', 'leads')
        .maybeSingle();

      if (cacheStatus && cacheStatus.is_valid) {
        const lastSync = new Date(cacheStatus.last_webhook_sync);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastSync.getTime()) / (1000 * 60);

        if (diffMinutes < 15) {
          console.log('⏳ [SYNC-LEADS] Cache ainda válido, retornando dados existentes');
          
          const { data: cachedLeads } = await supabase
            .from('leads_cache')
            .select('processed_leads, leads_count')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return new Response(JSON.stringify({
            success: true,
            source: 'cache',
            totalLeads: cachedLeads?.leads_count || 0,
            message: 'Cache válido, dados não sincronizados'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    }

    // CORREÇÃO 2: Buscar dados mais recentes do webhook
    console.log('📦 [SYNC-LEADS] Buscando dados do webhook...');
    
    const { data: webhookData, error: webhookError } = await supabase
      .from('webhook_raw_data')
      .select('raw_data, total_records, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (webhookError) {
      console.error('❌ [SYNC-LEADS] Erro ao buscar webhook:', webhookError);
      throw new Error(`Erro no webhook: ${webhookError.message}`);
    }

    if (!webhookData || !webhookData.raw_data) {
      console.warn('⚠️ [SYNC-LEADS] Nenhum dado encontrado no webhook');
      return new Response(JSON.stringify({
        success: false,
        error: 'Nenhum dado disponível no webhook',
        totalLeads: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📊 [SYNC-LEADS] Processando ${webhookData.total_records} registros...`);

    // CORREÇÃO 3: Processar dados com validação rigorosa
    const rawLeads = Array.isArray(webhookData.raw_data) ? webhookData.raw_data : [];
    console.log('🔍 [SYNC-LEADS] Total de leads brutos:', rawLeads.length);

    const processedLeads: ProcessedLead[] = [];
    let processedCount = 0;
    let errorCount = 0;

    for (let index = 0; index < rawLeads.length; index++) {
      try {
        const rawLead = rawLeads[index];
        
        if (!rawLead || typeof rawLead !== 'object') {
          console.warn(`⚠️ [SYNC-LEADS] Lead ${index} inválido:`, rawLead);
          errorCount++;
          continue;
        }

        // CORREÇÃO 4: Conversão segura de valores monetários
        const parseMonetaryValue = (value: any): number => {
          if (typeof value === 'number' && !isNaN(value)) {
            return Math.max(0, value);
          }
          
          if (typeof value === 'string') {
            const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? 0 : Math.max(0, parsed);
          }
          
          return 0;
        };

        // CORREÇÃO 5: Parse de data com validação de ano
        let parsedDate: Date | undefined;
        
        if (rawLead.data && typeof rawLead.data === 'string') {
          try {
            // Tentar parsear diferentes formatos
            const dateStr = rawLead.data.trim();
            
            // Formato brasileiro: "12 fev."
            const brazilianMatch = dateStr.match(/^(\d{1,2})\s+([a-z]+)\.?$/i);
            if (brazilianMatch) {
              const [, day, monthStr] = brazilianMatch;
              const monthMap: { [key: string]: number } = {
                'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
                'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11
              };
              
              const month = monthMap[monthStr.toLowerCase().substring(0, 3)];
              if (month !== undefined) {
                const currentYear = new Date().getFullYear();
                const testDate = new Date(currentYear, month, parseInt(day));
                
                // Se a data seria no futuro, usar ano anterior
                if (testDate > new Date()) {
                  testDate.setFullYear(currentYear - 1);
                }
                
                // VALIDAÇÃO CRÍTICA: Rejeitar anos impossíveis
                if (testDate.getFullYear() >= 2020 && testDate.getFullYear() <= 2030) {
                  parsedDate = testDate;
                  console.log(`📅 [SYNC-LEADS] Data brasileira parseada: ${dateStr} → ${testDate.toISOString().split('T')[0]}`);
                }
              }
            } else {
              // Tentar outros formatos
              const testDate = new Date(dateStr);
              if (!isNaN(testDate.getTime()) && testDate.getFullYear() >= 2020 && testDate.getFullYear() <= 2030) {
                parsedDate = testDate;
              }
            }
          } catch (dateError) {
            console.warn(`⚠️ [SYNC-LEADS] Erro ao parsear data do lead ${index}:`, dateError);
          }
        }

        // Construir lead processado com validação
        const processedLead: ProcessedLead = {
          row_number: index +1,
          data: String(rawLead.data || ''),
          Hora: String(rawLead.Hora || rawLead.hora || ''),
          Nome: String(rawLead.Nome || rawLead.nome || ''),
          'e-mail': String(rawLead['e-mail'] || rawLead.email || ''),
          Whatsapp: String(rawLead.Whatsapp || rawLead.whatsapp || rawLead.telefone || ''),
          origem: String(rawLead.origem || rawLead.origem || rawLead.source || ''),
          Status: String(rawLead.Status || rawLead.status || ''),
          Closer: String(rawLead.Closer || rawLead.closer || ''),
          'Venda Completa': parseMonetaryValue(rawLead['Venda Completa'] || rawLead.vendaCompleta || rawLead.venda_completa),
          recorrente: parseMonetaryValue(rawLead.recorrente || rawLead.recorrente),
          Valor: rawLead.Valor || rawLead.valor,
          Produto: String(rawLead.Produto || rawLead.produto || ''),
          'Coluna 1': String(rawLead['Coluna 1'] || rawLead.coluna1 || ''),
          parsedDate
        };

        // Validação mínima: pelo menos Nome ou Status deve existir
        if (processedLead.Nome?.trim() || processedLead.Status?.trim()) {
          processedLeads.push(processedLead);
          processedCount++;
        } else {
          console.warn(`⚠️ [SYNC-LEADS] Lead ${index} rejeitado - sem Nome nem Status válidos`);
          errorCount++;
        }

      } catch (leadError) {
        console.error(`❌ [SYNC-LEADS] Erro processando lead ${index}:`, leadError);
        errorCount++;
      }
    }

    console.log(`✅ [SYNC-LEADS] Processamento concluído: ${processedCount} sucessos, ${errorCount} erros`);

    if (processedLeads.length === 0) {
      throw new Error('Nenhum lead válido foi processado');
    }

    // CORREÇÃO 6: Salvar no cache com metadata atualizada
    console.log('💾 [SYNC-LEADS] Salvando no cache...');

    // Converter datas para ISO string antes de salvar
    const leadsForStorage = processedLeads.map(lead => ({
      ...lead,
      parsedDate: lead.parsedDate ? lead.parsedDate.toISOString() : undefined
    }));

    // Inserir cache dos leads
    const { error: cacheInsertError } = await supabase
      .from('leads_cache')
      .insert({
        raw_data: rawLeads,
        processed_leads: leadsForStorage,
        leads_count: processedLeads.length
      });

    if (cacheInsertError) {
      console.error('❌ [SYNC-LEADS] Erro ao inserir cache:', cacheInsertError);
      throw new Error(`Erro no cache: ${cacheInsertError.message}`);
    }

    // Atualizar metadata
    const { error: metadataError } = await supabase
      .from('cache_metadata')
      .upsert({
        cache_type: 'leads',
        last_webhook_sync: new Date().toISOString(),
        last_cache_update: new Date().toISOString(),
        webhook_hash: `hash-${Date.now()}`,
        total_records: processedLeads.length,
        is_valid: true
      }, {
        onConflict: 'cache_type'
      });

    if (metadataError) {
      console.error('❌ [SYNC-LEADS] Erro ao atualizar metadata:', metadataError);
    }

    console.log('🎉 [SYNC-LEADS] Sincronização concluída com sucesso!');

    return new Response(JSON.stringify({
      success: true,
      source: 'webhook',
      totalLeads: processedLeads.length,
      processedCount,
      errorCount,
      message: 'Dados sincronizados com sucesso'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 [SYNC-LEADS] Erro crítico:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
