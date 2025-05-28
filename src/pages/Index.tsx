
import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw } from "lucide-react";
import { generateMockData } from "@/utils/mockData";
import { fetchLeadsFromWebhook } from "@/services/webhookService";
import { filterLeads } from "@/utils/dataFilters";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { FiltersPanel } from "@/components/Dashboard/FiltersPanel";
import { MetricsCards } from "@/components/MetricsCards";
import { LeadsChart } from "@/components/LeadsChart";
import { RevenueChart } from "@/components/RevenueChart";
import { StatusDistribution } from "@/components/StatusDistribution";
import { CloserPerformance } from "@/components/CloserPerformance";
import { OriginAnalysis } from "@/components/OriginAnalysis";
import { LeadsTable } from "@/components/LeadsTable";
import type { Lead, DateRange, Filters } from "@/types/lead";

const Index = () => {
  const { toast } = useToast();
  
  // Estado dos dados
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataReady, setDataReady] = useState(false);
  
  // Filtros aplicados
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const [filters, setFilters] = useState<Filters>({
    status: [],
    closer: [],
    origem: []
  });

  // Filtros temporários
  const [tempDateRange, setTempDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  const [tempFilters, setTempFilters] = useState<Filters>({
    status: [],
    closer: [],
    origem: []
  });

  const [showFilters, setShowFilters] = useState(true); // Mostrar filtros por padrão

  // Função para buscar dados do webhook
  const fetchLeadsData = async () => {
    setIsLoading(true);
    setDataReady(false);
    
    try {
      console.log('🔄 Iniciando busca de dados do webhook...');
      const webhookLeads = await fetchLeadsFromWebhook();
      
      if (webhookLeads.length > 0) {
        console.log('✅ Dados carregados do webhook:', webhookLeads.length, 'leads');
        setAllLeads(webhookLeads);
        setLastUpdated(new Date());
        
        toast({
          title: "✅ Dados atualizados!",
          description: `${webhookLeads.length} leads carregados do webhook com sucesso.`,
        });
      } else {
        console.log('⚠️ Webhook vazio, usando dados de demonstração');
        const mockLeads = generateMockData(500);
        setAllLeads(mockLeads);
        setLastUpdated(new Date());
        
        toast({
          title: "⚠️ Usando dados de demonstração",
          description: "Webhook retornou dados vazios. Usando dados mock para demonstração.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error);
      const mockLeads = generateMockData(500);
      setAllLeads(mockLeads);
      setLastUpdated(new Date());
      
      toast({
        title: "❌ Erro ao carregar dados",
        description: "Erro na conexão com webhook. Usando dados de demonstração.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Pequeno delay para garantir que o estado seja atualizado
      setTimeout(() => setDataReady(true), 200);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchLeadsData();
  }, []);

  // Filtrar dados baseado nos filtros aplicados
  const filteredLeads = useMemo(() => {
    if (!allLeads || allLeads.length === 0) {
      return [];
    }
    
    console.log('🔍 Aplicando filtros aos dados:', {
      totalLeads: allLeads.length,
      dateRange,
      filters
    });
    
    const result = filterLeads(allLeads, dateRange, filters);
    console.log('📊 Resultado dos filtros:', result.length, 'leads filtrados');
    return result;
  }, [allLeads, dateRange, filters]);

  // Gerar opções para os filtros de forma mais robusta
  const filterOptions = useMemo(() => {
    console.log('🔧 Gerando opções de filtro...');
    console.log('Estado:', { 
      leadsLength: allLeads?.length || 0, 
      isLoading, 
      dataReady 
    });

    // Retornar arrays vazios se dados não estão prontos
    if (!dataReady || isLoading || !Array.isArray(allLeads) || allLeads.length === 0) {
      console.log('⏳ Dados não prontos, retornando opções vazias');
      return {
        statusOptions: [],
        closerOptions: [],
        origemOptions: []
      };
    }

    try {
      // Processar Status
      const statusSet = new Set<string>();
      allLeads.forEach(lead => {
        if (lead?.Status && typeof lead.Status === 'string') {
          const status = lead.Status.trim();
          if (status !== '') {
            statusSet.add(status);
          }
        }
      });
      const statusOptions = Array.from(statusSet).sort();
      
      // Processar Closers
      const closerSet = new Set<string>();
      allLeads.forEach(lead => {
        if (lead?.Closer && typeof lead.Closer === 'string') {
          const closer = lead.Closer.trim();
          if (closer !== '') {
            closerSet.add(closer);
          }
        }
      });
      const closerOptions = Array.from(closerSet).sort();
      
      // Processar Origens
      const origemSet = new Set<string>();
      allLeads.forEach(lead => {
        if (lead?.origem && typeof lead.origem === 'string') {
          const origem = lead.origem.trim();
          if (origem !== '') {
            origemSet.add(origem);
          }
        }
      });
      const origemOptions = Array.from(origemSet).sort();
      
      console.log('✅ Opções de filtro geradas:');
      console.log('📈 Status:', statusOptions.length, 'opções:', statusOptions);
      console.log('👥 Closers:', closerOptions.length, 'opções:', closerOptions);
      console.log('🎯 Origens:', origemOptions.length, 'opções:', origemOptions);
      
      return { 
        statusOptions, 
        closerOptions, 
        origemOptions 
      };
    } catch (error) {
      console.error('❌ Erro ao gerar opções de filtro:', error);
      return {
        statusOptions: [],
        closerOptions: [],
        origemOptions: []
      };
    }
  }, [allLeads, dataReady, isLoading]);

  const handleTempFilterChange = (filterType: keyof Filters, values: string[]) => {
    console.log('🔄 Mudança temporária de filtro:', filterType, values);
    setTempFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
  };

  const applyFilters = () => {
    console.log('✅ Aplicando filtros:', { tempDateRange, tempFilters });
    setDateRange(tempDateRange);
    setFilters(tempFilters);
    toast({
      title: "✅ Filtros aplicados!",
      description: "Dashboard atualizado com os novos filtros.",
    });
  };

  const clearFilters = () => {
    const emptyFilters = {
      status: [],
      closer: [],
      origem: []
    };
    const defaultDateRange = {
      from: new Date(new Date().setDate(new Date().getDate() - 30)),
      to: new Date()
    };
    
    setDateRange(defaultDateRange);
    setFilters(emptyFilters);
    setTempDateRange(defaultDateRange);
    setTempFilters(emptyFilters);
    
    toast({
      title: "🗑️ Filtros limpos",
      description: "Todos os filtros foram removidos.",
    });
  };

  // Verificar se existem filtros pendentes
  const hasPendingFilters = 
    JSON.stringify(filters) !== JSON.stringify(tempFilters) ||
    JSON.stringify(dateRange) !== JSON.stringify(tempDateRange);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8 flex items-center space-x-4">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Carregando Dados</h3>
                <p className="text-gray-600">Buscando leads do webhook...</p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Metrics Cards */}
            <MetricsCards leads={filteredLeads} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <LeadsChart leads={filteredLeads} />
              <RevenueChart leads={filteredLeads} />
              <StatusDistribution leads={filteredLeads} />
              <CloserPerformance leads={filteredLeads} />
            </div>

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
