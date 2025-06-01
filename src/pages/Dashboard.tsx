
import React, { useState } from 'react';
import { useLeadsData } from "@/hooks/useLeadsData";
import { useFilteredLeads } from "@/hooks/useFilteredLeads";
import { useFilterOptions } from "@/hooks/useFilterOptions";
import { useGlobalFilters } from "@/contexts/FilterContext";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { FiltersPanel } from "@/components/Dashboard/FiltersPanel";
import { LoadingState } from "@/components/Dashboard/LoadingState";
import { DebugInfo } from "@/components/Dashboard/DebugInfo";
import { MetricsCards } from "@/components/MetricsCards";
import { ChartsGrid } from "@/components/Dashboard/ChartsGrid";
import { OriginAnalysis } from "@/components/OriginAnalysis";
import { ConversionFunnel } from "@/components/ConversionFunnel";
import { PerformanceAlerts } from "@/components/PerformanceAlerts";

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
    forceRefresh 
  } = useLeadsData();
  
  // Estado dos filtros globais
  const {
    dateRange,
    filters,
    tempDateRange,
    tempFilters,
    hasPendingFilters,
    setTempDateRange,
    handleTempFilterChange,
    applyFilters,
    clearFilters
  } = useGlobalFilters();

  // Estado da UI
  const [showFilters, setShowFilters] = useState(true);

  // Dados processados
  const filteredLeads = useFilteredLeads(allLeads, dateRange, filters);
  const filterOptions = useFilterOptions(allLeads, dataReady, isLoading);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <DashboardHeader
        isLoading={isLoading}
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
          isLoading={!dataReady}
          onTempDateRangeChange={setTempDateRange}
          onTempFilterChange={handleTempFilterChange}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
        />

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
            {/* Debug Info */}
            <DebugInfo 
              allLeads={allLeads} 
              filteredLeads={filteredLeads} 
              dateRange={dateRange} 
            />

            {/* Alertas de Performance */}
            <PerformanceAlerts leads={filteredLeads} />

            {/* Metrics Cards */}
            <MetricsCards leads={filteredLeads} />

            {/* Funil de Conversão */}
            <ConversionFunnel leads={filteredLeads} />

            {/* Charts Grid */}
            <ChartsGrid leads={filteredLeads} />

            {/* Origin Analysis */}
            <OriginAnalysis leads={filteredLeads} />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
