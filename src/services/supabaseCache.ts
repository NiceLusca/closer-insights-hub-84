
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
  processed_leads: any;
  leads_count: number;
  created_at: string;
  updated_at: string;
}

// Função type-safe para converter JSON do Supabase para Lead[] - MELHORADA
function convertSupabaseLeadsToLocal(supabaseLeads: any[]): Lead[] {
  if (!Array.isArray(supabaseLeads)) {
    console.warn('⚠️ [SUPABASE-CACHE] Dados não são um array:', typeof supabaseLeads);
    return [];
  }

  const validLeads: Lead[] = [];
  
  for (let index = 0; index < supabaseLeads.length; index++) {
    const item = supabaseLeads[index];
    
    try {
      // Validação rigorosa dos dados essenciais
      if (!item || typeof item !== 'object') {
        console.warn(`⚠️ [SUPABASE-CACHE] Item ${index} inválido:`, item);
        continue;
      }

      // Conversão segura de parsedDate com múltiplas tentativas
      let parsedDate: Date | undefined;
      
      if (item.parsedDate) {
        try {
          if (typeof item.parsedDate === 'string') {
            const date = new Date(item.parsedDate);
            parsedDate = isNaN(date.getTime()) ? undefined : date;
          } else if (item.parsedDate instanceof Date) {
            parsedDate = item.parsedDate;
          } else if (typeof item.parsedDate === 'number') {
            parsedDate = new Date(item.parsedDate);
          }
        } catch (dateError) {
          console.warn(`⚠️ [SUPABASE-CACHE] Erro ao processar data do lead ${index}:`, dateError);
          parsedDate = undefined;
        }
      }

      // Função auxiliar para valores seguros
      const getSafeValue = (key: string, fallback: any = '') => {
        const value = item[key];
        return value !== undefined && value !== null ? value : fallback;
      };

      const getSafeNumber = (key: string, fallback: number = 0): number => {
        const value = item[key];
        if (typeof value === 'number' && !isNaN(value)) return value;
        if (typeof value === 'string') {
          const parsed = parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
          return isNaN(parsed) ? fallback : parsed;
        }
        return fallback;
      };

      // Construir lead com validação completa
      const lead: Lead = {
        row_number: getSafeNumber('row_number', index + 1),
        data: getSafeValue('data', ''),
        Hora: getSafeValue('Hora', ''),
        Nome: getSafeValue('Nome', ''),
        'e-mail': getSafeValue('e-mail', ''),
        Whatsapp: getSafeValue('Whatsapp', ''),
        origem: getSafeValue('origem', ''),
        Status: getSafeValue('Status', ''),
        Closer: getSafeValue('Closer', ''),
        'Venda Completa': getSafeNumber('Venda Completa', 0),
        recorrente: getSafeNumber('recorrente', 0),
        Valor: getSafeValue('Valor'),
        Produto: getSafeValue('Produto'),
        'Coluna 1': getSafeValue('Coluna 1'),
        parsedDate
      };

      // Validação final - pelo menos Nome ou Status deve existir
      if (lead.Nome?.trim() || lead.Status?.trim()) {
        validLeads.push(lead);
      } else {
        console.warn(`⚠️ [SUPABASE-CACHE] Lead ${index} rejeitado - sem Nome nem Status válidos`);
      }

    } catch (error) {
      console.error(`❌ [SUPABASE-CACHE] Erro crítico convertendo lead ${index}:`, error, item);
      // Não interrompe o processo, apenas pula este lead
      continue;
    }
  }

  console.log(`✅ [SUPABASE-CACHE] Conversão concluída: ${validLeads.length}/${supabaseLeads.length} leads válidos`);
  return validLeads;
}

export class SupabaseCache {
  private static readonly CACHE_DURATION_MINUTES = 15;
  private static readonly CACHE_TYPE = 'leads';

