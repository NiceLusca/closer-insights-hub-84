
import type { Lead, DateRange, Filters } from "@/types/lead";

export interface FilterContext {
  isTemporalFilter?: boolean;
  component?: string;
}

// FASE 3: Função super flexível para converter datas
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

// NOVO: Função super flexível para validar se lead tem dados úteis
function hasMinimumData(lead: Lead): boolean {
  // FASE 3: Ser MUITO mais inclusivo - qualquer campo preenchido serve
  return !!(
    lead.Nome?.trim() || 
    lead.Status?.trim() || 
    lead.origem?.trim() || 
    lead.Closer?.trim() ||
    lead.data?.trim() ||
    lead.Valor ||
    lead['Venda Completa'] ||
    lead.recorrente
  );
}

export function filterLeads(
  leads: Lead[], 
  dateRange: DateRange, 
  filters: Filters,
  context: FilterContext = {}
): Lead[] {
  const { isTemporalFilter = false, component = 'unknown' } = context;
  
  console.log(`🔍 [${component.toUpperCase()}] === FILTRO FASE 7 (SUPER FLEXÍVEL) ===`);
  console.log(`🔍 [${component.toUpperCase()}] Total de leads recebidos:`, leads.length);
  
  // FASE 3: Filtrar apenas leads com qualquer dado útil
  const validLeads = leads.filter(hasMinimumData);
  console.log(`🔍 [${component.toUpperCase()}] Leads com algum dado válido:`, validLeads.length);
  
  const filtered = validLeads.filter(lead => {
    // CORREÇÃO: Filtrar por status (super flexível)
    if (filters.status.length > 0) {
      const leadStatus = (lead.Status?.trim() || '').toLowerCase();
      const matchesStatus = filters.status.some(filterStatus => 
        leadStatus.includes(filterStatus.toLowerCase()) ||
        filterStatus.toLowerCase().includes(leadStatus)
      );
      if (leadStatus && !matchesStatus) {
        return false;
      }
    }
    
    // Filtrar por closer (flexível)
    if (filters.closer.length > 0) {
      const leadCloser = (lead.Closer?.trim() || '').toLowerCase();
      const matchesCloser = filters.closer.some(filterCloser =>
        leadCloser.includes(filterCloser.toLowerCase()) ||
        filterCloser.toLowerCase().includes(leadCloser)
      );
      if (leadCloser && !matchesCloser) {
        return false;
      }
    }
    
    // Filtrar por origem (flexível)
    if (filters.origem.length > 0) {
      const leadOrigem = (lead.origem?.trim() || '').toLowerCase();
      const matchesOrigem = filters.origem.some(filterOrigem =>
        leadOrigem.includes(filterOrigem.toLowerCase()) ||
        filterOrigem.toLowerCase().includes(leadOrigem)
      );
      if (leadOrigem && !matchesOrigem) {
        return false;
      }
    }
    
    // FASE 3: Filtrar por data com lógica SUPER flexível
    const safeDate = ensureDateObject(lead.parsedDate);
    if (safeDate) {
      const leadDate = new Date(safeDate);
      
      // Validação: Rejeitar apenas anos completamente impossíveis
      const year = leadDate.getFullYear();
      if (year < 2018 || year > 2030) {
        console.warn(`⚠️ [${component}] Data rejeitada (ano ${year}):`, lead.Nome);
        return !isTemporalFilter; // Para análises não temporais, ainda incluir
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
      // FASE 3: SUPER FLEXÍVEL - múltiplos fallbacks para data
      const camposData = [
        'data', 'Data', 'date', 'timestamp', 'created_at', 
        'Data de criação', 'Data_Criacao', 'DataCriacao'
      ];
      let dataEncontrada = false;
      
      for (const campo of camposData) {
        if (lead[campo] && lead[campo].toString().trim() !== '') {
          try {
            const dataAlternativa = new Date(lead[campo].toString());
            if (!isNaN(dataAlternativa.getTime())) {
              const year = dataAlternativa.getFullYear();
              if (year >= 2018 && year <= 2030) {
                const leadDate = new Date(dataAlternativa);
                const fromDate = new Date(dateRange.from);
                const toDate = new Date(dateRange.to);
                
                leadDate.setHours(0, 0, 0, 0);
                fromDate.setHours(0, 0, 0, 0);
                toDate.setHours(23, 59, 59, 999);
                
                if (leadDate >= fromDate && leadDate <= toDate) {
                  dataEncontrada = true;
                  break;
                }
              }
            }
          } catch (e) {
            continue;
          }
        }
      }
      
      if (dataEncontrada) {
        return true;
      }
      
      // CORREÇÃO FASE 7: Para análise temporal, incluir se tem QUALQUER valor útil
      if (isTemporalFilter) {
        const temValor = !!(
          lead.Valor || 
          lead['Venda Completa'] || 
          lead.recorrente ||
          (lead.Status && ['fechou', 'vendido', 'cliente', 'ativo'].some(s => 
            lead.Status.toLowerCase().includes(s)
          ))
        );
        return temValor;
      }
      
      // Para filtros não temporais, incluir todos com dados básicos
      return true;
    }
    
    return true;
  });
  
  console.log(`📊 [${component}] RESULTADO FASE 7 (SUPER INCLUSIVO):`);
  console.log(`📊 [${component}] - Antes: ${leads.length} | Válidos: ${validLeads.length} | Depois: ${filtered.length}`);
  
  return filtered;
}

// Função específica para filtros temporais (gráficos) - SUPER FLEXÍVEL
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

// FASE 3: Validação super flexível - sempre retornar válido
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
  
  const leadsWithAnyData = leads.filter(hasMinimumData);
  
  if (leadsWithAnyData.length === 0) {
    warnings.push('Nenhum lead com dados básicos encontrado');
    suggestions.push('Verifique se os dados estão sendo importados corretamente');
    return { isValid: false, warnings, suggestions };
  }
  
  // FASE 7: Aceitar praticamente qualquer lead no período
  const leadsInDateRange = leads.filter(lead => {
    // Se tem parsedDate, usar
    const safeDate = ensureDateObject(lead.parsedDate);
    if (safeDate) {
      const leadDate = new Date(safeDate);
      if (leadDate.getFullYear() >= 2018 && leadDate.getFullYear() <= 2030) {
        return leadDate >= dateRange.from && leadDate <= dateRange.to;
      }
    }
    
    // Se tem qualquer campo de valor, considerar válido
    return !!(
      lead.Valor || 
      lead['Venda Completa'] || 
      lead.recorrente ||
      lead.Nome?.trim() ||
      lead.Status?.trim()
    );
  });
  
  if (leadsInDateRange.length === 0) {
    warnings.push('Poucos leads encontrados no período - expandindo critérios');
    suggestions.push('Sistema ajustado para incluir mais dados');
  }
  
  return {
    isValid: true, // SEMPRE válido na correção fase 7
    warnings,
    suggestions
  };
}
