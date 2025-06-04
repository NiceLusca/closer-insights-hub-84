
import React, { useState } from 'react';
import { useLeadsData } from "@/hooks/useLeadsData";
import { useFilteredLeads } from "@/hooks/useFilteredLeads";
import { useFilterOptions } from "@/hooks/useFilterOptions";
import { useGlobalFilters } from "@/contexts/FilterContext";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { FiltersPanel } from "@/components/Dashboard/FiltersPanel";
import { LoadingState } from "@/components/Dashboard/LoadingState";
import { MetricsCards } from "@/components/MetricsCards";
import { ChartsGrid } from "@/components/Dashboard/ChartsGrid";
import { StatusDistribution } from "@/components/StatusDistribution";
import { ConversionFunnel } from "@/components/ConversionFunnel";
import { OriginAnalysis } from "@/components/OriginAnalysis";
import { PerformanceAlerts } from "@/components/PerformanceAlerts";
import { DebugInfo } from "@/components/Dashboard/DebugInfo";

const Dashboard = () => {
  // Estado dos dados
  const { 
    allLeads, 
    isLoading, 
    lastUpdated, 
    dataReady, 
    loadingProgress, 
    loadingStage, 
    fetchLeadsData, 
    forceRefresh,
    isCacheValid
  } = useLeadsData();
  
  // Estado dos filtros globais
  const {
    dateRange,
    filters,
    tempDateRange,
    tempFilters,
    hasPendingFilters,
    isApplyingFilters,
    setTempDateRange,
    handleTempFilterChange,
    applyFilters,
    clearFilters
  } = useGlobalFilters();

  // Estado da UI
  const [showFilters, setShowFilters] = useState(true);

  // Dados processados com validação
  const { filteredLeads, validation } = useFilteredLeads(allLeads, dateRange, filters, 'dashboard');
  const filterOptions = useFilterOptions(allLeads, dataReady, isLoading);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <DashboardHeader
        isLoading={isLoading || isApplyingFilters}
        lastUpdated={lastUpdated}
        showFilters={showFilters}
        hasPendingFilters={hasPendingFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onRefreshData={forceRefresh}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FiltersPanel
          showFilters={showFilters}
          tempDateRange={tempDateRange}
          tempFilters={tempFilters}
          filterOptions={filterOptions}
          hasPendingFilters={hasPendingFilters}
          allLeads={allLeads}
          isLoading={!dataReady || isApplyingFilters}
          onTempDateRangeChange={setTempDateRange}
          onTempFilterChange={handleTempFilterChange}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
        />

        {/* Loading State com progresso */}
        {(isLoading || isApplyingFilters) && (
          <LoadingState 
            progress={isApplyingFilters ? 100 : loadingProgress} 
            stage={isApplyingFilters ? 'Aplicando filtros...' : loadingStage}
          />
        )}

        {/* Conteúdo principal apenas quando não está carregando */}
        {!isLoading && !isApplyingFilters && (
          <>
            {/* Metrics Cards - mantém no topo */}
            <MetricsCards leads={filteredLeads} />

            {/* Status Distribution - movido para cima, é mais importante */}
            <div className="mb-8">
              <StatusDistribution leads={filteredLeads} />
            </div>

            {/* Funil de Conversão - simplificado, sem redundâncias com StatusDistribution */}
            <ConversionFunnel leads={filteredLeads} />

            {/* Charts Grid - mantém posição */}
            <ChartsGrid leads={filteredLeads} />

            {/* Origin Analysis - mantém posição */}
            <OriginAnalysis leads={filteredLeads} />

            {/* Alertas de Performance - mantém no final */}
            <PerformanceAlerts leads={filteredLeads} position="bottom" />

            {/* Debug Info - movido para o final, substituindo StatusDistribution */}
            <DebugInfo 
              allLeads={allLeads} 
              filteredLeads={filteredLeads} 
              dateRange={dateRange}
              cacheStatus={isCacheValid ? 'válido' : 'expirado'}
              validation={validation}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
