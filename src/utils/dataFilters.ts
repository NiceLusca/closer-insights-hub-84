
import type { Lead, DateRange, Filters } from "@/types/lead";

export function filterLeads(leads: Lead[], dateRange: DateRange, filters: Filters): Lead[] {
  return leads.filter(lead => {
    // Filter by date range
    if (lead.parsedDate) {
      const leadDate = lead.parsedDate;
      if (leadDate < dateRange.from || leadDate > dateRange.to) {
        return false;
      }
    }
    
    // Filter by status
    if (filters.status.length > 0 && !filters.status.includes(lead.Status)) {
      return false;
    }
    
    // Filter by closer
    if (filters.closer.length > 0 && !filters.closer.includes(lead.Closer)) {
      return false;
    }
    
    // Filter by origem
    if (filters.origem.length > 0 && !filters.origem.includes(lead.origem)) {
      return false;
    }
    
    return true;
  });
}
