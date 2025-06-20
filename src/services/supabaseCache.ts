
import { supabase } from '@/integrations/supabase/client';
import type { Lead } from '@/types/lead';

interface CacheMetadata {
  id: string;
  cache_type: string;
  last_webhook_sync: string;
  last_cache_update: string;
  webhook_hash: string | null;
  total_records: number;
  is_valid: boolean;
}

interface LeadsCache {
  id: string;
  raw_data: any;
  processed_leads: Lead[];
  leads_count: number;
  created_at: string;
  updated_at: string;
}

export class SupabaseCache {
  private static readonly CACHE_DURATION_MINUTES = 15;
  private static readonly CACHE_TYPE = 'leads';

  // Verificar se o cache é válido (menos de 15 minutos)
  static async isCacheValid(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('cache_metadata')
        .select('last_webhook_sync, is_valid')
        .eq('cache_type', this.CACHE_TYPE)
        .single();

      if (error || !data) {
        console.log('📦 Cache metadata não encontrado');
        return false;
      }

      const lastSync = new Date(data.last_webhook_sync);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastSync.getTime()) / (1000 * 60);

      const isValid = data.is_valid && diffMinutes < this.CACHE_DURATION_MINUTES;
      
      console.log(`📦 Cache válido: ${isValid} (${diffMinutes.toFixed(1)} min atrás)`);
      return isValid;
    } catch (error) {
      console.error('❌ Erro ao verificar validade do cache:', error);
      return false;
    }
  }

  // Buscar leads do cache
  static async getLeadsFromCache(): Promise<Lead[] | null> {
    try {
      console.log('📦 Buscando leads do cache Supabase...');
      
      const { data, error } = await supabase
        .from('leads_cache')
        .select('processed_leads, leads_count, updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.log('📦 Cache vazio ou erro:', error?.message);
        return null;
      }

      const leads = data.processed_leads as Lead[];
      console.log(`✅ ${leads.length} leads carregados do cache (${data.updated_at})`);
      
      return leads;
    } catch (error) {
      console.error('❌ Erro ao buscar leads do cache:', error);
      return null;
    }
  }

  // Salvar leads no cache
  static async saveLeadsToCache(rawData: any[], processedLeads: Lead[]): Promise<boolean> {
    try {
      console.log(`💾 Salvando ${processedLeads.length} leads no cache...`);
      
      // Calcular hash dos dados para detectar mudanças
      const dataHash = this.calculateHash(rawData);
      
      // Salvar leads processados
      const { error: cacheError } = await supabase
        .from('leads_cache')
        .insert({
          raw_data: rawData,
          processed_leads: processedLeads,
          leads_count: processedLeads.length
        });

      if (cacheError) {
        console.error('❌ Erro ao salvar cache dos leads:', cacheError);
        return false;
      }

      // Atualizar metadata
      const { error: metaError } = await supabase
        .from('cache_metadata')
        .upsert({
          cache_type: this.CACHE_TYPE,
          last_webhook_sync: new Date().toISOString(),
          last_cache_update: new Date().toISOString(),
          webhook_hash: dataHash,
          total_records: processedLeads.length,
          is_valid: true
        });

      if (metaError) {
        console.error('❌ Erro ao atualizar metadata:', metaError);
        return false;
      }

      console.log('✅ Cache salvo com sucesso no Supabase');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar no cache:', error);
      return false;
    }
  }

  // Invalidar cache
  static async invalidateCache(): Promise<void> {
    try {
      await supabase
        .from('cache_metadata')
        .update({ is_valid: false })
        .eq('cache_type', this.CACHE_TYPE);
      
      console.log('🗑️ Cache invalidado');
    } catch (error) {
      console.error('❌ Erro ao invalidar cache:', error);
    }
  }

  // Limpar cache antigo (manter só os últimos 5 registros)
  static async cleanOldCache(): Promise<void> {
    try {
      const { data: oldRecords } = await supabase
        .from('leads_cache')
        .select('id')
        .order('updated_at', { ascending: false })
        .range(5, 100); // Buscar do 6º em diante

      if (oldRecords && oldRecords.length > 0) {
        const idsToDelete = oldRecords.map(r => r.id);
        await supabase
          .from('leads_cache')
          .delete()
          .in('id', idsToDelete);
        
        console.log(`🧹 ${idsToDelete.length} registros antigos removidos do cache`);
      }
    } catch (error) {
      console.error('❌ Erro ao limpar cache antigo:', error);
    }
  }

  // Obter status do cache
  static async getCacheStatus(): Promise<{
    hasCache: boolean;
    lastUpdate: Date | null;
    totalRecords: number;
    isValid: boolean;
    ageMinutes: number;
  }> {
    try {
      const { data } = await supabase
        .from('cache_metadata')
        .select('last_webhook_sync, total_records, is_valid')
        .eq('cache_type', this.CACHE_TYPE)
        .single();

      if (!data) {
        return {
          hasCache: false,
          lastUpdate: null,
          totalRecords: 0,
          isValid: false,
          ageMinutes: Infinity
        };
      }

      const lastUpdate = new Date(data.last_webhook_sync);
      const ageMinutes = (new Date().getTime() - lastUpdate.getTime()) / (1000 * 60);

      return {
        hasCache: true,
        lastUpdate,
        totalRecords: data.total_records,
        isValid: data.is_valid,
        ageMinutes
      };
    } catch (error) {
      console.error('❌ Erro ao obter status do cache:', error);
      return {
        hasCache: false,
        lastUpdate: null,
        totalRecords: 0,
        isValid: false,
        ageMinutes: Infinity
      };
    }
  }

  // Calcular hash simples dos dados
  private static calculateHash(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
}
