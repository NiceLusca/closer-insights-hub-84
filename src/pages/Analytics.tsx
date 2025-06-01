
import React from 'react';
import { useLeadsData } from "@/hooks/useLeadsData";
import { useFilteredLeads } from "@/hooks/useFilteredLeads";
import { useFilters } from "@/hooks/useFilters";
import { LoadingState } from "@/components/Dashboard/LoadingState";
import { CloserPerformanceAnalysis } from "@/components/CloserPerformanceAnalysis";
import { TemporalAnalysis } from "@/components/TemporalAnalysis";
import { PerformanceAlerts } from "@/components/PerformanceAlerts";

const Analytics = () => {
  // Estado dos dados
  const { 
    allLeads, 
    isLoading, 
    loadingProgress, 
    loadingStage 
  } = useLeadsData();
  
  // Estado dos filtros
  const {
    dateRange,
    filters
  } = useFilters();

  // Dados processados
  const filteredLeads = useFilteredLeads(allLeads, dateRange, filters);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Análises Detalhadas</h1>
          <p className="text-gray-300">Performance, tendências e insights avançados</p>
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
            {/* Alertas de Performance */}
            <PerformanceAlerts leads={filteredLeads} />

            {/* Performance dos Closers */}
            <CloserPerformanceAnalysis leads={filteredLeads} />

            {/* Análise Temporal */}
            <TemporalAnalysis leads={filteredLeads} />
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
