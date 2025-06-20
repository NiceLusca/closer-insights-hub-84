
import type { Lead, DateRange, Filters } from "@/types/lead";

export interface FilterContext {
  isTemporalFilter?: boolean;
  component?: string;
}

// Função auxiliar para converter parsedDate em Date se necessário
function ensureDateObject(dateValue: any): Date | null {
  if (!dateValue) return null;
  
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  return null;
}

export function filterLeads(
  leads: Lead[], 
  dateRange: DateRange, 
  filters: Filters,
  context: FilterContext = {}
): Lead[] {
  const { isTemporalFilter = false, component = 'unknown' } = context;
  
  console.log(`🔍 [${component.toUpperCase()}] === FILTRO CORRIGIDO E MENOS RESTRITIVO ===`);
  console.log(`🔍 [${component.toUpperCase()}] Total de leads recebidos:`, leads.length);
  console.log(`🔍 [${component.toUpperCase()}] Período selecionado:`, {
    from: dateRange.from.toLocaleDateString(),
    to: dateRange.to.toLocaleDateString()
  });
  
  const filtered = leads.filter(lead => {
    // CORREÇÃO 1: Ser MUITO menos restritivo com status
    if (filters.status.length > 0) {
      const leadStatus = lead.Status?.trim();
      if (leadStatus && !filters.status.includes(leadStatus)) {
        return false;
      }
      // Se lead não tem status mas filtro está ativo, INCLUIR mesmo assim
    }
    
    // CORREÇÃO 2: Filtrar por closer (menos restritivo)
    if (filters.closer.length > 0) {
      const leadCloser = lead.Closer?.trim() || '';
      if (leadCloser && !filters.closer.includes(leadCloser)) {
        return false;
      }
      // Se lead não tem closer, INCLUIR mesmo assim
    }
    
    // CORREÇÃO 3: Filtrar por origem (menos restritivo)
    if (filters.origem.length > 0) {
      const leadOrigem = lead.origem?.trim() || '';
      if (leadOrigem && !filters.origem.includes(leadOrigem)) {
        return false;
      }
      // Se lead não tem origem, INCLUIR mesmo assim
    }
    
    // CORREÇÃO 4: Filtrar por data com validação rigorosa de anos
    const safeDate = ensureDateObject(lead.parsedDate);
    if (safeDate) {
      const leadDate = new Date(safeDate);
      
      // VALIDAÇÃO CRÍTICA: Rejeitar datas muito antigas (antes de 2020) ou muito futuras
      if (leadDate.getFullYear() < 2020 || leadDate.getFullYear() > 2030) {
        console.warn(`⚠️ [${component}] Data rejeitada (ano inválido):`, leadDate.toISOString().split('T')[0], 'Lead:', lead.Nome);
        return false;
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
      // CORREÇÃO 5: Tentar usar campo 'data' como fallback
      if (lead.data && lead.data.trim() !== '') {
        try {
          const dataAlternativa = new Date(lead.data);
          if (!isNaN(dataAlternativa.getTime())) {
            // VALIDAÇÃO: Rejeitar datas com anos inválidos
            if (dataAlternativa.getFullYear() < 2020 || dataAlternativa.getFullYear() > 2030) {
              console.warn(`⚠️ [${component}] Data alternativa rejeitada (ano inválido):`, dataAlternativa.toISOString().split('T')[0]);
              return false;
            }
            
            const leadDate = new Date(dataAlternativa);
            const fromDate = new Date(dateRange.from);
            const toDate = new Date(dateRange.to);
            
            leadDate.setHours(0, 0, 0, 0);
            fromDate.setHours(0, 0, 0, 0);
            toDate.setHours(23, 59, 59, 999);
            
            const dentroDoRange = leadDate >= fromDate && leadDate <= toDate;
            
            if (!dentroDoRange) {
              return false;
            }
          }
        } catch (e) {
          // Para análises não temporais, incluir leads sem data válida
          if (isTemporalFilter) {
            return false;
          }
        }
      } else {
        // Para análises temporais, excluir leads sem data
        if (isTemporalFilter) {
          return false;
        }
        // Para outras análises, INCLUIR leads sem data válida
      }
    }
    
    return true;
  });
  
  console.log(`📊 [${component}] RESULTADO FINAL (MENOS RESTRITIVO):`);
  console.log(`📊 [${component}] - Total antes: ${leads.length}`);
  console.log(`📊 [${component}] - Total depois: ${filtered.length}`);
  console.log(`📊 [${component}] - Filtros aplicados com lógica menos restritiva`);
  
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
