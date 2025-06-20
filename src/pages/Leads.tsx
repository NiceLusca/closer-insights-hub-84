
import React from 'react';
import { useFastLeadsData } from "@/hooks/useFastLeadsData";
import { useFilteredLeads } from "@/hooks/useFilteredLeads";
import { useGlobalFilters } from "@/contexts/FilterContext";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/Dashboard/LoadingState";
import { LeadsTable } from "@/components/LeadsTable";

const Leads = () => {
  // MIGRAÇÃO COMPLETA: Usar exclusivamente useFastLeadsData
  const { 
    allLeads, 
    isLoading, 
    dataReady
  } = useFastLeadsData();
  
  // Estado dos filtros globais
  const { dateRange, filters } = useGlobalFilters();

  // Dados processados
  const { filteredLeads } = useFilteredLeads(allLeads, dateRange, filters, 'leads');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader 
          title="Gestão de Leads"
          description="Visualize e gerencie todos os seus leads"
        />
        
        <p className="text-sm text-gray-400 mb-8">
          Mostrando: {filteredLeads.length} leads de {allLeads.length} total
        </p>

        {/* Loading State */}
        {isLoading && (
          <LoadingState 
            progress={75} 
            stage="Carregando sistema unificado Supabase..."
          />
        )}

        {/* Conteúdo principal */}
        {!isLoading && dataReady && (
          <LeadsTable leads={filteredLeads} />
        )}
      </div>
    </div>
  );
};

export default Leads;
