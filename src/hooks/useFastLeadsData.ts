
import { useState, useEffect, useRef } from 'react';
import { webhookService } from "@/services/webhookService";
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

  // Carregamento inicial RÁPIDO do cache
  const loadFromCache = async () => {
    console.log('🚀 Iniciando carregamento rápido...');
    
    try {
      const cachedLeads = await SupabaseCache.getLeadsFromCache();
      const status = await SupabaseCache.getCacheStatus();
      
      if (cachedLeads && cachedLeads.length > 0) {
        console.log(`⚡ Carregamento instantâneo: ${cachedLeads.length} leads do cache`);
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
      console.error('❌ Erro no carregamento do cache:', error);
      return false;
    }
  };

  // Atualização em background sem UI de loading
  const updateInBackground = async () => {
    if (backgroundUpdateRef.current) {
      console.log('⏳ Atualização em background já em andamento...');
      return;
    }
    
    backgroundUpdateRef.current = true;
    console.log('🔄 Iniciando atualização silenciosa em background...');
    
    try {
      const leads = await webhookService.getAllWebhookData();
      
      if (leads && leads.length > 0) {
        // Salvar no cache
        const rawData = []; // Idealmente pegar os dados brutos do webhook
        await SupabaseCache.saveLeadsToCache(rawData, leads);
        
        // Atualizar estado
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
        
        console.log(`✅ Atualização em background concluída: ${leads.length} leads`);
      }
    } catch (error) {
      console.error('❌ Erro na atualização em background:', error);
      
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

  // Carregamento inicial direto do webhook (fallback)
  const loadFromWebhook = async () => {
    console.log('🌐 Carregando dados diretamente do webhook...');
    setIsLoading(true);
    
    try {
      const leads = await webhookService.getAllWebhookData();
      
      if (leads && leads.length > 0) {
        setAllLeads(leads);
        setLastUpdated(new Date());
        setCacheStatus({
          source: 'webhook',
          ageMinutes: 0,
          isValid: true
        });
        
        // Salvar no cache para próxima vez
        const rawData = []; // Idealmente pegar os dados brutos
        await SupabaseCache.saveLeadsToCache(rawData, leads);
        
        console.log(`✅ ${leads.length} leads carregados do webhook`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar do webhook:', error);
      throw error;
    } finally {
      setIsLoading(false);
      setDataReady(true);
    }
  };

  // Atualização manual forçada
  const forceRefresh = async () => {
    console.log('🔄 Atualização manual forçada...');
    
    // Invalidar cache
    await SupabaseCache.invalidateCache();
    
    // Resetar estado
    setIsLoading(true);
    setDataReady(false);
    
    try {
      await loadFromWebhook();
      
      toast({
        title: "✅ Dados atualizados!",
        description: `${allLeads.length} leads recarregados do webhook`,
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
      console.log('🎯 Inicializando sistema de dados rápido...');
      
      // Tentar carregar do cache primeiro
      const loadedFromCache = await loadFromCache();
      
      if (loadedFromCache) {
        setIsLoading(false);
        
        // Se cache está velho, atualizar em background
        const status = await SupabaseCache.getCacheStatus();
        if (!status.isValid || status.ageMinutes >= 15) {
          console.log('⏰ Cache expirado, iniciando atualização em background...');
          setTimeout(() => updateInBackground(), 1000); // Pequeno delay
        }
      } else {
        // Se não tem cache, carregar do webhook
        console.log('📭 Cache vazio, carregando do webhook...');
        await loadFromWebhook();
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
