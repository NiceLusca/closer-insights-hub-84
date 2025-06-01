
import React from 'react';
import { useLeadsData } from "@/hooks/useLeadsData";
import { useFilteredLeads } from "@/hooks/useFilteredLeads";
import { useGlobalFilters } from "@/contexts/FilterContext";
import { LoadingState } from "@/components/Dashboard/LoadingState";
import { LeadsTable } from "@/components/LeadsTable";

const Leads = () => {
  // Estado dos dados
  const { 
    allLeads, 
    isLoading, 
    loadingProgress, 
    loadingStage 
  } = useLeadsData();
  
  // Estado dos filtros globais
  const { dateRange, filters } = useGlobalFilters();

  // Dados processados
  const filteredLeads = useFilteredLeads(allLeads, dateRange, filters);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Gestão de Leads</h1>
          <p className="text-gray-300">Visualize e gerencie todos os seus leads</p>
          <p className="text-sm text-gray-400 mt-2">
            Mostrando: {filteredLeads.length} leads de {allLeads.length} total
          </p>
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
          <LeadsTable leads={filteredLeads} />
        )}
      </div>
    </div>
  );
};

export default Leads;
