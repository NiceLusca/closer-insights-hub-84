
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { extractDateFromLeadData } from '../../../src/utils/date/brazilianDateConverter.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  )

  try {
    console.log('🚀 [SYNC-LEADS] === EDGE FUNCTION CORRIGIDA (FASE 6) ===')
    
    const { force = false } = await req.json()
    console.log('🔧 [SYNC-LEADS] Modo forçado:', force)
    
    // Buscar dados do webhook
    console.log('📦 [SYNC-LEADS] Buscando dados do webhook...')
    const { data: webhookData, error: webhookError } = await supabase
      .from('webhook_raw_data')
      .select('raw_data, id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (webhookError) {
      console.error('❌ [SYNC-LEADS] Erro ao buscar webhook:', webhookError)
      throw new Error(`Erro webhook: ${webhookError.message}`)
    }

    if (!webhookData?.raw_data) {
      console.log('📭 [SYNC-LEADS] Nenhum dado encontrado')
      return new Response(
        JSON.stringify({ success: false, message: 'Nenhum dado encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const rawLeads = Array.isArray(webhookData.raw_data) ? webhookData.raw_data : []
    console.log('🔍 [SYNC-LEADS] Total de leads brutos:', rawLeads.length)
    console.log('📊 [SYNC-LEADS] Processando leads...')

    const processedLeads = []
    const errors = []

    for (let index = 0; index < rawLeads.length; index++) {
      const item = rawLeads[index]
      
      try {
        // Validação básica
        if (!item || typeof item !== 'object') {
          errors.push(`Lead ${index} inválido`)
          continue
        }

        // CORREÇÃO CRÍTICA: Função melhorada para valores seguros
        const getSafeValue = (key: string, fallback: any = '') => {
          const value = item[key]
          return value !== undefined && value !== null ? String(value).trim() : fallback
        }

        const getSafeNumber = (key: string, fallback: number = 0): number => {
          const value = item[key]
          if (typeof value === 'number' && !isNaN(value)) return value
          if (typeof value === 'string' && value.trim()) {
            // Limpar e converter valores monetários brasileiros
            const cleaned = value.replace(/[^\d,.-]/g, '')
            let normalized = cleaned
            
            // Tratar formato brasileiro (1.234,56)
            if (normalized.includes(',') && !normalized.includes('.')) {
              normalized = normalized.replace(',', '.')
            } else if (normalized.includes('.') && normalized.includes(',')) {
              normalized = normalized.replace(/\./g, '').replace(',', '.')
            }
            
            const parsed = parseFloat(normalized)
            return isNaN(parsed) ? fallback : Math.max(0, parsed)
          }
          return fallback
        }

        // CORREÇÃO: Extrair data usando função melhorada
        let parsedDate: Date | undefined
        const extractedDateStr = extractDateFromLeadData(item)
        
        if (extractedDateStr) {
          try {
            parsedDate = new Date(extractedDateStr)
            if (isNaN(parsedDate.getTime())) {
              parsedDate = undefined
            }
          } catch (e) {
            parsedDate = undefined
          }
        }

        // Construir lead processado
        const processedLead = {
          row_number: getSafeNumber('row_number', index + 1),
          data: getSafeValue('data'),
          Hora: getSafeValue('Hora'),
          Nome: getSafeValue('Nome'),
          'e-mail': getSafeValue('e-mail') || getSafeValue('email'),
          Whatsapp: getSafeValue('Whatsapp') || getSafeValue('whatsapp'),
          origem: getSafeValue('origem') || getSafeValue('Origem'),
          Status: getSafeValue('Status') || getSafeValue('status'),
          Closer: getSafeValue('Closer') || getSafeValue('closer'),
          'Venda Completa': getSafeNumber('Venda Completa') || getSafeNumber('venda_completa') || getSafeNumber('Valor'),
          recorrente: getSafeNumber('recorrente') || getSafeNumber('Recorrente') || getSafeNumber('mensalidade'),
          Valor: getSafeValue('Valor'),
          Produto: getSafeValue('Produto'),
          'Coluna 1': getSafeValue('Coluna 1'),
          parsedDate
        }

        // Validação final - deve ter pelo menos Nome ou Status
        if (processedLead.Nome || processedLead.Status) {
          processedLeads.push(processedLead)
        } else {
          console.warn(`⚠️ [SYNC-LEADS] Lead ${index} rejeitado - sem Nome nem Status válidos`)
          errors.push(`Lead ${index} sem dados mínimos`)
        }

      } catch (error) {
        console.error(`❌ [SYNC-LEADS] Erro processando lead ${index}:`, error)
        errors.push(`Lead ${index}: ${error.message}`)
      }
    }

    console.log(`✅ [SYNC-LEADS] Processamento concluído: ${processedLeads.length} sucessos, ${errors.length} erros`)

    // Salvar no cache
    console.log('💾 [SYNC-LEADS] Salvando no cache...')
    
    // Salvar leads processados
    const { error: cacheError } = await supabase
      .from('leads_cache')
      .insert({
        raw_data: rawLeads,
        processed_leads: processedLeads,
        leads_count: processedLeads.length
      })

    if (cacheError) {
      console.error('❌ [SYNC-LEADS] Erro ao salvar cache:', cacheError)
    }

    // Atualizar metadata
    const { error: metaError } = await supabase
      .from('cache_metadata')
      .upsert({
        cache_type: 'leads',
        last_webhook_sync: new Date().toISOString(),
        last_cache_update: new Date().toISOString(),
        webhook_hash: Date.now().toString(),
        total_records: processedLeads.length,
        is_valid: true
      }, {
        onConflict: 'cache_type'
      })

    if (metaError) {
      console.error('❌ [SYNC-LEADS] Erro metadata:', metaError)
    }

    console.log('🎉 [SYNC-LEADS] Sincronização concluída com sucesso!')
    
    return new Response(
      JSON.stringify({
        success: true,
        processed: processedLeads.length,
        errors: errors.length,
        message: `${processedLeads.length} leads processados com sucesso`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('💀 [SYNC-LEADS] Erro crítico:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Erro na sincronização'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
