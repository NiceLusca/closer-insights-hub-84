
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

  console.log('🚀 [SYNC-LEADS] === CORREÇÃO EMERGENCIAL FASE 7 ===');
  console.log('🚀 [SYNC-LEADS] Iniciando sincronização corrigida...');

  try {
    // CORREÇÃO CRÍTICA: Inicializar Supabase antes de qualquer uso
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    // CORREÇÃO: Criar cliente com variáveis corretas
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const { force = false } = body;

    console.log('🔄 [SYNC-LEADS] Força atualização:', force);

    // CORREÇÃO: URL do webhook atualizada e verificada
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

    // FASE 2 - Parser de Dados Melhorado
    let processedLeads: LeadData[] = [];
    
    if (Array.isArray(webhookData)) {
      processedLeads = webhookData.map((lead, index) => {
        // CORREÇÃO CRÍTICA: Parser de data super flexível
        let parsedDate = null;
        const possibleDateFields = ['data', 'Data', 'date', 'timestamp', 'created_at', 'Data de criação'];
        
        for (const field of possibleDateFields) {
          if (lead[field]) {
            try {
              // Tentar parsing direto primeiro
              const testDate = new Date(lead[field]);
              if (!isNaN(testDate.getTime()) && testDate.getFullYear() >= 2020) {
                parsedDate = testDate;
                break;
              }
              
              // NOVO: Parser para formato brasileiro "DD MMM" melhorado
              const brazilianDate = lead[field].toString().toLowerCase();
              const monthMap: {[key: string]: string} = {
                'jan': '01', 'janeiro': '01', 'fev': '02', 'fevereiro': '02',
                'mar': '03', 'março': '03', 'abr': '04', 'abril': '04',
                'mai': '05', 'maio': '05', 'jun': '06', 'junho': '06',
                'jul': '07', 'julho': '07', 'ago': '08', 'agosto': '08',
                'set': '09', 'setembro': '09', 'out': '10', 'outubro': '10',
                'nov': '11', 'novembro': '11', 'dez': '12', 'dezembro': '12'
              };
              
              // Detectar "17 jun", "24 abr", etc.
              const match = brazilianDate.match(/(\d{1,2})\s+([a-záêç]+)/);
              if (match) {
                const [, day, monthName] = match;
                const monthNum = monthMap[monthName] || monthMap[monthName.slice(0, 3)];
                if (monthNum) {
                  const currentYear = new Date().getFullYear();
                  const testYear = currentYear; // Assumir ano atual primeiro
                  parsedDate = new Date(`${testYear}-${monthNum}-${day.padStart(2, '0')}`);
                  if (!isNaN(parsedDate.getTime())) break;
                }
              }
              
              // Fallback: tentar DD/MM/YYYY ou DD/MM
              const dateMatch = brazilianDate.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
              if (dateMatch) {
                const [, day, month, year] = dateMatch;
                const fullYear = year || new Date().getFullYear();
                parsedDate = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
                if (!isNaN(parsedDate.getTime())) break;
              }
            } catch (e) {
              continue;
            }
          }
        }

        // FASE 4 - Parsing de valores monetários super flexível
        const parseValue = (value: any): number => {
          if (!value) return 0;
          if (typeof value === 'number') return Math.max(0, value);
          
          const str = value.toString().trim();
          if (!str || str === '0' || str === '-') return 0;
          
          // Remover símbolos de moeda e espaços
          let cleaned = str.replace(/[R$\s]/g, '');
          
          // NOVO: Detectar formato brasileiro vs internacional
          if (cleaned.includes(',') && cleaned.includes('.')) {
            // Formato: 1.500,50 (brasileiro) vs 1,500.50 (internacional)
            const lastComma = cleaned.lastIndexOf(',');
            const lastDot = cleaned.lastIndexOf('.');
            
            if (lastComma > lastDot) {
              // Formato brasileiro: 1.500,50
              cleaned = cleaned.replace(/\./g, '').replace(',', '.');
            } else {
              // Formato internacional: 1,500.50
              cleaned = cleaned.replace(/,/g, '');
            }
          } else if (cleaned.includes(',')) {
            // Só vírgula: pode ser decimal (1,50) ou milhares (1,500)
            const commaParts = cleaned.split(',');
            if (commaParts.length === 2 && commaParts[1].length <= 2) {
              // Decimal: 1,50
              cleaned = cleaned.replace(',', '.');
            } else {
              // Milhares: 1,500
              cleaned = cleaned.replace(/,/g, '');
            }
          }
          
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) ? 0 : Math.max(0, parsed);
        };

        // CORREÇÃO: Parsing de hora melhorado para timestamp
        let hourTimestamp = null;
        if (lead.Hora) {
          const hourStr = lead.Hora.toString().toLowerCase();
          const hourMatch = hourStr.match(/(\d{1,2})(?:h(\d{0,2})?|:(\d{2}))?/);
          if (hourMatch) {
            const hour = parseInt(hourMatch[1]);
            const minute = parseInt(hourMatch[2] || hourMatch[3] || '0');
            
            if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
              if (parsedDate) {
                const dateWithTime = new Date(parsedDate);
                dateWithTime.setHours(hour, minute, 0, 0);
                hourTimestamp = dateWithTime;
              }
            }
          }
        }

        return {
          ...lead,
          parsedDate: hourTimestamp || parsedDate,
          Valor: parseValue(lead.Valor || lead['Venda Completa'] || lead.valor || lead['Receita Total']),
          recorrente: parseValue(lead.recorrente || lead.Recorrente || lead.mensalidade || lead['Valor Recorrente']),
          // CORREÇÃO: Garantir campos obrigatórios com fallbacks
          Nome: lead.Nome || lead.nome || lead.Cliente || `Lead ${index + 1}`,
          Status: lead.Status || lead.status || lead.Situacao || 'Novo',
          origem: lead.origem || lead.Origem || lead.source || lead.Source || 'Não informado',
          Closer: lead.Closer || lead.closer || lead.Vendedor || lead.vendedor || 'Não atribuído',
          data: lead.data || lead.Data || (parsedDate ? parsedDate.toISOString().split('T')[0] : ''),
          // NOVO: Campos para debugging
          _originalData: lead.data || lead.Data,
          _parsedSuccess: !!parsedDate,
          _valorOriginal: lead.Valor || lead['Venda Completa'],
          _recorrenteOriginal: lead.recorrente || lead.Recorrente
        };
      });
    }

    console.log('📊 [SYNC-LEADS] Leads processados:', processedLeads.length);
    
    // ESTATÍSTICAS de parsing para debug
    const parseStats = {
      totalLeads: processedLeads.length,
      comData: processedLeads.filter(l => l.parsedDate).length,
      comValor: processedLeads.filter(l => l.Valor > 0).length,
      comRecorrente: processedLeads.filter(l => l.recorrente > 0).length,
      statusFechado: processedLeads.filter(l => 
        l.Status?.toLowerCase().includes('fechou') || 
        l.Status?.toLowerCase().includes('vendido') ||
        l.Status?.toLowerCase().includes('cliente')
      ).length
    };
    
    console.log('📈 [SYNC-LEADS] ESTATÍSTICAS:', parseStats);

    // FASE 5 - Salvar no cache com validação
    const cacheData = {
      raw_data: webhookData,
      processed_leads: processedLeads,
      leads_count: processedLeads.length,
      parse_stats: parseStats,
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

    console.log('✅ [SYNC-LEADS] SINCRONIZAÇÃO FASE 7 CONCLUÍDA!');
    console.log('📊 [SYNC-LEADS] Dados processados e salvos:', processedLeads.length);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Leads sincronizados com correção fase 7',
        totalLeads: processedLeads.length,
        parseStats: parseStats,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ [SYNC-LEADS] ERRO FASE 7:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        phase: 'Fase 7 - Correção crítica',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
