
import { supabaseLogger } from './supabaseLogger';
import { webhookCache } from './webhook/webhookCache';
import { WebhookFetcher } from './webhook/webhookFetcher';
import { WebhookProcessor } from './webhook/webhookProcessor';
import type { Lead } from '@/types/lead';

const fetcher = new WebhookFetcher();
const processor = new WebhookProcessor();

export const webhookService = {
  async getAllWebhookData(): Promise<Lead[]> {
    const sessionId = `webhook-direct-${Date.now()}`;
    
    // Verificar cache primeiro
    const cachedData = webhookCache.get();
    if (cachedData) {
      console.log('📦 Retornando dados do cache');
      await supabaseLogger.log({
        level: 'info',
        message: '📦 DADOS RETORNADOS DO CACHE',
        data: { 
          totalLeads: cachedData.length,
          cacheAge: webhookCache.getStatus().age
        },
        source: 'webhook-service-cache',
        sessionId
      });
      return cachedData;
    }

    console.log('🔄 Buscando dados diretamente do webhook...');
    
    try {
      const rawData = await fetcher.fetchData(sessionId);
      const leads = await processor.processData(rawData, sessionId);
      
      // Atualizar cache
      webhookCache.set(leads);

      await supabaseLogger.log({
        level: 'info',
        message: '🎯 CACHE ATUALIZADO COM SUCESSO',
        data: { totalLeads: leads.length },
        source: 'webhook-service',
        sessionId
      });

      console.log(`✅ ${leads.length} leads processados e armazenados em cache`);
      return leads;

    } catch (error) {
      console.error('❌ Erro ao buscar dados do webhook:', error);
      
      // Tentar fallback do cache
      const fallbackData = webhookCache.getFallbackData();
      if (fallbackData && fallbackData.length > 0) {
        console.log('⚠️ Usando cache expirado como fallback');
        
        await supabaseLogger.log({
          level: 'warn',
          message: '⚠️ USANDO CACHE EXPIRADO COMO FALLBACK',
          data: { totalLeads: fallbackData.length },
          source: 'webhook-service-fallback',
          sessionId
        });
        
        return fallbackData;
      }

      console.log('❌ Sem dados disponíveis - retornando array vazio');
      return [];
    }
  },

  async forceReprocessData(): Promise<Lead[]> {
    console.log('🔄 Forçando limpeza de cache e recarregamento...');
    
    webhookCache.clear();
    
    await supabaseLogger.log({
      level: 'info',
      message: '🗑️ CACHE LIMPO - FORÇANDO RECARREGAMENTO',
      data: { action: 'force_reload' },
      source: 'webhook-service'
    });
    
    return await this.getAllWebhookData();
  },

  getCacheStatus() {
    return webhookCache.getStatus();
  },

  clearCache() {
    webhookCache.clear();
    console.log('🗑️ Cache limpo manualmente');
  }
};
