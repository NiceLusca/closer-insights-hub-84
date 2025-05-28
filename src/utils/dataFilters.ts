
import type { Lead, DateRange, Filters } from "@/types/lead";

export function filterLeads(leads: Lead[], dateRange: DateRange, filters: Filters): Lead[] {
  console.log('🔍 Filtrando leads:', {
    totalLeads: leads.length,
    dateRange: {
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString()
    },
    filters,
  });
  
  const filtered = leads.filter(lead => {
    console.log(`🔍 Analisando lead: ${lead.Nome} - Status: "${lead.Status}" - Data: ${lead.data} - ParsedDate: ${lead.parsedDate}`);
    
    // PRIMEIRO: Excluir leads com status vazio ou inválido
    const leadStatus = lead.Status?.trim();
    if (!leadStatus || leadStatus === '') {
      console.log(`❌ Lead excluído por status vazio: ${lead.Nome}`);
      return false;
    }
    
    // Filter by date range
    if (lead.parsedDate) {
      const leadDate = new Date(lead.parsedDate);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      
      // Ajustar as horas para comparação correta
      leadDate.setHours(0, 0, 0, 0);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);
      
      console.log(`📅 Comparando datas - Lead: ${leadDate.toISOString()} | From: ${fromDate.toISOString()} | To: ${toDate.toISOString()}`);
      
      if (leadDate < fromDate || leadDate > toDate) {
        console.log(`❌ Lead excluído por data fora do range: ${lead.Nome} - ${leadDate.toLocaleDateString()}`);
        return false;
      } else {
        console.log(`✅ Lead dentro do range de data: ${lead.Nome} - ${leadDate.toLocaleDateString()}`);
      }
    } else {
      console.log(`⚠️ Lead sem data parseada, excluindo: ${lead.Nome} - ${lead.data}`);
      return false; // Mudança: excluir leads sem data parseada válida
    }
    
    // Filter by status
    if (filters.status.length > 0) {
      if (!filters.status.includes(leadStatus)) {
        console.log(`❌ Lead excluído por filtro de status: ${lead.Nome} - Status: ${leadStatus}`);
        return false;
      }
    }
    
    // Filter by closer
    if (filters.closer.length > 0) {
      const leadCloser = lead.Closer?.trim() || '';
      if (!filters.closer.includes(leadCloser)) {
        console.log(`❌ Lead excluído por filtro de closer: ${lead.Nome} - Closer: ${leadCloser}`);
        return false;
      }
    }
    
    // Filter by origem
    if (filters.origem.length > 0) {
      const leadOrigem = lead.origem?.trim() || '';
      if (!filters.origem.includes(leadOrigem)) {
        console.log(`❌ Lead excluído por filtro de origem: ${lead.Nome} - Origem: ${leadOrigem}`);
        return false;
      }
    }
    
    console.log(`✅ Lead aprovado em todos os filtros: ${lead.Nome}`);
    return true;
  });
  
  console.log(`📊 Resultado da filtragem: ${filtered.length} de ${leads.length} leads aprovados`);
  console.log('📋 Leads filtrados sample:', filtered.slice(0, 3).map(l => ({ nome: l.Nome, data: l.data, parsedDate: l.parsedDate, status: l.Status })));
  return filtered;
}
