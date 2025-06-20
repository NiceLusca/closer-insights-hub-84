
import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { SupabaseCache } from "@/services/supabaseCache";
import { useToast } from "@/hooks/use-toast";
import type { Lead } from "@/types/lead";

export function useFastLeadsData() {
  const { toast } = useToast();
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Atualização em background via Edge Function - CORRIGIDO
  const updateInBackground = async (): Promise<void> => {
    if (backgroundUpdateRef.current) {
      console.log('⏳ [FAST-LEADS] Atualização em background já em andamento...');
      return;
    }
    
    backgroundUpdateRef.current = true;
    console.log('🔄 [FAST-LEADS] Iniciando atualização silenciosa em background...');
    
    try {
      // CORREÇÃO: Usar cliente supabase diretamente
      const { data, error } = await supabase.functions.invoke('sync-leads-data', {
        body: { force: false }
      });

      if (error) {
        console.error('❌ [FAST-LEADS] Erro na Edge Function:', error);
        throw error;
      }

      console.log('✅ [FAST-LEADS] Edge Function executada:', data);
      
      // Pequeno delay para garantir que o cache foi atualizado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
        
        // Notificação discreta apenas se houve mudanças significativas
        const currentCount = allLeads.length;
        const newCount = leads.length;
        const difference = Math.abs(newCount - currentCount);
        
        if (difference > 5 || currentCount === 0) {
          toast({
            title: "🔄 Dados atualizados",
            description: `${leads.length} leads sincronizados (${difference > 0 ? `+${difference}` : 'sem mudanças'})`,
            duration: 3000,
          });
        }
        
        console.log(`✅ [FAST-LEADS] Atualização em background concluída: ${leads.length} leads`);
      }
    } catch (error) {
      console.error('❌ [FAST-LEADS] Erro na atualização em background:', error);
      
      // Implementar fallback robusto - tentar usar cache mesmo se Edge Function falhou
      try {
        const fallbackLeads = await SupabaseCache.getLeadsFromCache();
        if (fallbackLeads && fallbackLeads.length > 0) {
          console.log('🔄 [FAST-LEADS] Usando cache como fallback após erro na Edge Function');
          setAllLeads(fallbackLeads);
          setCacheStatus({
            source: 'cache',
            ageMinutes: Infinity,
            isValid: false
          });
        }
      } catch (fallbackError) {
        console.error('❌ [FAST-LEADS] Erro até no fallback:', fallbackError);
      }
      
      // Notificação discreta de erro apenas se não conseguiu nenhum dado
      if (allLeads.length === 0) {
        toast({
          title: "⚠️ Problema na sincronização",
          description: "Usando dados em cache. Alguns dados podem estar desatualizados.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } finally {
      backgroundUpdateRef.current = false;
    }
  };

  // Carregamento direto via Edge Function com tratamento robusto de erros
  const loadViaEdgeFunction = async (): Promise<void> => {
    console.log('🌐 [FAST-LEADS] Carregando dados via Edge Function...');
    setIsLoading(true);
    
    try {
      // CORREÇÃO: Usar cliente supabase diretamente
      const { data, error } = await supabase.functions.invoke('sync-leads-data', {
        body: { force: true }
      });
      
      if (error) {
        console.error('❌ [FAST-LEADS] Erro na Edge Function:', error);
        throw error;
      }

      console.log('✅ [FAST-LEADS] Edge Function executada com sucesso:', data);
      
      // Pequeno delay para garantir que o cache foi persistido
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const leads = await SupabaseCache.getLeadsFromCache();
      
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
      
      // Implementar fallback robusto - tentar usar cache mesmo expirado
      try {
        const fallbackLeads = await SupabaseCache.getLeadsFromCache();
        if (fallbackLeads && fallbackLeads.length > 0) {
          console.log('🔄 [FAST-LEADS] Usando dados em cache como fallback');
          setAllLeads(fallbackLeads);
          setCacheStatus({
            source: 'cache',
            ageMinutes: Infinity,
            isValid: false
          });
          
          // Não mostrar como erro se conseguiu dados do cache
          toast({
            title: "⚠️ Sincronização com problemas",
            description: `Usando ${fallbackLeads.length} leads do cache local`,
            variant: "destructive",
            duration: 4000,
          });
        } else {
          // Só aqui é realmente um erro crítico
          throw new Error('Nenhum dado disponível nem no cache nem via webhook');
        }
      } catch (fallbackError) {
        console.error('❌ [FAST-LEADS] Erro crítico - sem dados disponíveis:', fallbackError);
        throw fallbackError;
      }
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
        description: `${allLeads.length} leads recarregados com sucesso`,
      });
    } catch (error) {
      console.error('❌ [FAST-LEADS] Erro na atualização forçada:', error);
      toast({
        title: "❌ Erro na atualização",
        description: "Não foi possível atualizar os dados. Verifique sua conexão.",
        variant: "destructive"
      });
    }
  };

  // Efeito principal - carregamento inicial inteligente com fallbacks robustos
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
          
          // Se cache está velho, atualizar em background (não bloquear UI)
          const status = await SupabaseCache.getCacheStatus();
          if (!status.isValid || status.ageMinutes >= 15) {
            console.log('⏰ [FAST-LEADS] Cache expirado, iniciando atualização em background...');
            setTimeout(() => updateInBackground(), 2000); // Delay maior para não sobrecarregar
          }
        } else {
          // Se não tem cache válido, carregar via Edge Function
          console.log('📭 [FAST-LEADS] Cache vazio/inválido, carregando via Edge Function...');
          await loadViaEdgeFunction();
        }
      } catch (error) {
        console.error('❌ [FAST-LEADS] Erro crítico na inicialização:', error);
        
        // Fallback final - tentar qualquer coisa no cache
        try {
          const emergencyLeads = await SupabaseCache.getLeadsFromCache();
          if (emergencyLeads && emergencyLeads.length > 0) {
            console.log('🆘 [FAST-LEADS] Usando dados de emergência do cache');
            setAllLeads(emergencyLeads);
            setCacheStatus({ source: 'cache', ageMinutes: Infinity, isValid: false });
          }
        } catch (emergencyError) {
          console.error('💀 [FAST-LEADS] Falha total:', emergencyError);
        }
        
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
