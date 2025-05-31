
import { useMemo } from 'react';
import type { Lead } from "@/types/lead";

export function useFilterOptions(allLeads: Lead[], dataReady: boolean, isLoading: boolean) {
  return useMemo(() => {
    console.log('🔧 Gerando opções de filtro...');

    if (!dataReady || isLoading || !Array.isArray(allLeads) || allLeads.length === 0) {
      console.log('⏳ Dados não prontos, retornando opções vazias');
      return {
        statusOptions: [],
        closerOptions: [],
        origemOptions: []
      };
    }

    try {
      // FILTRAR APENAS LEADS COM STATUS VÁLIDO para gerar opções
      const validLeads = allLeads.filter(lead => {
        const status = lead?.Status?.trim();
        return status && status !== '';
      });

      console.log(`🔧 Processando ${validLeads.length} leads com status válido de ${allLeads.length} total`);

      // Processar Status
      const statusSet = new Set<string>();
      validLeads.forEach(lead => {
        const status = lead.Status.trim();
        statusSet.add(status);
      });
      const statusOptions = Array.from(statusSet).sort();
      
      // Processar Closers
      const closerSet = new Set<string>();
      validLeads.forEach(lead => {
        if (lead?.Closer && typeof lead.Closer === 'string') {
          const closer = lead.Closer.trim();
          if (closer !== '') {
            closerSet.add(closer);
          }
        }
      });
      const closerOptions = Array.from(closerSet).sort();
      
      // Processar Origens
      const origemSet = new Set<string>();
      validLeads.forEach(lead => {
        if (lead?.origem && typeof lead.origem === 'string') {
          const origem = lead.origem.trim();
          if (origem !== '') {
            origemSet.add(origem);
          }
        }
      });
      const origemOptions = Array.from(origemSet).sort();
      
      console.log('✅ Opções de filtro geradas (apenas leads com status válido):');
      console.log('📈 Status:', statusOptions.length, 'opções:', statusOptions);
      console.log('👥 Closers:', closerOptions.length, 'opções:', closerOptions);
      console.log('🎯 Origens:', origemOptions.length, 'opções:', origemOptions);
      
      return { 
        statusOptions, 
        closerOptions, 
        origemOptions 
      };
    } catch (error) {
      console.error('❌ Erro ao gerar opções de filtro:', error);
      return {
        statusOptions: [],
        closerOptions: [],
        origemOptions: []
      };
    }
  }, [allLeads, dataReady, isLoading]);
}
