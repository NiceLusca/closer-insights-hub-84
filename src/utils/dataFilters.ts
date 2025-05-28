
import type { Lead, DateRange, Filters } from "@/types/lead";

export function filterLeads(leads: Lead[], dateRange: DateRange, filters: Filters): Lead[] {
  console.log('Filtrando leads:', {
    totalLeads: leads.length,
    dateRange,
    filters,
  });
  
  const filtered = leads.filter(lead => {
    // PRIMEIRO: Excluir leads com status vazio ou inválido
    const leadStatus = lead.Status?.trim();
    if (!leadStatus || leadStatus === '') {
      console.log('Lead excluído por status vazio:', lead.Nome);
      return false;
    }
    
    // Filter by date range
    if (lead.parsedDate) {
      const leadDate = lead.parsedDate;
      if (leadDate < dateRange.from || leadDate > dateRange.to) {
        return false;
      }
    } else {
      console.log('Lead sem data parseada:', lead.data, lead.Nome);
      // Se não tem data parseada, incluir no filtro (pode ser um lead novo/inválido)
    }
    
    // Filter by status
    if (filters.status.length > 0) {
      if (!filters.status.includes(leadStatus)) {
        return false;
      }
    }
    
    // Filter by closer
    if (filters.closer.length > 0) {
      const leadCloser = lead.Closer?.trim() || '';
      if (!filters.closer.includes(leadCloser)) {
        return false;
      }
    }
    
    // Filter by origem
    if (filters.origem.length > 0) {
      const leadOrigem = lead.origem?.trim() || '';
      if (!filters.origem.includes(leadOrigem)) {
        return false;
      }
    }
    
    return true;
  });
  
  console.log(`Filtrado: ${filtered.length} de ${leads.length} leads (excluindo status vazios)`);
  return filtered;
}
