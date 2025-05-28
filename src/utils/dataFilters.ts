
import type { Lead, DateRange, Filters } from "@/types/lead";

export function filterLeads(leads: Lead[], dateRange: DateRange, filters: Filters): Lead[] {
  console.log('Filtrando leads:', {
    totalLeads: leads.length,
    dateRange,
    filters,
  });
  
  const filtered = leads.filter(lead => {
    // Filter by date range
    if (lead.parsedDate) {
      const leadDate = lead.parsedDate;
      if (leadDate < dateRange.from || leadDate > dateRange.to) {
        return false;
      }
    } else {
      console.log('Lead sem data parseada:', lead.data, lead.Nome);
      // Se não tem data parseada, incluir no filtro (pode ser um lead novo/inválido)
      // Você pode mudar essa lógica se preferir excluir leads sem data
    }
    
    // Filter by status - tratar strings vazias
    if (filters.status.length > 0) {
      const leadStatus = lead.Status || '';
      if (!filters.status.includes(leadStatus)) {
        return false;
      }
    }
    
    // Filter by closer - tratar strings vazias
    if (filters.closer.length > 0) {
      const leadCloser = lead.Closer || '';
      if (!filters.closer.includes(leadCloser)) {
        return false;
      }
    }
    
    // Filter by origem - tratar strings vazias
    if (filters.origem.length > 0) {
      const leadOrigem = lead.origem || '';
      if (!filters.origem.includes(leadOrigem)) {
        return false;
      }
    }
    
    return true;
  });
  
  console.log(`Filtrado: ${filtered.length} de ${leads.length} leads`);
  return filtered;
}
