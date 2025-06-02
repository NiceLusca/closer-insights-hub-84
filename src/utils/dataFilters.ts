
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
    // 1. Filtrar por status apenas se não estiver vazio
    const leadStatus = lead.Status?.trim();
    if (leadStatus && leadStatus !== '') {
      // Se há filtros de status selecionados, aplicar
      if (filters.status.length > 0 && !filters.status.includes(leadStatus)) {
        return false;
      }
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
        if (isTemporalFilter) {
          console.log(`❌ [${component}] Lead rejeitado por data (temporal):`, {
            lead: lead.Nome,
            leadDate: leadDate.toLocaleDateString(),
            range: `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`
          });
        }
        return false;
      }
    } else {
      // Para filtros temporais, excluir leads sem data
      if (isTemporalFilter) {
        console.log(`⚠️ [${component}] Lead sem data excluído de análise temporal:`, lead.Nome);
        return false;
      }
      // Para filtros gerais, manter leads sem data (podem ser analisados por status/closer)
      console.log(`⚠️ [${component}] Lead sem data mantido para análise geral:`, lead.Nome);
    }
    
    return true;
  });
  
  // Debug detalhado sobre o resultado da filtragem
  const statusDistribution = filtered.reduce((acc, lead) => {
    const status = lead.Status || 'Sem Status';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log(`📊 [${component}] Resultado da filtragem:`, {
    total: filtered.length,
    original: leads.length,
    comData: filtered.filter(l => l.parsedDate).length,
    semData: filtered.filter(l => !l.parsedDate).length,
    statusDistribution
  });
  
  // Validação específica para "A Ser Atendido"
  if (filters.status.length === 0 || filters.status.includes('Agendado')) {
    const aSerAtendido = filtered.filter(l => 
      ['Agendado', 'Confirmado', 'Remarcou', 'DCAUSENTE'].includes(l.Status || '')
    );
    console.log(`🎯 [${component}] Leads "A Ser Atendido" no período: ${aSerAtendido.length}`);
  }
  
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
  
  // Verificar se há leads na data selecionada
  const leadsInDateRange = leads.filter(lead => {
    if (!lead.parsedDate) return false;
    const leadDate = new Date(lead.parsedDate);
    return leadDate >= dateRange.from && leadDate <= dateRange.to;
  });
  
  if (leadsInDateRange.length === 0) {
    warnings.push('Nenhum lead encontrado no período selecionado');
    suggestions.push('Tente expandir o período de data');
  }
  
  // Verificar filtros de status
  if (filters.status.length > 0) {
    const leadsWithStatus = leadsInDateRange.filter(lead => 
      filters.status.includes(lead.Status || '')
    );
    
    if (leadsWithStatus.length === 0) {
      warnings.push(`Nenhum lead com status [${filters.status.join(', ')}] no período`);
      suggestions.push('Verifique se os status selecionados existem na data');
    }
  }
  
  // Verificar filtros de closer
  if (filters.closer.length > 0) {
    const leadsWithCloser = leadsInDateRange.filter(lead => 
      filters.closer.includes(lead.Closer || '')
    );
    
    if (leadsWithCloser.length === 0) {
      warnings.push(`Nenhum lead dos closers [${filters.closer.join(', ')}] no período`);
    }
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  };
}
