
import type { Lead, DateRange, Filters } from "@/types/lead";

export interface FilterContext {
  isTemporalFilter?: boolean; // Para gráficos temporais
  component?: string; // Nome do componente que está filtrando
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
  
  console.log(`🔍 [${component.toUpperCase()}] === INÍCIO FILTRO DETALHADO ===`);
  console.log(`🔍 [${component.toUpperCase()}] Total de leads recebidos:`, leads.length);
  console.log(`🔍 [${component.toUpperCase()}] Período selecionado:`, {
    from: dateRange.from.toLocaleDateString(),
    to: dateRange.to.toLocaleDateString()
  });
  console.log(`🔍 [${component.toUpperCase()}] Filtros ativos:`, filters);
  
  // INVESTIGAÇÃO ESPECÍFICA: Buscar leads "Alexandra" e "Marcos" com validação segura
  const leadsAlexandra = leads.filter(lead => 
    lead.Nome && lead.Nome.toLowerCase().includes('alexandra')
  );
  const leadsMarcos = leads.filter(lead => 
    lead.Nome && lead.Nome.toLowerCase().includes('marcos henrique')
  );
  
  console.log(`🔍 [${component}] LEADS ESPECÍFICOS ENCONTRADOS:`);
  console.log(`🔍 [${component}] - Alexandra:`, leadsAlexandra.length, leadsAlexandra.map(l => {
    const safeDate = ensureDateObject(l.parsedDate);
    return {
      Nome: l.Nome,
      Status: l.Status,
      origem: l.origem,
      data: safeDate ? safeDate.toISOString().split('T')[0] : 'sem data',
      vendaCompleta: l['Venda Completa'],
      recorrente: l.recorrente
    };
  }));
  console.log(`🔍 [${component}] - Marcos:`, leadsMarcos.length, leadsMarcos.map(l => {
    const safeDate = ensureDateObject(l.parsedDate);
    return {
      Nome: l.Nome,
      Status: l.Status,
      origem: l.origem,
      data: safeDate ? safeDate.toISOString().split('T')[0] : 'sem data',
      vendaCompleta: l['Venda Completa'],
      recorrente: l.recorrente
    };
  }));
  
