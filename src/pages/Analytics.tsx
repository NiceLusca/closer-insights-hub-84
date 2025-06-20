
import React from 'react';
import { useFastLeadsData } from "@/hooks/useFastLeadsData";
import { useFilteredLeads } from "@/hooks/useFilteredLeads";
import { useGlobalFilters } from "@/contexts/FilterContext";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/Dashboard/LoadingState";
import { CloserPerformanceAnalysis } from "@/components/CloserPerformanceAnalysis";
import { TemporalAnalysis } from "@/components/TemporalAnalysis";
import { MonthlyRevenueHistory } from "@/components/MonthlyRevenueHistory";

const Analytics = () => {
  // MIGRAÇÃO CRÍTICA: Usar EXCLUSIVAMENTE useFastLeadsData (Sistema Unificado)
  const { 
    allLeads, 
    isLoading, 
    lastUpdated,
    cacheStatus
  } = useFastLeadsData();
  
  // Estado dos filtros globais
  const { dateRange, filters } = useGlobalFilters();

  // Usar leads filtrados para todos os componentes da página Analytics
  const { filteredLeads } = useFilteredLeads(allLeads, dateRange, filters, 'analytics');

  console.log('📊 [ANALYTICS PAGE] === MIGRAÇÃO PARA SISTEMA UNIFICADO ===');
  console.log('📊 [ANALYTICS PAGE] - Total de leads brutos:', allLeads.length);
  console.log('📊 [ANALYTICS PAGE] - Leads filtrados:', filteredLeads.length);
  console.log('📊 [ANALYTICS PAGE] - Cache status:', cacheStatus);
  console.log('📊 [ANALYTICS PAGE] - Sistema unificado Supabase ativo');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader 
          title="Análises Detalhadas"
          description="Performance, tendências e insights avançados"
        />
        
        <div className="flex items-center gap-4 mb-8">
          <p className="text-sm text-gray-400">
            Total: {allLeads.length} leads | Filtrados: {filteredLeads.length} leads
          </p>
          <span className={`text-xs px-2 py-1 rounded ${
            cacheStatus.isValid ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {cacheStatus.source} - {cacheStatus.ageMinutes.toFixed(1)}min
          </span>
        </div>

        {/* Loading State unificado */}
        {isLoading && (
          <LoadingState 
            progress={75} 
            stage="Sistema unificado Supabase..."
          />
        )}

        {/* Conteúdo principal apenas quando não está carregando */}
        {!isLoading && (
          <>
            {/* Performance dos Closers - usando leads filtrados */}
            <CloserPerformanceAnalysis leads={filteredLeads} />

            {/* Análise Temporal - usando leads filtrados */}
            <TemporalAnalysis leads={filteredLeads} />

            {/* Histórico de Faturamento Mensal - usando todos os leads */}
            <MonthlyRevenueHistory leads={allLeads} />
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
