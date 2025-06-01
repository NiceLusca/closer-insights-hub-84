
import { useState, useEffect, useRef } from 'react';
import { webhookService } from "@/services/webhookService";
import { useToast } from "@/hooks/use-toast";
import type { Lead } from "@/types/lead";

// Cache global para persistir dados entre navegações
let globalLeadsCache: Lead[] = [];
let globalCacheTimestamp: Date | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useLeadsData() {
  const { toast } = useToast();
  const [allLeads, setAllLeads] = useState<Lead[]>(globalLeadsCache);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(globalCacheTimestamp);
  const [dataReady, setDataReady] = useState(globalLeadsCache.length > 0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('');
  const hasFetchedRef = useRef(false);

  const isCacheValid = () => {
    if (!globalCacheTimestamp || globalLeadsCache.length === 0) return false;
    return (Date.now() - globalCacheTimestamp.getTime()) < CACHE_DURATION;
  };

  const fetchLeadsData = async (force = false) => {
    // Se já tem dados válidos no cache e não é força, não recarregar
    if (!force && isCacheValid() && globalLeadsCache.length > 0) {
      console.log('📦 Usando dados do cache global');
      setAllLeads(globalLeadsCache);
      setLastUpdated(globalCacheTimestamp);
      setDataReady(true);
      return;
    }

    setIsLoading(true);
    setDataReady(false);
    setLoadingProgress(0);
    setLoadingStage('Conectando ao webhook...');
    
    try {
      console.log('🔄 Iniciando busca de dados do webhook externo...');
      
      setLoadingProgress(10);
      setLoadingStage('Baixando dados do servidor...');
      
      const leads = await webhookService.getAllWebhookData();
      
      setLoadingProgress(90);
      setLoadingStage('Finalizando carregamento...');
      
      if (leads.length > 0) {
        console.log('✅ Dados carregados do webhook:', leads.length, 'leads');
        
        // Atualizar cache global
        globalLeadsCache = leads;
        globalCacheTimestamp = new Date();
        
        setAllLeads(leads);
        setLastUpdated(globalCacheTimestamp);
        
        const cacheStatus = webhookService.getCacheStatus();
        const fromCache = cacheStatus.cached && !cacheStatus.expired;
        
        setLoadingProgress(100);
        setLoadingStage('Dados carregados com sucesso!');
        
        toast({
          title: "✅ Dados atualizados!",
          description: `${leads.length} leads carregados ${fromCache ? 'do cache' : 'do webhook'} com sucesso.`,
        });
      } else {
        console.log('⚠️ Webhook retornou dados vazios');
        setAllLeads([]);
        setLastUpdated(new Date());
        setLoadingProgress(100);
        setLoadingStage('Nenhum dado encontrado');
        
        toast({
          title: "⚠️ Nenhum dado encontrado",
          description: "O webhook não retornou dados. Verifique se há leads disponíveis.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error);
      setAllLeads([]);
      setLastUpdated(new Date());
      setLoadingProgress(0);
      setLoadingStage('Erro no carregamento');
      
      toast({
        title: "❌ Erro ao carregar dados",
        description: "Erro na conexão com o webhook. Verifique sua conexão com a internet.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setDataReady(true);
        setLoadingProgress(0);
        setLoadingStage('');
      }, 500);
    }
  };

  const forceRefresh = async () => {
    console.log('🔄 Forçando recarregamento completo...');
    
    // Limpar cache global
    globalLeadsCache = [];
    globalCacheTimestamp = null;
    
    setIsLoading(true);
    setDataReady(false);
    setLoadingProgress(0);
    setLoadingStage('Limpando cache e recarregando...');
    
    try {
      setLoadingProgress(10);
      setLoadingStage('Baixando dados atualizados...');
      
      const leads = await webhookService.forceReprocessData();
      
      setLoadingProgress(90);
      setLoadingStage('Processamento finalizado!');
      
      // Atualizar cache global
      globalLeadsCache = leads;
      globalCacheTimestamp = new Date();
      
      setAllLeads(leads);
      setLastUpdated(globalCacheTimestamp);
      setLoadingProgress(100);
      
      toast({
        title: "🔄 Dados recarregados!",
        description: `${leads.length} leads recarregados diretamente do webhook.`,
      });
    } catch (error) {
      console.error('❌ Erro no recarregamento forçado:', error);
      setLoadingProgress(0);
      setLoadingStage('Erro no recarregamento');
      
      toast({
        title: "❌ Erro no recarregamento",
        description: "Não foi possível recarregar os dados do webhook.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setDataReady(true);
        setLoadingProgress(0);
        setLoadingStage('');
      }, 500);
    }
  };

  useEffect(() => {
    // Só buscar dados na primeira montagem se não tem cache válido
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchLeadsData();
    }
  }, []);

  return {
    allLeads,
    isLoading,
    lastUpdated,
    dataReady,
    loadingProgress,
    loadingStage,
    fetchLeadsData,
    forceRefresh,
    isCacheValid: isCacheValid()
  };
}
