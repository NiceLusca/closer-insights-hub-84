
import { useMemo } from 'react';
import { filterLeads, validateFilters } from "@/utils/dataFilters";
import type { Lead, DateRange, Filters } from "@/types/lead";

export function useFilteredLeads(
  allLeads: Lead[], 
  dateRange: DateRange, 
  filters: Filters,
  component: string = 'general'
) {
  return useMemo(() => {
    if (!allLeads || allLeads.length === 0) {
      console.log('⚠️ Nenhum lead disponível para filtrar');
      return {
        filteredLeads: [],
        validation: {
          isValid: false,
          warnings: ['Nenhum lead carregado'],
          suggestions: ['Verifique a conexão de dados']
        }
      };
    }
    
    console.log(`🔍 [${component.toUpperCase()}] Aplicando filtros aos dados:`, {
      totalLeads: allLeads.length,
      dateRange: {
        from: dateRange.from.toLocaleDateString(),
        to: dateRange.to.toLocaleDateString()
      },
      filters
    });
    
    // Validar filtros antes de aplicar
    const validation = validateFilters(allLeads, dateRange, filters);
    
    if (!validation.isValid) {
      console.warn(`⚠️ [${component}] Filtros inválidos:`, validation.warnings);
      validation.suggestions.forEach(suggestion => 
        console.info(`💡 [${component}] Sugestão: ${suggestion}`)
      );
    }
    
    const result = filterLeads(allLeads, dateRange, filters, { component });
    console.log(`📊 [${component}] Leads após filtragem: ${result.length}`);
    
    return {
      filteredLeads: result,
      validation
    };
  }, [allLeads, dateRange, filters, component]);
}
