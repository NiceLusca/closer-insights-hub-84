
import React from 'react';
import { useLeadsData } from "@/hooks/useLeadsData";
import { useFilteredLeads } from "@/hooks/useFilteredLeads";
import { useGlobalFilters } from "@/contexts/FilterContext";
import { LoadingState } from "@/components/Dashboard/LoadingState";
import { CloserPerformanceAnalysis } from "@/components/CloserPerformanceAnalysis";
import { TemporalAnalysis } from "@/components/TemporalAnalysis";
import { MonthlyRevenueHistory } from "@/components/MonthlyRevenueHistory";

const Analytics = () => {
  // Estado dos dados
  const { 
    allLeads, 
    isLoading, 
    loadingProgress, 
    loadingStage,
    isCacheValid
  } = useLeadsData();
  
  // Estado dos filtros globais
  const { dateRange, filters } = useGlobalFilters();

  // Dados processados
  const { filteredLeads } = useFilteredLeads(allLeads, dateRange, filters, 'analytics');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Análises Detalhadas</h1>
          <p className="text-gray-300">Performance, tendências e insights avançados</p>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-sm text-gray-400">
              Filtros ativos: {filteredLeads.length} leads de {allLeads.length} total
            </p>
            <span className={`text-xs px-2 py-1 rounded ${
              isCacheValid ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {isCacheValid ? 'Cache válido' : 'Cache expirado'}
            </span>
          </div>
        </div>

        {/* Loading State com progresso */}
        {isLoading && (
          <LoadingState 
            progress={loadingProgress} 
            stage={loadingStage}
          />
        )}

        {/* Conteúdo principal apenas quando não está carregando */}
        {!isLoading && (
          <>
            {/* Performance dos Closers */}
            <CloserPerformanceAnalysis leads={filteredLeads} />

            {/* Análise Temporal */}
            <TemporalAnalysis leads={filteredLeads} />

            {/* Histórico de Faturamento Mensal - usando allLeads para não ser afetado pelos filtros */}
            <MonthlyRevenueHistory leads={allLeads} />
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
