
import { useFastLeadsData } from './useFastLeadsData';

/**
 * @deprecated Use useFastLeadsData instead
 * Este hook está sendo mantido apenas para compatibilidade com código legado.
 * Migre para useFastLeadsData para melhor performance e integração com Supabase.
 */
export function useLeadsData() {
  console.warn('⚠️ useLeadsData está deprecated. Use useFastLeadsData em vez disso.');
  
  // Redirecionar para o novo hook
  const fastLeadsData = useFastLeadsData();
  
  return {
    allLeads: fastLeadsData.allLeads,
    isLoading: fastLeadsData.isLoading,
    lastUpdated: fastLeadsData.lastUpdated,
    dataReady: fastLeadsData.dataReady,
    loadingProgress: fastLeadsData.isLoading ? 50 : 100,
    loadingStage: fastLeadsData.isLoading ? 'Carregando...' : 'Concluído',
    fetchLeadsData: () => {
      console.warn('fetchLeadsData não está mais disponível. Use forceRefresh.');
    },
    forceRefresh: fastLeadsData.forceRefresh,
    isCacheValid: fastLeadsData.cacheStatus.isValid
  };
}
