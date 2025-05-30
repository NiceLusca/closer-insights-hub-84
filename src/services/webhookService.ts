
import { supabase } from '@/integrations/supabase/client';
import { processRawDataToLeads } from '@/utils/lead';
import { supabaseLogger } from './supabaseLogger';

export const webhookService = {
  async getAllWebhookData() {
    console.log('🔍 Buscando todos os dados de webhook...');
    
    try {
      const { data, error } = await supabase
        .from('webhook_raw_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar dados de webhook:', error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} registros de webhook encontrados`);
      
      // Processar todos os dados em leads
      if (data && data.length > 0) {
        const allRawData = data.flatMap(record => {
          if (Array.isArray(record.raw_data)) {
            return record.raw_data;
          }
          return [record.raw_data];
        });

        console.log(`📊 Processando ${allRawData.length} registros de dados brutos...`);
        
        const sessionId = `webhook-service-${Date.now()}`;
        
        try {
          const leads = await processRawDataToLeads(allRawData, sessionId);
          console.log(`✅ ${leads.length} leads processados com sucesso`);
          
          // Log estatísticas de processamento
          const leadsComData = leads.filter(l => l.parsedDate).length;
          const leadsSemData = leads.length - leadsComData;
          
          await supabaseLogger.log({
            level: 'info',
            message: '📈 DADOS CARREGADOS NO DASHBOARD',
            data: {
              totalWebhookRecords: data.length,
              totalRawData: allRawData.length,
              leadsProcessados: leads.length,
              leadsComDataValida: leadsComData,
              leadsSemDataValida: leadsSemData,
              percentualComData: ((leadsComData / leads.length) * 100).toFixed(1),
              statusEncontrados: [...new Set(leads.map(l => l.Status).filter(Boolean))],
              origensEncontradas: [...new Set(leads.map(l => l.origem).filter(Boolean))],
              closersEncontrados: [...new Set(leads.map(l => l.Closer).filter(Boolean))]
            },
            source: 'webhook-service',
            sessionId
          });
          
          return leads;
        } catch (processingError) {
          console.error('❌ Erro ao processar leads:', processingError);
          
          await supabaseLogger.log({
            level: 'error',
            message: '❌ ERRO NO PROCESSAMENTO DE LEADS',
            data: { 
              erro: processingError.message,
              totalRegistros: allRawData.length
            },
            source: 'webhook-service',
            sessionId
          });
          
          // Retornar array vazio em caso de erro para não quebrar o dashboard
          return [];
        }
      }

      return [];
    } catch (error) {
      console.error('❌ Erro crítico no webhookService:', error);
      
      await supabaseLogger.log({
        level: 'error',
        message: '❌ ERRO CRÍTICO NO WEBHOOK SERVICE',
        data: { erro: error.message },
        source: 'webhook-service'
      });
      
      // Retornar array vazio para não quebrar o dashboard
      return [];
    }
  },

  async forceReprocessData() {
    console.log('🔄 Forçando reprocessamento de dados...');
    
    try {
      // Marcar todos os registros como pending para reprocessamento
      const { error } = await supabase
        .from('webhook_raw_data')
        .update({ 
          processing_status: 'pending',
          error_details: null
        })
        .neq('processing_status', 'pending');

      if (error) {
        console.error('❌ Erro ao marcar dados para reprocessamento:', error);
        throw error;
      }

      console.log('✅ Dados marcados para reprocessamento');
      
      // Recarregar dados
      return await this.getAllWebhookData();
    } catch (error) {
      console.error('❌ Erro no reprocessamento forçado:', error);
      throw error;
    }
  }
};
