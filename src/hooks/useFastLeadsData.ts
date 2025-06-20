
import { useState, useEffect, useRef } from 'react';
import { SupabaseCache } from "@/services/supabaseCache";
import { useToast } from "@/hooks/use-toast";
import type { Lead } from "@/types/lead";

export function useFastLeadsData() {
  const { toast } = useToast();
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);  // Começa true para primeira carga
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataReady, setDataReady] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<{
    source: 'cache' | 'webhook' | 'none';
    ageMinutes: number;
    isValid: boolean;
  }>({ source: 'none', ageMinutes: 0, isValid: false });
  
  const backgroundUpdateRef = useRef<boolean>(false);
  const initialLoadRef = useRef<boolean>(false);

  // Carregamento inicial RÁPIDO do cache Supabase
  const loadFromCache = async (): Promise<boolean> => {
    console.log('🚀 [FAST-LEADS] Iniciando carregamento rápido do Supabase...');
    
    try {
      const cachedLeads = await SupabaseCache.getLeadsFromCache();
      const status = await SupabaseCache.getCacheStatus();
      
      if (cachedLeads && cachedLeads.length > 0) {
        console.log(`⚡ [FAST-LEADS] Carregamento instantâneo: ${cachedLeads.length} leads do cache`);
        setAllLeads(cachedLeads);
        setLastUpdated(status.lastUpdate);
        setCacheStatus({
          source: 'cache',
          ageMinutes: status.ageMinutes,
          isValid: status.isValid
        });
        setDataReady(true);
        
        // Se o cache está válido, parar aqui
        if (status.isValid && status.ageMinutes < 15) {
          setIsLoading(false);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ [FAST-LEADS] Erro no carregamento do cache:', error);
      return false;
    }
  };

  // Atualização em background via Edge Function
  const updateInBackground = async (): Promise<void> => {
    if (backgroundUpdateRef.current) {
      console.log('⏳ [FAST-LEADS] Atualização em background já em andamento...');
      return;
    }
    
    backgroundUpdateRef.current = true;
    console.log('🔄 [FAST-LEADS] Iniciando atualização silenciosa em background...');
    
    try {
      // Usar Edge Function para sincronização
      const { data, error } = await SupabaseCache.supabase.functions.invoke('sync-leads-data');

      if (error) {
        console.error('❌ [FAST-LEADS] Erro na Edge Function:', error);
        throw error;
      }

      console.log('✅ [FAST-LEADS] Edge Function executada:', data);
      
      // Buscar dados atualizados do cache
      const leads = await SupabaseCache.getLeadsFromCache();
      
      if (leads && leads.length > 0) {
        setAllLeads(leads);
        setLastUpdated(new Date());
        setCacheStatus({
          source: 'webhook',
          ageMinutes: 0,
          isValid: true
        });
        
        // Notificação discreta
        toast({
          title: "🔄 Dados atualizados",
          description: `${leads.length} leads sincronizados em background`,
          duration: 3000,
        });
        
        console.log(`✅ [FAST-LEADS] Atualização em background concluída: ${leads.length} leads`);
      }
    } catch (error) {
      console.error('❌ [FAST-LEADS] Erro na atualização em background:', error);
      
      // Notificação discreta de erro
      toast({
        title: "⚠️ Atualização em background falhou",
        description: "Usando dados em cache. Tente atualizar manualmente.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      backgroundUpdateRef.current = false;
    }
  };

  // Carregamento direto via Edge Function (fallback)
  const loadViaEdgeFunction = async (): Promise<void> => {
    console.log('🌐 [FAST-LEADS] Carregando dados via Edge Function...');
    setIsLoading(true);
    
    try {
      const leads = await SupabaseCache.forceSyncViaEdgeFunction();
      
      if (leads && leads.length > 0) {
        setAllLeads(leads);
        setLastUpdated(new Date());
        setCacheStatus({
          source: 'webhook',
          ageMinutes: 0,
          isValid: true
        });
        
        console.log(`✅ [FAST-LEADS] ${leads.length} leads carregados via Edge Function`);
      } else {
        console.warn('⚠️ [FAST-LEADS] Nenhum lead retornado da Edge Function');
        setAllLeads([]);
      }
    } catch (error) {
      console.error('❌ [FAST-LEADS] Erro ao carregar via Edge Function:', error);
      
      // Tentar usar dados em cache mesmo expirados como fallback
      const fallbackLeads = await SupabaseCache.getLeadsFromCache();
      if (fallbackLeads && fallbackLeads.length > 0) {
        console.log('🔄 [FAST-LEADS] Usando dados em cache como fallback');
        setAllLeads(fallbackLeads);
        setCacheStatus({
          source: 'cache',
          ageMinutes: Infinity,
          isValid: false
        });
      }
      
      throw error;
    } finally {
      setIsLoading(false);
      setDataReady(true);
    }
  };

  // Atualização manual forçada
  const forceRefresh = async (): Promise<void> => {
    console.log('🔄 [FAST-LEADS] Atualização manual forçada...');
    
    // Invalidar cache
    await SupabaseCache.invalidateCache();
    
    // Resetar estado
    setIsLoading(true);
    setDataReady(false);
    
    try {
      await loadViaEdgeFunction();
      
      toast({
        title: "✅ Dados atualizados!",
        description: `${allLeads.length} leads recarregados via sincronização`,
      });
    } catch (error) {
      toast({
        title: "❌ Erro na atualização",
        description: "Não foi possível atualizar os dados",
        variant: "destructive"
      });
    }
  };

  // Efeito principal - carregamento inicial inteligente
  useEffect(() => {
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;
    
    const initializeData = async () => {
      console.log('🎯 [FAST-LEADS] Inicializando sistema unificado Supabase...');
      
      try {
        // Tentar carregar do cache primeiro
        const loadedFromCache = await loadFromCache();
        
        if (loadedFromCache) {
          setIsLoading(false);
          
          // Se cache está velho, atualizar em background
          const status = await SupabaseCache.getCacheStatus();
          if (!status.isValid || status.ageMinutes >= 15) {
            console.log('⏰ [FAST-LEADS] Cache expirado, iniciando atualização em background...');
            setTimeout(() => updateInBackground(), 1000); // Pequeno delay
          }
        } else {
          // Se não tem cache, carregar via Edge Function
          console.log('📭 [FAST-LEADS] Cache vazio, carregando via Edge Function...');
          await loadViaEdgeFunction();
        }
      } catch (error) {
        console.error('❌ [FAST-LEADS] Erro na inicialização:', error);
        setIsLoading(false);
        setDataReady(true);
      }
    };
    
    initializeData();
  }, []);

  // Limpeza de cache antigo periodicamente
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      SupabaseCache.cleanOldCache();
    }, 30 * 60 * 1000); // A cada 30 minutos
    
    return () => clearInterval(cleanupInterval);
  }, []);

  return {
    allLeads,
    isLoading,
    lastUpdated,
    dataReady,
    cacheStatus,
    forceRefresh,
    updateInBackground: () => {
      if (!backgroundUpdateRef.current) {
        updateInBackground();
      }
    }
  };
}
