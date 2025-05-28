
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
  const [dataStable, setDataStable] = useState(false); // Novo estado para controlar estabilidade dos dados
  
  // Filtros aplicados (usados para filtrar os dados)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const [filters, setFilters] = useState<Filters>({
    status: [],
    closer: [],
    origem: []
  });

  // Filtros temporários (modificados na UI antes de aplicar)
  const [tempDateRange, setTempDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  const [tempFilters, setTempFilters] = useState<Filters>({
    status: [],
    closer: [],
    origem: []
  });

  const [showFilters, setShowFilters] = useState(false);

  // Função para buscar dados do webhook
  const fetchLeadsData = async () => {
    setIsLoading(true);
    setDataStable(false); // Marcar dados como instáveis durante carregamento
    
    try {
      console.log('Iniciando busca de dados do webhook...');
      const webhookLeads = await fetchLeadsFromWebhook();
      
      if (webhookLeads.length > 0) {
        console.log('Dados carregados com sucesso:', webhookLeads.length, 'leads');
        setAllLeads(webhookLeads);
        setLastUpdated(new Date());
        
        // Aguardar um pequeno delay para garantir que o estado seja atualizado
        setTimeout(() => {
          setDataStable(true);
          console.log('Dados marcados como estáveis');
        }, 100);
        
        toast({
          title: "Dados atualizados!",
          description: `${webhookLeads.length} leads carregados com sucesso.`,
        });
      } else {
        console.log('Webhook retornou dados vazios, usando dados mock');
        const mockLeads = generateMockData(500);
        setAllLeads(mockLeads);
        setLastUpdated(new Date());
        
        setTimeout(() => {
          setDataStable(true);
          console.log('Dados mock marcados como estáveis');
        }, 100);
        
        toast({
          title: "Usando dados de demonstração",
          description: "Não foi possível carregar dados do webhook. Usando dados mock.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      const mockLeads = generateMockData(500);
      setAllLeads(mockLeads);
      setLastUpdated(new Date());
      
      setTimeout(() => {
        setDataStable(true);
        console.log('Dados mock (erro) marcados como estáveis');
      }, 100);
      
      toast({
        title: "Erro ao carregar dados",
        description: "Usando dados de demonstração. Verifique a conexão com o webhook.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchLeadsData();
  }, []);

  // Filter data based on selected filters and date range
  const filteredLeads = useMemo(() => {
    if (!allLeads || allLeads.length === 0) {
      return [];
    }
    console.log('Aplicando filtros:', { dateRange, filters });
    const result = filterLeads(allLeads, dateRange, filters);
    console.log('Resultado dos filtros:', result.length, 'leads');
    return result;
  }, [allLeads, dateRange, filters]);

  // Get unique values for filter options - VERSÃO MELHORADA COM DEBOUNCE
  const filterOptions = useMemo(() => {
    console.log('=== GERANDO OPÇÕES DE FILTRO ===');
    console.log('Estado atual:', { 
      allLeadsLength: allLeads?.length || 0, 
      isLoading, 
      dataStable 
    });
    
    // Sempre retornar arrays válidos, mesmo quando dados não estão prontos
    const defaultOptions = {
      statusOptions: [],
      closerOptions: [],
      origemOptions: []
    };

    // Só processar se dados estiverem estáveis e válidos
    if (!dataStable || isLoading || !Array.isArray(allLeads) || allLeads.length === 0) {
      console.log('Retornando opções vazias - dados não estão prontos');
      return defaultOptions;
    }

    try {
      console.log('Processando', allLeads.length, 'leads para gerar opções...');
      
      // Filtrar e processar status
      const statusSet = new Set<string>();
      allLeads.forEach(lead => {
        if (lead?.Status && typeof lead.Status === 'string' && lead.Status.trim() !== '') {
          statusSet.add(lead.Status.trim());
        }
      });
      const statusOptions = Array.from(statusSet).sort();
      
      // Filtrar e processar closers
      const closerSet = new Set<string>();
      allLeads.forEach(lead => {
        if (lead?.Closer && typeof lead.Closer === 'string' && lead.Closer.trim() !== '') {
          closerSet.add(lead.Closer.trim());
        }
      });
      const closerOptions = Array.from(closerSet).sort();
      
      // Filtrar e processar origens
      const origemSet = new Set<string>();
      allLeads.forEach(lead => {
        if (lead?.origem && typeof lead.origem === 'string' && lead.origem.trim() !== '') {
          origemSet.add(lead.origem.trim());
        }
      });
      const origemOptions = Array.from(origemSet).sort();
      
      console.log('=== OPÇÕES GERADAS ===');
      console.log('Status:', statusOptions.length, 'opções:', statusOptions);
      console.log('Closers:', closerOptions.length, 'opções:', closerOptions);
      console.log('Origens:', origemOptions.length, 'opções:', origemOptions);
      
      const result = { 
        statusOptions, 
        closerOptions, 
        origemOptions 
      };
      
      console.log('Opções finais:', result);
      return result;
    } catch (error) {
      console.error('Erro ao gerar opções de filtro:', error);
      return defaultOptions;
    }
  }, [allLeads, dataStable, isLoading]); // Adicionar dataStable como dependência

  const handleTempFilterChange = (filterType: keyof Filters, values: string[]) => {
    console.log('Mudança temporária de filtro:', filterType, values);
    setTempFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
  };

  const applyFilters = () => {
    console.log('Aplicando filtros:', { tempDateRange, tempFilters });
    setDateRange(tempDateRange);
    setFilters(tempFilters);
    toast({
      title: "Filtros aplicados!",
      description: "Os dados foram atualizados com os novos filtros.",
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
      title: "Filtros limpos",
      description: "Todos os filtros foram removidos.",
    });
  };

  // Verificar se existem filtros pendentes de aplicar
  const hasPendingFilters = 
    JSON.stringify(filters) !== JSON.stringify(tempFilters) ||
    JSON.stringify(dateRange) !== JSON.stringify(tempDateRange);

  // Estado consolidado para os filtros
  const filtersReady = dataStable && !isLoading && allLeads.length > 0;
  
  console.log('=== ESTADO FINAL DOS FILTROS ===');
  console.log('filtersReady:', filtersReady);
  console.log('dataStable:', dataStable);
  console.log('isLoading:', isLoading);
  console.log('allLeads.length:', allLeads.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
          isLoading={!filtersReady} // Passa true se filtros não estão prontos
          onTempDateRangeChange={setTempDateRange}
          onTempFilterChange={handleTempFilterChange}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Carregando dados...</span>
          </div>
        )}

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
      </div>
    </div>
  );
};

export default Index;
