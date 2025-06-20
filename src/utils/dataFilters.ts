import type { Lead, DateRange, Filters } from "@/types/lead";

export interface FilterContext {
  isTemporalFilter?: boolean;
  component?: string;
}

// CORREÇÃO CRÍTICA: Função melhorada para converter datas
function ensureDateObject(dateValue: any): Date | null {
  if (!dateValue) return null;
  
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }
  
  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  return null;
}

// NOVA FUNÇÃO: Verificar se lead tem dados mínimos
function hasMinimumData(lead: Lead): boolean {
  return !!(lead.Nome?.trim() || lead.Status?.trim() || lead.origem?.trim() || lead.Closer?.trim());
}

export function filterLeads(
  leads: Lead[], 
  dateRange: DateRange, 
  filters: Filters,
  context: FilterContext = {}
): Lead[] {
  const { isTemporalFilter = false, component = 'unknown' } = context;
  
  console.log(`🔍 [${component.toUpperCase()}] === FILTRO OTIMIZADO (FASE 2) ===`);
  console.log(`🔍 [${component.toUpperCase()}] Total de leads recebidos:`, leads.length);
  
  // CORREÇÃO: Filtrar apenas leads com dados mínimos
  const validLeads = leads.filter(hasMinimumData);
  console.log(`🔍 [${component.toUpperCase()}] Leads com dados válidos:`, validLeads.length);
  
  const filtered = validLeads.filter(lead => {
    // Filtrar por status (menos restritivo)
    if (filters.status.length > 0) {
      const leadStatus = lead.Status?.trim();
      if (leadStatus && !filters.status.includes(leadStatus)) {
        return false;
      }
    }
    
    // Filtrar por closer
    if (filters.closer.length > 0) {
      const leadCloser = lead.Closer?.trim() || '';
      if (leadCloser && !filters.closer.includes(leadCloser)) {
        return false;
      }
    }
    
    // Filtrar por origem
    if (filters.origem.length > 0) {
      const leadOrigem = lead.origem?.trim() || '';
      if (leadOrigem && !filters.origem.includes(leadOrigem)) {
        return false;
      }
    }
    
    // CORREÇÃO CRÍTICA: Filtrar por data com lógica melhorada
    const safeDate = ensureDateObject(lead.parsedDate);
    if (safeDate) {
      const leadDate = new Date(safeDate);
      
      // Validação crítica: Rejeitar anos impossíveis
      const year = leadDate.getFullYear();
      if (year < 2020 || year > 2030) {
        console.warn(`⚠️ [${component}] Data rejeitada (ano ${year}):`, lead.Nome);
        return !isTemporalFilter; // Para análises não temporais, incluir
      }
      
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      
      leadDate.setHours(0, 0, 0, 0);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);
      
      const dentroDoRange = leadDate >= fromDate && leadDate <= toDate;
      
      if (!dentroDoRange) {
        return false;
      }
    } else {
      // CORREÇÃO: Tentar campo 'data' como fallback
      if (lead.data && lead.data.trim() !== '') {
        try {
          const dataAlternativa = new Date(lead.data);
          if (!isNaN(dataAlternativa.getTime())) {
            const year = dataAlternativa.getFullYear();
            if (year >= 2020 && year <= 2030) {
              const leadDate = new Date(dataAlternativa);
              const fromDate = new Date(dateRange.from);
              const toDate = new Date(dateRange.to);
              
              leadDate.setHours(0, 0, 0, 0);
              fromDate.setHours(0, 0, 0, 0);
              toDate.setHours(23, 59, 59, 999);
              
              return leadDate >= fromDate && leadDate <= toDate;
            }
          }
        } catch (e) {
          // Continuar processamento
        }
      }
      
      // Para análises temporais, excluir leads sem data válida
      if (isTemporalFilter) {
        return false;
      }
    }
    
    return true;
  });
  
  console.log(`📊 [${component}] RESULTADO (OTIMIZADO):`);
  console.log(`📊 [${component}] - Antes: ${leads.length} | Válidos: ${validLeads.length} | Depois: ${filtered.length}`);
  
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
  
  // CORREÇÃO: Ser menos restritivo na validação
  const leadsWithAnyData = leads.filter(lead => {
    return lead.Nome?.trim() || lead.Status?.trim() || lead.origem?.trim() || lead.Closer?.trim();
  });
  
  if (leadsWithAnyData.length === 0) {
    warnings.push('Nenhum lead com dados básicos encontrado');
    suggestions.push('Verifique se os dados estão sendo importados corretamente');
    return { isValid: false, warnings, suggestions };
  }
  
  // Verificar se há leads no período (com validação de anos)
  const leadsInDateRange = leads.filter(lead => {
    const safeDate = ensureDateObject(lead.parsedDate);
    if (!safeDate) return false;
    
    const leadDate = new Date(safeDate);
    // Rejeitar apenas datas obviamente inválidas (anos impossíveis)
    if (leadDate.getFullYear() < 2020 || leadDate.getFullYear() > 2030) return false;
    
    return leadDate >= dateRange.from && leadDate <= dateRange.to;
  });
  
  if (leadsInDateRange.length === 0) {
    warnings.push('Poucos leads encontrados no período selecionado');
    suggestions.push('Considere expandir o período de data ou verificar filtros');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  };
}
