
import { useState, useEffect } from 'react';
import { webhookService } from "@/services/webhookService";
import { useToast } from "@/hooks/use-toast";
import type { Lead } from "@/types/lead";

export function useLeadsData() {
  const { toast } = useToast();
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataReady, setDataReady] = useState(false);

  const fetchLeadsData = async () => {
    setIsLoading(true);
    setDataReady(false);
    
    try {
      console.log('🔄 Iniciando busca de dados do webhook externo...');
      const leads = await webhookService.getAllWebhookData();
      
      if (leads.length > 0) {
        console.log('✅ Dados carregados do webhook:', leads.length, 'leads');
        setAllLeads(leads);
        setLastUpdated(new Date());
        
        // Verificar status do cache
        const cacheStatus = webhookService.getCacheStatus();
        const fromCache = cacheStatus.cached && !cacheStatus.expired;
        
        toast({
          title: "✅ Dados atualizados!",
          description: `${leads.length} leads carregados ${fromCache ? 'do cache' : 'do webhook'} com sucesso.`,
        });
      } else {
        console.log('⚠️ Webhook retornou dados vazios');
        setAllLeads([]);
        setLastUpdated(new Date());
        
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
      
      toast({
        title: "❌ Erro ao carregar dados",
        description: "Erro na conexão com o webhook. Verifique sua conexão com a internet.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setDataReady(true), 100);
    }
  };

  // Função para forçar recarregamento sem cache
  const forceRefresh = async () => {
    setIsLoading(true);
    setDataReady(false);
    
    try {
      console.log('🔄 Forçando recarregamento completo...');
      const leads = await webhookService.forceReprocessData();
      
      setAllLeads(leads);
      setLastUpdated(new Date());
      
      toast({
        title: "🔄 Dados recarregados!",
        description: `${leads.length} leads recarregados diretamente do webhook.`,
      });
    } catch (error) {
      console.error('❌ Erro no recarregamento forçado:', error);
      
      toast({
        title: "❌ Erro no recarregamento",
        description: "Não foi possível recarregar os dados do webhook.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setDataReady(true), 100);
    }
  };

  useEffect(() => {
    fetchLeadsData();
  }, []);

  return {
    allLeads,
    isLoading,
    lastUpdated,
    dataReady,
    fetchLeadsData,
    forceRefresh
  };
}
