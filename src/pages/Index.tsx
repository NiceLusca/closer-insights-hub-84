
import React, { useState } from 'react';
import { useLeadsData } from "@/hooks/useLeadsData";
import { useFilteredLeads } from "@/hooks/useFilteredLeads";
import { useFilterOptions } from "@/hooks/useFilterOptions";
import { useFilters } from "@/hooks/useFilters";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { FiltersPanel } from "@/components/Dashboard/FiltersPanel";
import { LoadingState } from "@/components/Dashboard/LoadingState";
import { DebugInfo } from "@/components/Dashboard/DebugInfo";
import { MetricsCards } from "@/components/MetricsCards";
import { ChartsGrid } from "@/components/Dashboard/ChartsGrid";
import { OriginAnalysis } from "@/components/OriginAnalysis";
import { LeadsTable } from "@/components/LeadsTable";

const Index = () => {
  // Estado dos dados
  const { allLeads, isLoading, lastUpdated, dataReady, fetchLeadsData } = useLeadsData();
  
  // Estado dos filtros
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
  } = useFilters();

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
        onRefreshData={fetchLeadsData}
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

        {/* Loading State */}
        {isLoading && <LoadingState />}

        {!isLoading && (
          <>
            {/* Debug Info */}
            <DebugInfo 
              allLeads={allLeads} 
              filteredLeads={filteredLeads} 
              dateRange={dateRange} 
            />

            {/* Metrics Cards */}
            <MetricsCards leads={filteredLeads} />

            {/* Charts Grid */}
            <ChartsGrid leads={filteredLeads} />

            {/* Origin Analysis */}
            <OriginAnalysis leads={filteredLeads} />

            {/* Leads Table */}
            <LeadsTable leads={filteredLeads} />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
