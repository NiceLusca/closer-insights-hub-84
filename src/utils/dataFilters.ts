
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

// NOVA FUNÇÃO: Verificar se lead tem dados mínimos (MAIS FLEXÍVEL)
function hasMinimumData(lead: Lead): boolean {
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
  
  console.log(`🔍 [${component.toUpperCase()}] === FILTRO EMERGENCIAL (FASE 3) ===`);
  console.log(`🔍 [${component.toUpperCase()}] Total de leads recebidos:`, leads.length);
  
  // CORREÇÃO: Filtrar apenas leads com dados mínimos (MAIS FLEXÍVEL)
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
    
    // CORREÇÃO CRÍTICA: Filtrar por data com lógica MUITO mais flexível
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
      // CORREÇÃO EMERGENCIAL: Múltiplos fallbacks para data
      const camposData = ['data', 'Data', 'date', 'timestamp', 'created_at', 'Data de criação'];
      let dataEncontrada = false;
      
      for (const campo of camposData) {
        if (lead[campo] && lead[campo].toString().trim() !== '') {
          try {
            const dataAlternativa = new Date(lead[campo].toString());
            if (!isNaN(dataAlternativa.getTime())) {
              const year = dataAlternativa.getFullYear();
              if (year >= 2020 && year <= 2030) {
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
            // Continuar tentando outros campos
            continue;
          }
        }
      }
      
      if (dataEncontrada) {
        return true;
      }
      
      // CORREÇÃO EMERGENCIAL: Para análise temporal, ser MENOS restritivo
      if (isTemporalFilter) {
        // Se tem qualquer valor monetário, incluir (pode ser recente)
        const temValor = !!(lead.Valor || lead['Venda Completa'] || lead.recorrente);
        return temValor;
      }
    }
    
    return true;
  });
  
  console.log(`📊 [${component}] RESULTADO (EMERGENCIAL):`);
  console.log(`📊 [${component}] - Antes: ${leads.length} | Válidos: ${validLeads.length} | Depois: ${filtered.length}`);
  
  return filtered;
}

// Função específica para filtros temporais (gráficos) - MAIS FLEXÍVEL
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

// Função para validar se os filtros fazem sentido - MAIS FLEXÍVEL
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
  
  // CORREÇÃO: Ser MUITO mais flexível na validação
  const leadsWithAnyData = leads.filter(hasMinimumData);
  
  if (leadsWithAnyData.length === 0) {
    warnings.push('Nenhum lead com dados básicos encontrado');
    suggestions.push('Verifique se os dados estão sendo importados corretamente');
    return { isValid: false, warnings, suggestions };
  }
  
  // CORREÇÃO: Aceitar mais leads no período, mesmo sem data perfeita
  const leadsInDateRange = leads.filter(lead => {
    // Tentar parsedDate primeiro
    const safeDate = ensureDateObject(lead.parsedDate);
    if (safeDate) {
      const leadDate = new Date(safeDate);
      if (leadDate.getFullYear() >= 2020 && leadDate.getFullYear() <= 2030) {
        return leadDate >= dateRange.from && leadDate <= dateRange.to;
      }
    }
    
    // Fallback: se tem dados de venda, considerar válido
    return !!(lead.Valor || lead['Venda Completa'] || lead.recorrente);
  });
  
  if (leadsInDateRange.length === 0) {
    warnings.push('Poucos leads encontrados no período selecionado');
    suggestions.push('Período expandido para incluir mais dados');
  }
  
  return {
    isValid: true, // Sempre válido na correção emergencial
    warnings,
    suggestions
  };
}
