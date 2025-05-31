
import { useState, useEffect } from 'react';
import { webhookService } from "@/services/webhookService";
import { generateMockData } from "@/utils/mockData";
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
      console.log('🔄 Iniciando busca de dados do webhook...');
      const webhookLeads = await webhookService.getAllWebhookData();
      
      if (webhookLeads.length > 0) {
        console.log('✅ Dados carregados do webhook:', webhookLeads.length, 'leads');
        setAllLeads(webhookLeads);
        setLastUpdated(new Date());
        
        toast({
          title: "✅ Dados atualizados!",
          description: `${webhookLeads.length} leads carregados do webhook com sucesso.`,
        });
      } else {
        console.log('⚠️ Webhook vazio, usando dados de demonstração');
        const mockLeads = generateMockData(100);
        setAllLeads(mockLeads);
        setLastUpdated(new Date());
        
        toast({
          title: "⚠️ Usando dados de demonstração",
          description: "Webhook retornou dados vazios. Usando dados mock para demonstração.",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error);
      const mockLeads = generateMockData(100);
      setAllLeads(mockLeads);
      setLastUpdated(new Date());
      
      toast({
        title: "❌ Erro ao carregar dados",
        description: "Erro na conexão com webhook. Usando dados de demonstração.",
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setDataReady(true), 100); // Reduzido de 200ms para 100ms
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
    fetchLeadsData
  };
}
