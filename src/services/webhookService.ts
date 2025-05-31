
import { supabaseLogger } from './supabaseLogger';
import { processRawDataToLeads } from '@/utils/lead';
import type { Lead } from '@/types/lead';

// Cache para evitar muitas chamadas ao webhook
interface CacheData {
  leads: Lead[];
  timestamp: number;
  expiresIn: number; // em milissegundos
}

let webhookCache: CacheData | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const WEBHOOK_URL = 'https://bot-belas-n8n.easypanel.host/webhook/leads-closer-oceanoazul';
const REQUEST_TIMEOUT = 15000; // 15 segundos

export const webhookService = {
  async getAllWebhookData(): Promise<Lead[]> {
    const sessionId = `webhook-direct-${Date.now()}`;
    
    // Verificar cache primeiro
    if (webhookCache && (Date.now() - webhookCache.timestamp) < webhookCache.expiresIn) {
      console.log('📦 Retornando dados do cache');
      await supabaseLogger.log({
        level: 'info',
        message: '📦 DADOS RETORNADOS DO CACHE',
        data: { 
          totalLeads: webhookCache.leads.length,
          cacheAge: Date.now() - webhookCache.timestamp
        },
        source: 'webhook-service-cache',
        sessionId
      });
      return webhookCache.leads;
    }

    console.log('🔄 Buscando dados diretamente do webhook...');
    
    try {
      await supabaseLogger.log({
        level: 'info',
        message: '🌐 INICIANDO CHAMADA PARA WEBHOOK EXTERNO',
        data: { 
          webhookUrl: WEBHOOK_URL,
          timeout: REQUEST_TIMEOUT
        },
        source: 'webhook-service',
        sessionId
      });

      // Criar AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(WEBHOOK_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();
      
      await supabaseLogger.log({
        level: 'info',
        message: '✅ WEBHOOK RESPONDEU COM SUCESSO',
        data: { 
          statusCode: response.status,
          contentType: response.headers.get('content-type'),
          dataType: typeof rawData,
          isArray: Array.isArray(rawData),
          totalRecords: Array.isArray(rawData) ? rawData.length : 1
        },
        source: 'webhook-service',
        sessionId
      });

      // Processar dados recebidos
      let dataToProcess = rawData;
      
      // Se não for array, transformar em array
      if (!Array.isArray(rawData)) {
        dataToProcess = [rawData];
      }

      console.log(`📊 Processando ${dataToProcess.length} registros do webhook...`);
      
      const leads = await processRawDataToLeads(dataToProcess, sessionId);
      
      // Atualizar cache
      webhookCache = {
        leads,
        timestamp: Date.now(),
        expiresIn: CACHE_DURATION
      };

      await supabaseLogger.log({
        level: 'info',
        message: '🎯 DADOS PROCESSADOS COM SUCESSO',
        data: {
          totalRawRecords: dataToProcess.length,
          leadsProcessados: leads.length,
          leadsComData: leads.filter(l => l.parsedDate).length,
          leadsSemData: leads.filter(l => !l.parsedDate).length,
          statusEncontrados: [...new Set(leads.map(l => l.Status).filter(Boolean))],
          origensEncontradas: [...new Set(leads.map(l => l.origem).filter(Boolean))],
          closersEncontrados: [...new Set(leads.map(l => l.Closer).filter(Boolean))],
          cacheAtualizado: true
        },
        source: 'webhook-service',
        sessionId
      });

      console.log(`✅ ${leads.length} leads processados e armazenados em cache`);
      return leads;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      console.error('❌ Erro ao buscar dados do webhook:', errorMessage);
      
      await supabaseLogger.log({
        level: 'error',
        message: '❌ ERRO NA CHAMADA DO WEBHOOK',
        data: { 
          erro: errorMessage,
          webhookUrl: WEBHOOK_URL,
          isAbortError: error.name === 'AbortError',
          isNetworkError: error instanceof TypeError
        },
        source: 'webhook-service',
        sessionId
      });

      // Se houver dados em cache mesmo expirados, usar como fallback
      if (webhookCache && webhookCache.leads.length > 0) {
        console.log('⚠️ Usando cache expirado como fallback');
        
        await supabaseLogger.log({
          level: 'warn',
          message: '⚠️ USANDO CACHE EXPIRADO COMO FALLBACK',
          data: { 
            totalLeads: webhookCache.leads.length,
            cacheAge: Date.now() - webhookCache.timestamp
          },
          source: 'webhook-service-fallback',
          sessionId
        });
        
        return webhookCache.leads;
      }

      // Se não há cache, retornar array vazio
      console.log('❌ Sem dados disponíveis - retornando array vazio');
      return [];
    }
  },

  async forceReprocessData(): Promise<Lead[]> {
    console.log('🔄 Forçando limpeza de cache e recarregamento...');
    
    // Limpar cache
    webhookCache = null;
    
    await supabaseLogger.log({
      level: 'info',
      message: '🗑️ CACHE LIMPO - FORÇANDO RECARREGAMENTO',
      data: { action: 'force_reload' },
      source: 'webhook-service'
    });
    
    // Recarregar dados
    return await this.getAllWebhookData();
  },

  // Método para verificar status do cache
  getCacheStatus() {
    if (!webhookCache) {
      return { cached: false, age: 0, expired: true };
    }
    
    const age = Date.now() - webhookCache.timestamp;
    const expired = age >= webhookCache.expiresIn;
    
    return {
      cached: true,
      age,
      expired,
      totalLeads: webhookCache.leads.length
    };
  },

  // Método para limpar cache manualmente
  clearCache() {
    webhookCache = null;
    console.log('🗑️ Cache limpo manualmente');
  }
};
