
import React from 'react';
import { useFastLeadsData } from "@/hooks/useFastLeadsData";
import { useFilteredLeads } from "@/hooks/useFilteredLeads";
import { useGlobalFilters } from "@/contexts/FilterContext";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/Dashboard/LoadingState";
import { LeadsTable } from "@/components/LeadsTable";

const Leads = () => {
  // MIGRAÇÃO COMPLETA: Usar exclusivamente useFastLeadsData (SISTEMA UNIFICADO)
  const { 
    allLeads, 
    isLoading, 
    dataReady,
    cacheStatus
  } = useFastLeadsData();
  
  // Estado dos filtros globais
  const { dateRange, filters } = useGlobalFilters();

  // Dados processados com validação corrigida
  const { filteredLeads } = useFilteredLeads(allLeads, dateRange, filters, 'leads');

  console.log('📄 [LEADS PAGE] === MIGRAÇÃO COMPLETA PARA SISTEMA UNIFICADO ===');
  console.log('📄 [LEADS PAGE] - Total de leads brutos:', allLeads.length);
  console.log('📄 [LEADS PAGE] - Leads filtrados:', filteredLeads.length);
  console.log('📄 [LEADS PAGE] - Cache status:', cacheStatus);
  console.log('📄 [LEADS PAGE] - Sistema unificado Supabase ativo');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader 
          title="Gestão de Leads"
          description="Visualize e gerencie todos os seus leads (Sistema Unificado)"
        />
        
        <div className="flex items-center gap-4 mb-8">
          <p className="text-sm text-gray-400">
            Mostrando: {filteredLeads.length} leads de {allLeads.length} total
          </p>
          <span className={`text-xs px-2 py-1 rounded ${
            cacheStatus.isValid ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {cacheStatus.source} - {cacheStatus.ageMinutes.toFixed(1)}min
          </span>
        </div>

        {/* Loading State unificado */}
        {isLoading && (
          <LoadingState 
            progress={75} 
            stage="Sistema unificado Supabase..."
          />
        )}

        {/* Conteúdo principal apenas quando não está carregando */}
        {!isLoading && dataReady && (
          <LeadsTable leads={filteredLeads} />
        )}
      </div>
    </div>
  );
};

export default Leads;
