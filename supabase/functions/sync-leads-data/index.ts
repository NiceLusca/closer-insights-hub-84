
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LeadData {
  [key: string]: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🚀 [SYNC-LEADS] === CORREÇÃO EMERGENCIAL FASE 5 ===');
  console.log('🚀 [SYNC-LEADS] Iniciando sincronização de leads...');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabase, supabaseServiceKey);

    const body = await req.json();
    const { force = false } = body;

    console.log('🔄 [SYNC-LEADS] Força atualização:', force);

    // CORREÇÃO CRÍTICA: URL do webhook atualizada
    const webhookUrl = 'https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjUwNTZlMDYzNTA0MzM1MjZlNTUzODUxMzQi_pc';
    
    console.log('📡 [SYNC-LEADS] Fazendo requisição ao webhook...');
    
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Supabase-Edge-Function/1.0'
      },
      body: JSON.stringify({ 
        action: 'sync_leads',
        timestamp: new Date().toISOString(),
        force: force
      })
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook failed: ${webhookResponse.status} ${webhookResponse.statusText}`);
    }

    const webhookData = await webhookResponse.json();
    console.log('✅ [SYNC-LEADS] Webhook response OK, dados recebidos:', Array.isArray(webhookData) ? webhookData.length : 'N/A');

    // CORREÇÃO CRÍTICA: Processar dados com parsing melhorado
    let processedLeads: LeadData[] = [];
    
    if (Array.isArray(webhookData)) {
      processedLeads = webhookData.map((lead, index) => {
        // CORREÇÃO: Parsing de data mais flexível
        let parsedDate = null;
        const possibleDateFields = ['data', 'Data', 'date', 'timestamp', 'created_at'];
        
        for (const field of possibleDateFields) {
          if (lead[field]) {
            try {
              // Tentar parsing direto
              const testDate = new Date(lead[field]);
              if (!isNaN(testDate.getTime()) && testDate.getFullYear() >= 2020) {
                parsedDate = testDate;
                break;
              }
              
              // Tentar formato brasileiro "DD MMM" -> "2024-MM-DD"
              const brazilianDate = lead[field].toString().toLowerCase();
              const monthMap: {[key: string]: string} = {
                'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04',
                'mai': '05', 'jun': '06', 'jul': '07', 'ago': '08',
                'set': '09', 'out': '10', 'nov': '11', 'dez': '12'
              };
              
              const match = brazilianDate.match(/(\d{1,2})\s+([a-z]+)/);
              if (match) {
                const [, day, month] = match;
                const monthNum = monthMap[month.slice(0, 3)];
                if (monthNum) {
                  const currentYear = new Date().getFullYear();
                  parsedDate = new Date(`${currentYear}-${monthNum}-${day.padStart(2, '0')}`);
                  if (!isNaN(parsedDate.getTime())) break;
                }
              }
            } catch (e) {
              continue;
            }
          }
        }

        // CORREÇÃO: Parsing de valores monetários melhorado
        const parseValue = (value: any): number => {
          if (!value) return 0;
          if (typeof value === 'number') return Math.max(0, value);
          
          const str = value.toString().replace(/[^\d,.-]/g, '');
          if (!str) return 0;
          
          // Formato brasileiro: 1.500,50
          if (str.includes(',') && str.indexOf(',') > str.lastIndexOf('.')) {
            const normalized = str.replace(/\./g, '').replace(',', '.');
            return Math.max(0, parseFloat(normalized) || 0);
          }
          
          return Math.max(0, parseFloat(str.replace(/,/g, '')) || 0);
        };

        return {
          ...lead,
          parsedDate,
          Valor: parseValue(lead.Valor || lead['Venda Completa'] || lead.valor),
          recorrente: parseValue(lead.recorrente || lead.Recorrente || lead.mensalidade),
          // Garantir campos obrigatórios
          Nome: lead.Nome || lead.nome || `Lead ${index + 1}`,
          Status: lead.Status || lead.status || 'Novo',
          origem: lead.origem || lead.Origem || 'Não informado',
          Closer: lead.Closer || lead.closer || 'Não atribuído'
        };
      });
    }

    console.log('📊 [SYNC-LEADS] Leads processados:', processedLeads.length);

    // CORREÇÃO: Salvar no cache Supabase com timestamp
    const cacheData = {
      raw_data: webhookData,
      processed_leads: processedLeads,
      leads_count: processedLeads.length,
      updated_at: new Date().toISOString()
    };

    // Limpar cache antigo
    await supabase.from('leads_cache').delete().gte('created_at', '1900-01-01');
    
    // Inserir novo cache
    const { error: cacheError } = await supabase
      .from('leads_cache')
      .insert(cacheData);

    if (cacheError) {
      console.error('❌ [SYNC-LEADS] Erro ao salvar cache:', cacheError);
      throw cacheError;
    }

    // Atualizar metadata
    await supabase.from('cache_metadata').delete().gte('created_at', '1900-01-01');
    await supabase.from('cache_metadata').insert({
      cache_type: 'leads',
      last_webhook_sync: new Date().toISOString(),
      last_cache_update: new Date().toISOString(),
      total_records: processedLeads.length,
      is_valid: true,
      webhook_hash: 'webhook_' + Date.now()
    });

    console.log('✅ [SYNC-LEADS] SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('📊 [SYNC-LEADS] Total de leads sincronizados:', processedLeads.length);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Leads sincronizados com sucesso',
        totalLeads: processedLeads.length,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ [SYNC-LEADS] ERRO CRÍTICO:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