  const filtered = leads.filter(lead => {
    // MUDANÇA CRÍTICA 1: Ser menos restritivo com status
    // Não excluir leads apenas por não ter status - pode estar em outro campo
    const leadStatus = lead.Status?.trim();
    
    // Log para leads específicos
    const isTargetLead = (lead.Nome && (
      lead.Nome.toLowerCase().includes('alexandra') || 
      lead.Nome.toLowerCase().includes('marcos henrique')
    ));
    
    if (isTargetLead) {
      const safeDate = ensureDateObject(lead.parsedDate);
      console.log(`🎯 [${component}] PROCESSANDO LEAD ALVO:`, {
        Nome: lead.Nome,
        Status: leadStatus,
        statusOriginal: lead.Status,
        origem: lead.origem,
        camposOrigemDisponiveis: Object.keys(lead as any).filter(key => 
          key.toLowerCase().includes('origem') || 
          key.toLowerCase().includes('source') || 
          key.toLowerCase().includes('campanha')
        ),
        data: safeDate ? safeDate.toISOString().split('T')[0] : 'sem data',
        vendaCompleta: lead['Venda Completa'],
        recorrente: lead.recorrente,
        todosOsCampos: Object.fromEntries(Object.entries(lead as any).filter(([key, value]) => 
          typeof value === 'string' && value.trim() !== ''
        ))
      });
    }
    
    // 1. Filtrar por status apenas se filtros específicos estiverem selecionados
    if (filters.status.length > 0 && leadStatus && !filters.status.includes(leadStatus)) {
      if (isTargetLead) {
        console.log(`❌ [${component}] Lead alvo excluído por filtro de status:`, lead.Nome, leadStatus);
      }
      return false;
    }
    
    // 2. Filtrar por closer
    if (filters.closer.length > 0) {
      const leadCloser = lead.Closer?.trim() || '';
      if (leadCloser && !filters.closer.includes(leadCloser)) {
        if (isTargetLead) {
          console.log(`❌ [${component}] Lead alvo excluído por filtro de closer:`, lead.Nome, leadCloser);
        }
        return false;
      }
    }
    
    // 3. Filtrar por origem
    if (filters.origem.length > 0) {
      const leadOrigem = lead.origem?.trim() || '';
      if (leadOrigem && !filters.origem.includes(leadOrigem)) {
        if (isTargetLead) {
          console.log(`❌ [${component}] Lead alvo excluído por filtro de origem:`, lead.Nome, leadOrigem);
        }
        return false;
      }
    }
    
    // 4. MUDANÇA CRÍTICA 2: Filtrar por data com validação segura
    const safeDate = ensureDateObject(lead.parsedDate);
    if (safeDate) {
      const leadDate = new Date(safeDate);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      
      leadDate.setHours(0, 0, 0, 0);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);
      
      const dentroDoRange = leadDate >= fromDate && leadDate <= toDate;
      
      if (isTargetLead) {
        console.log(`📅 [${component}] Verificação de data para lead alvo:`, {
          Nome: lead.Nome,
          leadDate: leadDate.toISOString().split('T')[0],
          fromDate: fromDate.toISOString().split('T')[0],
          toDate: toDate.toISOString().split('T')[0],
          dentroDoRange
        });
      }
      
      if (!dentroDoRange) {
        if (isTargetLead) {
          console.log(`❌ [${component}] Lead alvo excluído por filtro de data:`, lead.Nome);
        }
        return false;
      }
    } else {
      // MUDANÇA CRÍTICA 3: Para filtros temporais, tentar usar data alternativa
      if (isTemporalFilter) {
        // Tentar extrair data do campo 'data' se parsedDate não existir
        if (lead.data && lead.data.trim() !== '') {
          try {
            const dataAlternativa = new Date(lead.data);
            if (!isNaN(dataAlternativa.getTime())) {
              const leadDate = new Date(dataAlternativa);
              const fromDate = new Date(dateRange.from);
              const toDate = new Date(dateRange.to);
              
              leadDate.setHours(0, 0, 0, 0);
              fromDate.setHours(0, 0, 0, 0);
              toDate.setHours(23, 59, 59, 999);
              
              const dentroDoRange = leadDate >= fromDate && leadDate <= toDate;
              
              if (isTargetLead) {
                console.log(`📅 [${component}] Data alternativa para lead alvo:`, {
                  Nome: lead.Nome,
                  dataOriginal: lead.data,
                  dataConvertida: leadDate.toISOString().split('T')[0],
                  dentroDoRange
                });
              }
              
              if (!dentroDoRange) {
                if (isTargetLead) {
                  console.log(`❌ [${component}] Lead alvo excluído por data alternativa:`, lead.Nome);
                }
                return false;
              }
            }
          } catch (e) {
            if (isTargetLead) {
              console.log(`⚠️ [${component}] Erro ao processar data alternativa para lead alvo:`, lead.Nome, e);
            }
            console.log(`⚠️ [${component}] Lead sem data excluído de análise temporal:`, lead.Nome);
            return false;
          }
        } else {
          if (isTargetLead) {
            console.log(`❌ [${component}] Lead alvo sem data excluído de análise temporal:`, lead.Nome);
          }
          console.log(`⚠️ [${component}] Lead sem data excluído de análise temporal:`, lead.Nome);
          return false;
        }
      }
      // Para análises não temporais, incluir leads sem data
    }
    
    if (isTargetLead) {
      console.log(`✅ [${component}] Lead alvo APROVADO no filtro:`, lead.Nome);
    }
    
    return true;
  });
  
  // Log final detalhado com validação segura
  const leadsAlexandraFiltrados = filtered.filter(lead => 
    lead.Nome && lead.Nome.toLowerCase().includes('alexandra')
  );
  const leadsMarcosFiltrados = filtered.filter(lead => 
    lead.Nome && lead.Nome.toLowerCase().includes('marcos henrique')
  );
  
  console.log(`📊 [${component}] RESULTADO FINAL DO FILTRO:`);
  console.log(`📊 [${component}] - Total antes: ${leads.length}`);
  console.log(`📊 [${component}] - Total depois: ${filtered.length}`);
  console.log(`📊 [${component}] - Alexandra filtrada: ${leadsAlexandraFiltrados.length}/${leadsAlexandra.length}`);
  console.log(`📊 [${component}] - Marcos filtrado: ${leadsMarcosFiltrados.length}/${leadsMarcos.length}`);
  console.log(`🔍 [${component.toUpperCase()}] === FIM FILTRO DETALHADO ===`);
  
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
