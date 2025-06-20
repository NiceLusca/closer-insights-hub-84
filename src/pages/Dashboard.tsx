import React, { useState, useEffect } from 'react';
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
  // FASE 7: Sistema totalmente integrado com correções
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

  console.log('🏠 [DASHBOARD] === FASE 7 - ESTADO FINAL CORRIGIDO ===');
  console.log('🏠 [DASHBOARD] Total leads:', allLeads.length);
  console.log('🏠 [DASHBOARD] Leads filtrados:', filteredLeads.length);
  console.log('🏠 [DASHBOARD] Cache:', `${cacheStatus.source} (${cacheStatus.ageMinutes.toFixed(1)}min)`);
  console.log('🏠 [DASHBOARD] Leads com valor:', allLeads.filter(lead => 
    (lead.Valor && lead.Valor > 0) || 
    (lead['Venda Completa'] && lead['Venda Completa'] > 0)
  ).length);

  // NOVO: Efeito para forçar atualização se dados estão vazios
  useEffect(() => {
    if (!isLoading && allLeads.length === 0 && dataReady) {
      console.log('⚠️ [DASHBOARD] Nenhum lead encontrado após carregamento, tentando refresh...');
      setTimeout(() => {
        forceRefresh();
      }, 2000);
    }
  }, [isLoading, allLeads.length, dataReady, forceRefresh]);

  // NOVO: Efeito para atualização automática se cache muito antigo
  useEffect(() => {
    if (!isLoading && cacheStatus.ageMinutes > 60 && allLeads.length > 0) {
      console.log('⏰ [DASHBOARD] Cache muito antigo, atualizando em background...');
      updateInBackground();
    }
  }, [cacheStatus.ageMinutes, isLoading, allLeads.length, updateInBackground]);

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
        {/* NOVO: Indicador de status detalhado */}
        <div className="mb-6">
          <FastLoadingIndicator 
            cacheStatus={cacheStatus}
            lastUpdated={lastUpdated}
          />
          
          {/* NOVO: Debug info para desenvolvimento */}
          {allLeads.length === 0 && !isLoading && (
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <span>⚠️ Nenhum lead encontrado</span>
                <button 
                  onClick={forceRefresh}
                  className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 rounded text-xs"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          )}
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

        {/* Loading State com informações detalhadas */}
        {(isLoading || isApplyingFilters) && (
          <LoadingState 
            progress={isApplyingFilters ? 100 : 85} 
            stage={isApplyingFilters ? 'Aplicando filtros...' : 'Carregando dados (Fase 7)...'}
          />
        )}

        {/* NOVO: Aviso se dados parecem incompletos */}
        {!isLoading && allLeads.length > 0 && allLeads.length < 10 && (
          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center justify-between text-blue-400 text-sm">
              <span>ℹ️ Poucos leads encontrados ({allLeads.length}). Dados podem estar sendo processados.</span>
              <button 
                onClick={updateInBackground}
                className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded text-xs"
              >
                Atualizar
              </button>
            </div>
          </div>
        )}

        {/* Conteúdo principal */}
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

            {/* 9. Validação Matemática - FIXED: MathValidação -> MathValidation */}
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
              <MathValidation leads={filteredLeads} />
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
