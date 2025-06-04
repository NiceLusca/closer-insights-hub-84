
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
import { ConversionFunnel } from "@/components/ConversionFunnel";
import { OriginAnalysis } from "@/components/OriginAnalysis";
import { PerformanceAlerts } from "@/components/PerformanceAlerts";
import { DebugInfo } from "@/components/Dashboard/DebugInfo";
import { StatusDistributionCards } from "@/components/StatusDistributionCards";
import { MathValidation } from "@/components/Dashboard/MathValidation";

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

  // Atualizar título da página
  React.useEffect(() => {
    document.title = 'Clarity - Analytics Dashboard';
  }, []);

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
            {/* 1. Metrics Cards - KPIs principais */}
            <MetricsCards leads={filteredLeads} />

            {/* 2. Cards de Distribuição por Status - no topo */}
            <StatusDistributionCards leads={filteredLeads} />

            {/* 3. Funil de Conversão - simplificado */}
            <ConversionFunnel leads={filteredLeads} />

            {/* 4. Charts Grid - gráficos de leads/receita/closer */}
            <ChartsGrid leads={filteredLeads} />

            {/* 5. Origin Analysis */}
            <OriginAnalysis leads={filteredLeads} />

            {/* 6. Alertas de Performance */}
            <PerformanceAlerts leads={filteredLeads} position="bottom" />

            {/* 7. Validação Matemática - Para confirmar que as contas estão certas */}
            <div className="mb-6">
              <MathValidation leads={filteredLeads} />
            </div>

            {/* 8. Debug Info/Validação - NO FINAL ABSOLUTO */}
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
