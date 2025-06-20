
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

  // FASE 6: Carregamento do cache com validação melhorada
  const loadFromCache = async (): Promise<boolean> => {
    console.log('🚀 [FAST-LEADS] FASE 7 - Carregamento super otimizado...');
    
    try {
      const cachedLeads = await SupabaseCache.getLeadsFromCache();
      const status = await SupabaseCache.getCacheStatus();
      
      if (cachedLeads && cachedLeads.length > 0) {
        console.log(`⚡ [FAST-LEADS] Cache encontrado: ${cachedLeads.length} leads`);
        
        // NOVO: Validar qualidade dos dados
        const leadsComData = cachedLeads.filter(lead => lead.parsedDate || lead.data);
        const leadsComValor = cachedLeads.filter(lead => 
          (lead.Valor && lead.Valor > 0) || 
          (lead['Venda Completa'] && lead['Venda Completa'] > 0) ||
          (lead.recorrente && lead.recorrente > 0)
        );
        
        console.log(`📊 [FAST-LEADS] Qualidade: ${leadsComData.length} c/ data, ${leadsComValor.length} c/ valor`);
        
        setAllLeads(cachedLeads);
        setLastUpdated(status.lastUpdate);
        setCacheStatus({
          source: 'cache',
          ageMinutes: status.ageMinutes,
          isValid: status.isValid && cachedLeads.length > 10 // Validação de quantidade mínima
        });
        setDataReady(true);
        
        // FASE 6: Cache é válido se tem dados úteis, não só por idade
        const hasUsefulData = leadsComData.length > 5 || leadsComValor.length > 2;
        if (status.isValid && hasUsefulData && status.ageMinutes < 30) {
          setIsLoading(false);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ [FAST-LEADS] Erro no cache:', error);
      return false;
    }
  };

  // FASE 6: Atualização com retry automático melhorado
  const updateInBackground = async (): Promise<void> => {
    if (backgroundUpdateRef.current) {
      console.log('⏳ [FAST-LEADS] Atualização já em andamento...');
      return;
    }
    
    backgroundUpdateRef.current = true;
    console.log('🔄 [FAST-LEADS] FASE 7 - Atualização inteligente...');
    
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        attempt++;
        console.log(`🔄 [FAST-LEADS] Tentativa ${attempt}/${maxRetries}...`);
        
        const { data, error } = await supabase.functions.invoke('sync-leads-data', {
          body: { force: false, attempt }
        });

        if (error) {
          console.error(`❌ [FAST-LEADS] Erro tentativa ${attempt}:`, error);
          if (attempt === maxRetries) throw error;
          
          // Delay progressivo: 2s, 5s, 10s
          await new Promise(resolve => setTimeout(resolve, attempt * 2500));
          continue;
        }

        console.log('✅ [FAST-LEADS] Edge Function OK:', data);
        
        // Aguardar cache ser atualizado
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const leads = await SupabaseCache.getLeadsFromCache();
        
        if (leads && leads.length > 0) {
          const leadsComValor = leads.filter(lead => 
            (lead.Valor && lead.Valor > 0) || 
            (lead['Venda Completa'] && lead['Venda Completa'] > 0)
          );
          
          setAllLeads(leads);
          setLastUpdated(new Date());
          setCacheStatus({
            source: 'webhook',
            ageMinutes: 0,
            isValid: true
          });
          
          const currentCount = allLeads.length;
          const newCount = leads.length;
          const difference = Math.abs(newCount - currentCount);
          
          // Notificação apenas para mudanças significativas
          if (difference > 5 || currentCount === 0 || leadsComValor.length > 0) {
            toast({
              title: "🔄 Dados atualizados (Fase 7)",
              description: `${leads.length} leads | ${leadsComValor.length} com valores`,
              duration: 3000,
            });
          }
          
          console.log(`✅ [FAST-LEADS] Atualização FASE 7 concluída: ${leads.length} leads`);
          break;
        }
      } catch (error) {
        console.error(`❌ [FAST-LEADS] Erro tentativa ${attempt}:`, error);
        
        if (attempt === maxRetries) {
          // FALLBACK: Usar cache mesmo com erro
          try {
            const fallbackLeads = await SupabaseCache.getLeadsFromCache();
            if (fallbackLeads && fallbackLeads.length > 0) {
              console.log('🔄 [FAST-LEADS] Usando cache como fallback');
              setAllLeads(fallbackLeads);
              setCacheStatus({
                source: 'cache',
                ageMinutes: Infinity,
                isValid: false
              });
            }
          } catch (fallbackError) {
            console.error('❌ [FAST-LEADS] Erro total:', fallbackError);
          }
          
          if (allLeads.length === 0) {
            toast({
              title: "⚠️ Sincronização com problemas",
              description: "Tentativas de atualização falharam. Usando dados locais.",
              variant: "destructive",
              duration: 5000,
            });
          }
        }
      }
    }
    
    backgroundUpdateRef.current = false;
  };

  // FASE 5: Carregamento direto com múltiplas tentativas
  const loadViaEdgeFunction = async (): Promise<void> => {
    console.log('🌐 [FAST-LEADS] FASE 7 - Carregamento direto robusto...');
    setIsLoading(true);
    
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        attempt++;
        console.log(`🌐 [FAST-LEADS] Tentativa direta ${attempt}/${maxRetries}...`);
        
        const { data, error } = await supabase.functions.invoke('sync-leads-data', {
          body: { force: true, attempt }
        });
        
        if (error) {
          console.error(`❌ [FAST-LEADS] Erro direto ${attempt}:`, error);
          if (attempt === maxRetries) throw error;
          
          await new Promise(resolve => setTimeout(resolve, attempt * 3000));
          continue;
        }

        console.log('✅ [FAST-LEADS] Edge Function direta OK:', data);
        
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        const leads = await SupabaseCache.getLeadsFromCache();
        
        if (leads && leads.length > 0) {
          setAllLeads(leads);
          setLastUpdated(new Date());
          setCacheStatus({
            source: 'webhook',
            ageMinutes: 0,
            isValid: true
          });
          
          console.log(`✅ [FAST-LEADS] Carregamento direto FASE 7: ${leads.length} leads`);
          break;
        } else {
          console.warn('⚠️ [FAST-LEADS] Edge Function OK mas sem dados no cache');
          if (attempt === maxRetries) {
            setAllLeads([]);
          }
        }
      } catch (error) {
        console.error(`❌ [FAST-LEADS] Erro carregamento direto ${attempt}:`, error);
        
        if (attempt === maxRetries) {
          // FALLBACK FINAL
          try {
            const fallbackLeads = await SupabaseCache.getLeadsFromCache();
            if (fallbackLeads && fallbackLeads.length > 0) {
              console.log('🔄 [FAST-LEADS] Fallback para cache existente');
              setAllLeads(fallbackLeads);
              setCacheStatus({
                source: 'cache',
                ageMinutes: Infinity,
                isValid: false
              });
              
              toast({
                title: "⚠️ Problemas na sincronização",
                description: `Usando ${fallbackLeads.length} leads do cache local`,
                variant: "destructive",
                duration: 4000,
              });
            } else {
              throw new Error('Nenhum dado disponível');
            }
          } catch (fallbackError) {
            console.error('💀 [FAST-LEADS] Falha total:', fallbackError);
            setAllLeads([]);
            throw fallbackError;
          }
        }
      }
    }
    
    setIsLoading(false);
    setDataReady(true);
  };

  // FASE 5: Atualização manual super robusta
  const forceRefresh = async (): Promise<void> => {
    console.log('🔄 [FAST-LEADS] FASE 7 - Atualização manual forçada...');
    
    await SupabaseCache.invalidateCache();
    
    setIsLoading(true);
    setDataReady(false);
    
    try {
      await loadViaEdgeFunction();
      
      const finalCount = allLeads.length;
      const leadsComValor = allLeads.filter(lead => 
        (lead.Valor && lead.Valor > 0) || 
        (lead['Venda Completa'] && lead['Venda Completa'] > 0)
      ).length;
      
      toast({
        title: "✅ Dados recarregados (Fase 7)!",
        description: `${finalCount} leads | ${leadsComValor} com valores monetários`,
      });
    } catch (error) {
      console.error('❌ [FAST-LEADS] Erro na atualização forçada:', error);
      toast({
        title: "❌ Erro na atualização",
        description: "Não foi possível recarregar. Tente novamente em alguns minutos.",
        variant: "destructive"
      });
    }
  };

  // EFEITO PRINCIPAL - FASE 6: Inicialização super inteligente
  useEffect(() => {
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;
    
    const initializeData = async () => {
      console.log('🎯 [FAST-LEADS] FASE 7 - Inicialização inteligente...');
      
      try {
        const loadedFromCache = await loadFromCache();
        
        if (loadedFromCache) {
          setIsLoading(false);
          
          // Se cache tem poucos dados úteis, atualizar em background
          const leadsComValor = allLeads.filter(lead => 
            (lead.Valor && lead.Valor > 0) || (lead['Venda Completa'] && lead['Venda Completa'] > 0)
          ).length;
          
          if (leadsComValor < 5) {
            console.log('⏰ [FAST-LEADS] Cache com poucos dados úteis, atualizando...');
            setTimeout(() => updateInBackground(), 3000);
          }
        } else {
          console.log('📭 [FAST-LEADS] Cache vazio/inválido, carregamento direto...');
          await loadViaEdgeFunction();
        }
      } catch (error) {
        console.error('❌ [FAST-LEADS] Erro na inicialização:', error);
        
        try {
          const emergencyLeads = await SupabaseCache.getLeadsFromCache();
          if (emergencyLeads && emergencyLeads.length > 0) {
            console.log('🆘 [FAST-LEADS] Dados de emergência encontrados');
            setAllLeads(emergencyLeads);
            setCacheStatus({ source: 'cache', ageMinutes: Infinity, isValid: false });
          }
        } catch (emergencyError) {
          console.error('💀 [FAST-LEADS] Falha total na inicialização:', emergencyError);
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
