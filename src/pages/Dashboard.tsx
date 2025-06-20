
import React, { useState } from 'react';
import { useFastLeadsData } from "@/hooks/useFastLeadsData";
import { useFilteredLeads } from "@/hooks/useFilteredLeads";
import { useFilterOptions } from "@/hooks/useFilterOptions";
import { useGlobalFilters } from "@/contexts/FilterContext";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { FiltersPanel } from "@/components/Dashboard/FiltersPanel";
import { LoadingState } from "@/components/Dashboard/LoadingState";
import { MetricsCards } from "@/components/MetricsCards";
import { MonthlyGoalProgress } from "@/components/MonthlyGoalProgress";
import { ChartsGrid } from "@/components/Dashboard/ChartsGrid";
import { ConversionFunnel } from "@/components/ConversionFunnel";
import { LossAnalysis } from "@/components/LossAnalysis";
import { OriginAnalysis } from "@/components/OriginAnalysis";
import { PerformanceAlerts } from "@/components/PerformanceAlerts";
import { DebugInfo } from "@/components/Dashboard/DebugInfo";
import { StatusDistributionCards } from "@/components/StatusDistributionCards";
import { MathValidation } from "@/components/Dashboard/MathValidation";
import { FastLoadingIndicator } from "@/components/Dashboard/FastLoadingIndicator";

const Dashboard = () => {
  // SISTEMA UNIFICADO: Usar exclusivamente useFastLeadsData
  const { 
    allLeads, 
    isLoading, 
    lastUpdated, 
    dataReady, 
    cacheStatus,
    forceRefresh,
    updateInBackground
  } = useFastLeadsData();
  
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

  console.log('🏠 [DASHBOARD] === ESTADO COMPLETO DO DASHBOARD ===');
  console.log('🏠 [DASHBOARD] Total leads brutos:', allLeads.length);
  console.log('🏠 [DASHBOARD] Leads filtrados:', filteredLeads.length);
  console.log('🏠 [DASHBOARD] Cache status:', cacheStatus);
  console.log('🏠 [DASHBOARD] Sistema unificado Supabase ativo');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 smooth-scroll">
      <DashboardHeader
        isLoading={isLoading || isApplyingFilters}
        lastUpdated={lastUpdated}
        showFilters={showFilters}
        hasPendingFilters={hasPendingFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onRefreshData={forceRefresh}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mobile-spacing">
        {/* Indicador de status unificado */}
        <div className="mb-6">
          <FastLoadingIndicator 
            cacheStatus={cacheStatus}
            lastUpdated={lastUpdated}
          />
        </div>

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
            progress={isApplyingFilters ? 100 : 75} 
            stage={isApplyingFilters ? 'Aplicando filtros...' : 'Sistema unificado Supabase...'}
          />
        )}

        {/* Conteúdo principal apenas quando não está carregando */}
        {!isLoading && !isApplyingFilters && (
          <div className="space-y-8">
            {/* 1. Metrics Cards - KPIs principais */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <MetricsCards leads={filteredLeads} />
            </div>

            {/* 2. Meta Mensal */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <MonthlyGoalProgress allLeads={allLeads} />
            </div>

            {/* 3. Cards de Distribuição por Status */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <StatusDistributionCards leads={filteredLeads} />
            </div>

            {/* 4. Funil de Conversão */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <ConversionFunnel leads={filteredLeads} />
            </div>

            {/* 5. Charts Grid */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <ChartsGrid leads={filteredLeads} />
            </div>

            {/* 6. Origin Analysis */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <OriginAnalysis leads={filteredLeads} />
            </div>

            {/* 7. Alertas de Performance */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <PerformanceAlerts leads={filteredLeads} position="bottom" />
            </div>

            {/* 8. Análise de Perdas */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <LossAnalysis leads={filteredLeads} />
            </div>

            {/* 9. Validação Matemática */}
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
              <MathValidação leads={filteredLeads} />
            </div>

            {/* 10. Debug Info - CORRIGIDO para passar objeto cacheStatus */}
            <div className="animate-fade-in-up" style={{ animationDelay: '1.0s' }}>
              <DebugInfo 
                allLeads={allLeads} 
                filteredLeads={filteredLeads} 
                dateRange={dateRange}
                cacheStatus={`${cacheStatus.source} (${cacheStatus.ageMinutes.toFixed(1)}min, ${cacheStatus.isValid ? 'válido' : 'inválido'})`}
                validation={validation}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
