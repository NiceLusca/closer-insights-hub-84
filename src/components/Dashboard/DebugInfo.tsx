
import React from 'react';
import type { Lead, DateRange } from "@/types/lead";

interface DebugInfoProps {
  allLeads: Lead[];
  filteredLeads: Lead[];
  dateRange: DateRange;
}

export function DebugInfo({ allLeads, filteredLeads, dateRange }: DebugInfoProps) {
  return (
    <div className="mb-4 p-4 bg-gray-800/50 rounded-lg text-sm text-gray-300">
      <p>📊 Total de leads carregados: {allLeads.length}</p>
      <p>🔍 Leads após filtros: {filteredLeads.length}</p>
      <p>📅 Período: {dateRange.from.toLocaleDateString()} até {dateRange.to.toLocaleDateString()}</p>
    </div>
  );
}
