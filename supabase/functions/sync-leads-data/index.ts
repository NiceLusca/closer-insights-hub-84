
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WEBHOOK_URL = 'https://bot-belas-n8n.9csrtv.easypanel.host/webhook/leads-closer-oceanoazul';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔄 Iniciando sincronização em background...');

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
        console.log(`⏰ Cache ainda válido (${diffMinutes.toFixed(1)} min), pulando sincronização`);
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
    console.log('🌐 Buscando dados do webhook...');
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

    console.log(`📊 Processando ${dataArray.length} registros do webhook...`);

    // Processar dados (versão simplificada para a Edge Function)
    const processedLeads = dataArray.map((item, index) => ({
      id: index + 1,
      Status: item.Status || item.status || '',
      Closer: item.Closer || item.closer || '',
      origem: item.origem || item.source || '',
      Produto: item.Produto || item.produto || '',
      Valor: item.Valor || item.valor || 0,
      parsedDate: item.data_lead ? new Date(item.data_lead) : new Date(),
      // Mapear outros campos conforme necessário
    })).filter(lead => lead.Status && lead.Status.trim() !== '');

    // Salvar no cache
    const { error: cacheError } = await supabase
      .from('leads_cache')
      .insert({
        raw_data: dataArray,
        processed_leads: processedLeads,
        leads_count: processedLeads.length
      });

    if (cacheError) {
      console.error('❌ Erro ao salvar cache:', cacheError);
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
      console.error('❌ Erro ao atualizar metadata:', metaError);
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
      
      console.log(`🧹 ${idsToDelete.length} registros antigos removidos`);
    }

    console.log(`✅ Sincronização concluída: ${processedLeads.length} leads processados`);

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
    console.error('❌ Erro na sincronização:', error);
    
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
