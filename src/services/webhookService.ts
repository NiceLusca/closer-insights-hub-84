
import { SupabaseCache } from './supabaseCache';

/**
 * @deprecated WebhookService foi substituído pelo SupabaseCache
 * Este serviço está sendo mantido apenas para compatibilidade com código legado.
 * Migre para SupabaseCache para melhor performance e consistência.
 */

console.warn('⚠️ webhookService está deprecated. Use SupabaseCache em vez disso.');

export const webhookService = {
  async getAllWebhookData() {
    console.warn('⚠️ webhookService.getAllWebhookData está deprecated. Use SupabaseCache.getLeadsFromCache()');
    
    try {
      const leads = await SupabaseCache.getLeadsFromCache();
      return leads || [];
    } catch (error) {
      console.error('❌ Erro no webhook service (deprecated):', error);
      return [];
    }
  },

  async forceReprocessData() {
    console.warn('⚠️ webhookService.forceReprocessData está deprecated. Use SupabaseCache.forceSyncViaEdgeFunction()');
    
    try {
      return await SupabaseCache.forceSyncViaEdgeFunction();
    } catch (error) {
      console.error('❌ Erro no webhook service (deprecated):', error);
      return [];
    }
  },

  getCacheStatus() {
    console.warn('⚠️ webhookService.getCacheStatus está deprecated. Use SupabaseCache.getCacheStatus()');
    
    return {
      cached: false,
      age: 0,
      expired: true,
      totalLeads: 0
    };
  },

  clearCache() {
    console.warn('⚠️ webhookService.clearCache está deprecated. Use SupabaseCache.invalidateCache()');
    SupabaseCache.invalidateCache();
  }
};
