
import type { Lead, DateRange, Filters } from "@/types/lead";

export function filterLeads(leads: Lead[], dateRange: DateRange, filters: Filters): Lead[] {
  console.log('🔍 Filtrando leads:', {
    totalLeads: leads.length,
    dateRange: {
      from: dateRange.from.toLocaleDateString(),
      to: dateRange.to.toLocaleDateString()
    },
    filters,
  });
  
  const filtered = leads.filter(lead => {
    // Filtrar por status apenas se não estiver vazio
    const leadStatus = lead.Status?.trim();
    if (leadStatus && leadStatus !== '') {
      // Se há filtros de status selecionados, aplicar
      if (filters.status.length > 0 && !filters.status.includes(leadStatus)) {
        return false;
      }
    }
    
    // MUDANÇA: Filtragem de data mais flexível
    if (lead.parsedDate) {
      const leadDate = new Date(lead.parsedDate);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      
      leadDate.setHours(0, 0, 0, 0);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);
      
      if (leadDate < fromDate || leadDate > toDate) {
        console.log('❌ Lead rejeitado por data fora do range:', {
          lead: lead.Nome,
          leadDate: leadDate.toLocaleDateString(),
          range: `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`
        });
        return false;
      }
    } else {
      // NOVO: Para leads sem parsedDate, tentar usar a string de data original
      if (lead.data) {
        console.log('⚠️ Lead sem parsedDate, mantendo no resultado:', lead.Nome, lead.data);
        // Manter no resultado para não perder dados
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
    
    return true;
  });
  
  console.log(`📊 Resultado da filtragem: ${filtered.length} de ${leads.length} leads`);
  console.log(`📊 Leads com parsedDate: ${filtered.filter(l => l.parsedDate).length}`);
  console.log(`📊 Leads sem parsedDate: ${filtered.filter(l => !l.parsedDate).length}`);
  
  return filtered;
}
