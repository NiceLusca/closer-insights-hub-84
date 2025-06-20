
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
  processed_leads: any; // JSON from Supabase
  leads_count: number;
  created_at: string;
  updated_at: string;
}

// Função type-safe para converter JSON do Supabase para Lead[]
function convertSupabaseLeadsToLocal(supabaseLeads: any[]): Lead[] {
  if (!Array.isArray(supabaseLeads)) {
    console.warn('⚠️ Dados do Supabase não são um array:', typeof supabaseLeads);
    return [];
  }

  return supabaseLeads.map((item, index) => {
    try {
      // Conversão segura de parsedDate
      let parsedDate: Date | undefined;
      if (item.parsedDate) {
        if (typeof item.parsedDate === 'string') {
          const date = new Date(item.parsedDate);
          parsedDate = isNaN(date.getTime()) ? undefined : date;
        } else if (item.parsedDate instanceof Date) {
          parsedDate = item.parsedDate;
        }
      }

      // Construir lead com valores padrão seguros
      const lead: Lead = {
        row_number: item.row_number || index + 1,
        data: item.data || '',
        Hora: item.Hora || '',
        Nome: item.Nome || '',
        'e-mail': item['e-mail'] || '',
        Whatsapp: item.Whatsapp || '',
        origem: item.origem || '',
        Status: item.Status || '',
        Closer: item.Closer || '',
        'Venda Completa': typeof item['Venda Completa'] === 'number' ? item['Venda Completa'] : 0,
        recorrente: typeof item.recorrente === 'number' ? item.recorrente : 0,
        Valor: item.Valor,
        Produto: item.Produto,
        'Coluna 1': item['Coluna 1'],
        parsedDate
      };

      return lead;
    } catch (error) {
      console.error(`❌ Erro convertendo lead ${index}:`, error, item);
      // Retornar lead básico em caso de erro
      return {
        row_number: index + 1,
        data: '',
        Hora: '',
        Nome: item.Nome || `Lead ${index + 1}`,
        'e-mail': '',
        Whatsapp: '',
        origem: '',
        Status: '',
        Closer: '',
        'Venda Completa': 0,
        recorrente: 0,
        parsedDate: undefined
      } as Lead;
    }
  }).filter(lead => lead.Nome?.trim() || lead.Status?.trim()); // Filtrar leads válidos
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
        console.log('📦 [SUPABASE-CACHE] Cache metadata não encontrado');
        return false;
      }

      const lastSync = new Date(data.last_webhook_sync);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastSync.getTime()) / (1000 * 60);

      const isValid = data.is_valid && diffMinutes < this.CACHE_DURATION_MINUTES;
      
      console.log(`📦 [SUPABASE-CACHE] Cache válido: ${isValid} (${diffMinutes.toFixed(1)} min atrás)`);
      return isValid;
    } catch (error) {
      console.error('❌ [SUPABASE-CACHE] Erro ao verificar validade do cache:', error);
      return false;
    }
  }

  // Buscar leads do cache com conversão type-safe
  static async getLeadsFromCache(): Promise<Lead[] | null> {
    try {
      console.log('📦 [SUPABASE-CACHE] Buscando leads do cache...');
      
      const { data, error } = await supabase
        .from('leads_cache')
        .select('processed_leads, leads_count, updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.log('📦 [SUPABASE-CACHE] Cache vazio ou erro:', error?.message);
        return null;
      }

      // Validação dos dados antes da conversão
      if (!data.processed_leads) {
        console.warn('⚠️ [SUPABASE-CACHE] processed_leads é null/undefined');
        return null;
      }

      // Conversão type-safe dos dados JSON para Lead[]
      const leads = convertSupabaseLeadsToLocal(data.processed_leads as any[]);
      
      console.log(`✅ [SUPABASE-CACHE] ${leads.length} leads carregados do cache (${data.updated_at})`);
      
      // Validação final
      if (leads.length === 0) {
        console.warn('⚠️ [SUPABASE-CACHE] Nenhum lead válido após conversão');
        return null;
      }
      
      return leads;
    } catch (error) {
      console.error('❌ [SUPABASE-CACHE] Erro ao buscar leads do cache:', error);
      return null;
    }
  }

  // Salvar leads no cache (já não precisamos mais desta função no frontend)
  static async saveLeadsToCache(rawData: any[], processedLeads: Lead[]): Promise<boolean> {
    try {
      console.log(`💾 [SUPABASE-CACHE] Salvando ${processedLeads.length} leads no cache...`);
      
      // Converter leads para formato JSON safe
      const leadsForStorage = processedLeads.map(lead => ({
        ...lead,
        parsedDate: lead.parsedDate ? lead.parsedDate.toISOString() : undefined
      }));
      
      // Calcular hash dos dados para detectar mudanças
      const dataHash = this.calculateHash(rawData);
      
      // Salvar leads processados
      const { error: cacheError } = await supabase
        .from('leads_cache')
        .insert({
          raw_data: rawData as any,
          processed_leads: leadsForStorage as any,
          leads_count: processedLeads.length
        });

      if (cacheError) {
        console.error('❌ [SUPABASE-CACHE] Erro ao salvar cache dos leads:', cacheError);
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
        console.error('❌ [SUPABASE-CACHE] Erro ao atualizar metadata:', metaError);
        return false;
      }

      console.log('✅ [SUPABASE-CACHE] Cache salvo com sucesso');
      return true;
    } catch (error) {
      console.error('❌ [SUPABASE-CACHE] Erro ao salvar no cache:', error);
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
      
      console.log('🗑️ [SUPABASE-CACHE] Cache invalidado');
    } catch (error) {
      console.error('❌ [SUPABASE-CACHE] Erro ao invalidar cache:', error);
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
        
        console.log(`🧹 [SUPABASE-CACHE] ${idsToDelete.length} registros antigos removidos`);
      }
    } catch (error) {
      console.error('❌ [SUPABASE-CACHE] Erro ao limpar cache antigo:', error);
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
      console.error('❌ [SUPABASE-CACHE] Erro ao obter status do cache:', error);
      return {
        hasCache: false,
        lastUpdate: null,
        totalRecords: 0,
        isValid: false,
        ageMinutes: Infinity
      };
    }
  }

  // Sincronização forçada via Edge Function
  static async forceSyncViaEdgeFunction(): Promise<Lead[]> {
    try {
      console.log('🔄 [SUPABASE-CACHE] Forçando sincronização via Edge Function...');
      
      // Invalidar cache atual
      await this.invalidateCache();
      
      // Chamar Edge Function para sincronizar
      const { data, error } = await supabase.functions.invoke('sync-leads-data', {
        body: { force: true }
      });

      if (error) {
        console.error('❌ [SUPABASE-CACHE] Erro na Edge Function:', error);
        throw error;
      }

      console.log('✅ [SUPABASE-CACHE] Edge Function executada com sucesso:', data);
      
      // Buscar dados atualizados do cache
      const leads = await this.getLeadsFromCache();
      return leads || [];
    } catch (error) {
      console.error('❌ [SUPABASE-CACHE] Erro na sincronização forçada:', error);
      throw error;
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
