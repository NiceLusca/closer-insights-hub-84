
import { useMemo } from 'react';
import { filterLeads } from "@/utils/dataFilters";
import type { Lead, DateRange, Filters } from "@/types/lead";

export function useFilteredLeads(
  allLeads: Lead[], 
  dateRange: DateRange, 
  filters: Filters
) {
  return useMemo(() => {
    if (!allLeads || allLeads.length === 0) {
      console.log('⚠️ Nenhum lead disponível para filtrar');
      return [];
    }
    
    console.log('🔍 Aplicando filtros aos dados:', {
      totalLeads: allLeads.length,
      dateRange: {
        from: dateRange.from.toLocaleDateString(),
        to: dateRange.to.toLocaleDateString()
      },
      filters
    });
    
    const result = filterLeads(allLeads, dateRange, filters);
    console.log('📊 Leads após filtragem:', result.length);
    return result;
  }, [allLeads, dateRange, filters]);
}
