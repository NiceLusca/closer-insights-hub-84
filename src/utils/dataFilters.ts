
import type { Lead, DateRange, Filters } from "@/types/lead";

export interface FilterContext {
  isTemporalFilter?: boolean; // Para gráficos temporais
  component?: string; // Nome do componente que está filtrando
}

export function filterLeads(
  leads: Lead[], 
  dateRange: DateRange, 
  filters: Filters,
  context: FilterContext = {}
): Lead[] {
  const { isTemporalFilter = false, component = 'unknown' } = context;
  
  console.log(`🔍 [${component.toUpperCase()}] Filtrando leads:`, {
    totalLeads: leads.length,
    dateRange: {
      from: dateRange.from.toLocaleDateString(),
      to: dateRange.to.toLocaleDateString()
    },
    filters,
    isTemporalFilter
  });
  
  const filtered = leads.filter(lead => {
    // 0. PRIMEIRO: Excluir leads sem status válido
    const leadStatus = lead.Status?.trim();
    if (!leadStatus || leadStatus === '') {
      console.log(`⚠️ [${component}] Lead excluído por falta de status:`, lead.Nome);
      return false;
    }
    
    // 1. Filtrar por status apenas se filtros específicos estiverem selecionados
    if (filters.status.length > 0 && !filters.status.includes(leadStatus)) {
      return false;
    }
    
    // 2. Filtrar por closer
    if (filters.closer.length > 0) {
      const leadCloser = lead.Closer?.trim() || '';
      if (leadCloser && !filters.closer.includes(leadCloser)) {
        return false;
      }
    }
    
    // 3. Filtrar por origem
    if (filters.origem.length > 0) {
      const leadOrigem = lead.origem?.trim() || '';
      if (leadOrigem && !filters.origem.includes(leadOrigem)) {
        return false;
      }
    }
    
    // 4. Filtrar por data (lógica diferente para temporal vs geral)
    if (lead.parsedDate) {
      const leadDate = new Date(lead.parsedDate);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      
      leadDate.setHours(0, 0, 0, 0);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);
      
      if (leadDate < fromDate || leadDate > toDate) {
        return false;
      }
    } else {
      // Para filtros temporais, excluir leads sem data
      if (isTemporalFilter) {
        console.log(`⚠️ [${component}] Lead sem data excluído de análise temporal:`, lead.Nome);
        return false;
      }
    }
    
    return true;
  });
  
  console.log(`📊 [${component}] Leads após filtragem: ${filtered.length} (eram ${leads.length})`);
  
  return filtered;
}

// Função específica para filtros temporais (gráficos)
export function filterLeadsForTemporal(
  leads: Lead[], 
  dateRange: DateRange, 
  filters: Filters,
  component: string = 'temporal'
): Lead[] {
  return filterLeads(leads, dateRange, filters, { 
    isTemporalFilter: true, 
    component 
  });
}

// Função para validar se os filtros fazem sentido
export function validateFilters(
  leads: Lead[], 
  dateRange: DateRange, 
  filters: Filters
): {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
} {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  // Verificar leads com status válido
  const leadsWithValidStatus = leads.filter(lead => {
    const status = lead.Status?.trim();
    return status && status !== '';
  });
  
  if (leadsWithValidStatus.length === 0) {
    warnings.push('Nenhum lead com status válido encontrado');
    suggestions.push('Verifique se os dados estão sendo importados corretamente');
    return { isValid: false, warnings, suggestions };
  }
  
  // Verificar se há leads na data selecionada
  const leadsInDateRange = leadsWithValidStatus.filter(lead => {
    if (!lead.parsedDate) return false;
    const leadDate = new Date(lead.parsedDate);
    return leadDate >= dateRange.from && leadDate <= dateRange.to;
  });
  
  if (leadsInDateRange.length === 0) {
    warnings.push('Nenhum lead com status válido encontrado no período selecionado');
    suggestions.push('Tente expandir o período de data');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  };
}
