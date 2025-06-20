
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
  // CORREÇÃO EMERGENCIAL: Usar EXCLUSIVAMENTE useFastLeadsData
  const { 
    allLeads, 
    isLoading, 
    lastUpdated,
    cacheStatus,
    dataReady,
    forceRefresh
  } = useFastLeadsData();
  
  const { dateRange, filters } = useGlobalFilters();
  const { filteredLeads } = useFilteredLeads(allLeads, dateRange, filters, 'analytics');

  console.log('📊 [ANALYTICS] === CORREÇÃO EMERGENCIAL FASE 6 ===');
  console.log('📊 [ANALYTICS] - Total leads:', allLeads.length);
  console.log('📊 [ANALYTICS] - Filtrados:', filteredLeads.length);
  console.log('📊 [ANALYTICS] - Cache status:', cacheStatus);
  
  // CORREÇÃO: Forçar atualização se não há dados
  React.useEffect(() => {
    if (!isLoading && allLeads.length === 0) {
      console.log('⚠️ [ANALYTICS] Nenhum lead encontrado, forçando atualização...');
      forceRefresh();
    }
  }, [isLoading, allLeads.length, forceRefresh]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader 
          title="Análises Detalhadas"
          description="Performance, tendências e insights avançados (Sistema Corrigido)"
        />
        
        <div className="flex items-center gap-4 mb-8">
          <p className="text-sm text-gray-400">
            Total: {allLeads.length} leads | Filtrados: {filteredLeads.length} leads
          </p>
          <span className={`text-xs px-2 py-1 rounded ${
            cacheStatus.isValid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {cacheStatus.source} - {cacheStatus.ageMinutes.toFixed(1)}min
          </span>
          {allLeads.length === 0 && (
            <button 
              onClick={forceRefresh}
              className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
            >
              Forçar Atualização
            </button>
          )}
        </div>

        {isLoading && (
          <LoadingState 
            progress={75} 
            stage="Sincronizando dados corrigidos..."
          />
        )}

        {!isLoading && allLeads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Nenhum dado encontrado</p>
            <button 
              onClick={forceRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Recarregar Dados
            </button>
          </div>
        )}

        {!isLoading && dataReady && allLeads.length > 0 && (
          <>
            <CloserPerformanceAnalysis leads={filteredLeads} />
            <TemporalAnalysis leads={filteredLeads} />
            <MonthlyRevenueHistory leads={allLeads} />
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
