
import React from 'react';
import type { Lead, DateRange } from "@/types/lead";

interface DebugInfoProps {
  allLeads: Lead[];
  filteredLeads: Lead[];
  dateRange: DateRange;
  cacheStatus: string;
  validation?: {
    isValid: boolean;
    warnings: string[];
    suggestions: string[];
  };
}

export function DebugInfo({ 
  allLeads, 
  filteredLeads, 
  dateRange, 
  cacheStatus, 
  validation 
}: DebugInfoProps) {
  // Análise detalhada dos leads filtrados
  const statusBreakdown = filteredLeads.reduce((acc, lead) => {
    const status = lead.Status || 'Sem Status';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const aSerAtendido = filteredLeads.filter(lead => 
    ['Agendado', 'Confirmado', 'Remarcou', 'DCAUSENTE'].includes(lead.Status || '')
  ).length;

  return (
    <div className="mb-4 p-4 bg-gray-800/50 rounded-lg text-sm text-gray-300">
      <p>📊 Total de leads carregados: {allLeads.length}</p>
      <p>🔍 Leads após filtros: {filteredLeads.length}</p>
      <p>📅 Período: {dateRange.from.toLocaleDateString()} até {dateRange.to.toLocaleDateString()}</p>
      <p>💾 Cache: {cacheStatus}</p>
      
      {/* Breakdown detalhado por status */}
      <div className="mt-2 space-y-1">
        <p className="font-medium text-gray-200">📋 Distribuição por Status no Período:</p>
        {Object.entries(statusBreakdown).map(([status, count]) => (
          <p key={status} className="ml-4 text-xs">
            • {status}: {count} leads
          </p>
        ))}
        <p className="ml-4 text-xs font-medium text-blue-300">
          🎯 "A Ser Atendido" (Agendado+Confirmado+Remarcou+DCAUSENTE): {aSerAtendido} leads
        </p>
      </div>

      {/* Validação de filtros */}
      {validation && !validation.isValid && (
        <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded">
          <p className="font-medium text-yellow-300">⚠️ Avisos sobre Filtros:</p>
          {validation.warnings.map((warning, idx) => (
            <p key={idx} className="text-xs text-yellow-200 ml-2">• {warning}</p>
          ))}
          {validation.suggestions.length > 0 && (
            <div className="mt-1">
              <p className="text-xs font-medium text-yellow-300">💡 Sugestões:</p>
              {validation.suggestions.map((suggestion, idx) => (
                <p key={idx} className="text-xs text-yellow-200 ml-2">• {suggestion}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