  // Verificar se o cache é válido
  static async isCacheValid(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('cache_metadata')
        .select('last_webhook_sync, is_valid')
        .eq('cache_type', this.CACHE_TYPE)
        .maybeSingle(); // CORREÇÃO: usar maybeSingle() em vez de single()

      if (error) {
        console.log('📦 [SUPABASE-CACHE] Erro ao verificar metadata:', error.message);
        return false;
      }

      if (!data) {
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

  // Buscar leads do cache com validação rigorosa
  static async getLeadsFromCache(): Promise<Lead[] | null> {
    try {
      console.log('📦 [SUPABASE-CACHE] Buscando leads do cache...');
      
      const { data, error } = await supabase
        .from('leads_cache')
        .select('processed_leads, leads_count, updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // CORREÇÃO: usar maybeSingle()

      if (error) {
        console.log('📦 [SUPABASE-CACHE] Erro ao buscar cache:', error.message);
        return null;
      }

      if (!data) {
        console.log('📦 [SUPABASE-CACHE] Cache vazio');
        return null;
      }

      // Validação rigorosa dos dados antes da conversão
      if (!data.processed_leads) {
        console.warn('⚠️ [SUPABASE-CACHE] processed_leads é null/undefined');
        return null;
      }

      // Validação adicional do tipo de dados
      if (typeof data.processed_leads !== 'object') {
        console.warn('⚠️ [SUPABASE-CACHE] processed_leads não é um objeto válido');
        return null;
      }

      // Conversão type-safe com validação rigorosa
      const leads = convertSupabaseLeadsToLocal(data.processed_leads as any[]);
      
      if (leads.length === 0) {
        console.warn('⚠️ [SUPABASE-CACHE] Nenhum lead válido após conversão');
        return null;
      }
      
      // Validação de integridade - verificar se o count bate
      if (data.leads_count && Math.abs(leads.length - data.leads_count) > 10) {
        console.warn(`⚠️ [SUPABASE-CACHE] Possível inconsistência: esperado ${data.leads_count}, obtido ${leads.length}`);
      }
      
      console.log(`✅ [SUPABASE-CACHE] ${leads.length} leads carregados do cache (${data.updated_at})`);
      return leads;
      
    } catch (error) {
      console.error('❌ [SUPABASE-CACHE] Erro ao buscar leads do cache:', error);
      return null;
    }
  }

  // Salvar leads no cache (melhorado)
  static async saveLeadsToCache(rawData: any[], processedLeads: Lead[]): Promise<boolean> {
    try {
      console.log(`💾 [SUPABASE-CACHE] Salvando ${processedLeads.length} leads no cache...`);
      
      // Validação dos dados de entrada
      if (!Array.isArray(rawData) || !Array.isArray(processedLeads)) {
        console.error('❌ [SUPABASE-CACHE] Dados inválidos para salvamento');
        return false;
      }

      if (processedLeads.length === 0) {
        console.warn('⚠️ [SUPABASE-CACHE] Tentativa de salvar 0 leads - abortando');
        return false;
      }
      
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
          raw_data: rawData,
          processed_leads: leadsForStorage,
          leads_count: processedLeads.length
        });

      if (cacheError) {
        console.error('❌ [SUPABASE-CACHE] Erro ao salvar cache dos leads:', cacheError);
        return false;
      }

      // CORREÇÃO: Usar upsert para evitar problema de constraint único
      const { error: metaError } = await supabase
        .from('cache_metadata')
        .upsert({
          cache_type: this.CACHE_TYPE,
          last_webhook_sync: new Date().toISOString(),
          last_cache_update: new Date().toISOString(),
          webhook_hash: dataHash,
          total_records: processedLeads.length,
          is_valid: true
        }, {
          onConflict: 'cache_type' // Especificar coluna de conflito
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
      const { error } = await supabase
        .from('cache_metadata')
        .update({ is_valid: false })
        .eq('cache_type', this.CACHE_TYPE);
      
      if (error) {
        console.error('❌ [SUPABASE-CACHE] Erro ao invalidar cache:', error);
      } else {
        console.log('🗑️ [SUPABASE-CACHE] Cache invalidado com sucesso');
      }
    } catch (error) {
      console.error('❌ [SUPABASE-CACHE] Erro ao invalidar cache:', error);
    }
  }

  // Limpar cache antigo
  static async cleanOldCache(): Promise<void> {
    try {
      const { data: oldRecords } = await supabase
        .from('leads_cache')
        .select('id')
        .order('updated_at', { ascending: false })
        .range(5, 100);

      if (oldRecords && oldRecords.length > 0) {
        const idsToDelete = oldRecords.map(r => r.id);
        const { error } = await supabase
          .from('leads_cache')
          .delete()
          .in('id', idsToDelete);

        if (error) {
          console.error('❌ [SUPABASE-CACHE] Erro ao limpar cache antigo:', error);
        } else {
          console.log(`🧹 [SUPABASE-CACHE] ${idsToDelete.length} registros antigos removidos`);
        }
      }
    } catch (error) {
      console.error('❌ [SUPABASE-CACHE] Erro ao limpar cache antigo:', error);
    }
  }

  // Obter status do cache com validação melhorada
  static async getCacheStatus(): Promise<{
    hasCache: boolean;
    lastUpdate: Date | null;
    totalRecords: number;
    isValid: boolean;
    ageMinutes: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('cache_metadata')
        .select('last_webhook_sync, total_records, is_valid')
        .eq('cache_type', this.CACHE_TYPE)
        .maybeSingle();

      if (error) {
        console.error('❌ [SUPABASE-CACHE] Erro ao obter status:', error);
      }

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
        totalRecords: data.total_records || 0,
        isValid: data.is_valid || false,
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
      
      // Aguardar um pouco para garantir que os dados foram salvos
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
    try {
      const str = JSON.stringify(data);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString();
    } catch (error) {
      console.error('❌ [SUPABASE-CACHE] Erro ao calcular hash:', error);
      return Date.now().toString(); // Fallback para timestamp
    }
  }
}
