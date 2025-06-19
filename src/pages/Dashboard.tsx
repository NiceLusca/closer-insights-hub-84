
import React, { useState } from 'react';
import { useLeadsData } from "@/hooks/useLeadsData";
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

  console.log('🏠 [DASHBOARD] === ESTADO COMPLETO DO DASHBOARD ===');
  console.log('🏠 [DASHBOARD] Total leads brutos:', allLeads.length);
  console.log('🏠 [DASHBOARD] Leads filtrados:', filteredLeads.length);
  console.log('🏠 [DASHBOARD] Filtros ativos:', { dateRange, filters });
  console.log('🏠 [DASHBOARD] Período selecionado:', {
    from: dateRange.from.toLocaleDateString(),
    to: dateRange.to.toLocaleDateString()
  });

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
          <div className="space-y-8">
            {/* 1. Metrics Cards - KPIs principais */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <MetricsCards leads={filteredLeads} />
            </div>

            {/* 2. Meta Mensal - NOVA SEÇÃO */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <MonthlyGoalProgress allLeads={allLeads} />
            </div>

            {/* 3. Cards de Distribuição por Status */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <StatusDistributionCards leads={filteredLeads} />
            </div>

            {/* 4. Funil de Conversão - simplificado */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <ConversionFunnel leads={filteredLeads} />
            </div>

            {/* 5. Charts Grid - gráficos de leads/receita/closer */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <ChartsGrid leads={filteredLeads} />
            </div>

            {/* 6. MUDANÇA CRÍTICA: Origin Analysis agora usando leads filtrados */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <OriginAnalysis leads={filteredLeads} />
            </div>

            {/* 7. Alertas de Performance */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <PerformanceAlerts leads={filteredLeads} position="bottom" />
            </div>

            {/* 8. Análise Detalhada de Perdas - MOVIDA PARA O FINAL */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <LossAnalysis leads={filteredLeads} />
            </div>

            {/* 9. Validação Matemática - Para confirmar que as contas estão certas */}
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
              <MathValidation leads={filteredLeads} />
            </div>

            {/* 10. Debug Info/Validação - NO FINAL ABSOLUTO */}
            <div className="animate-fade-in-up" style={{ animationDelay: '1.0s' }}>
              <DebugInfo 
                allLeads={allLeads} 
                filteredLeads={filteredLeads} 
                dateRange={dateRange}
                cacheStatus={isCacheValid ? 'válido' : 'expirado'}
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
