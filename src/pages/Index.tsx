
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/DatePickerWithRange";
import { FilterSelect } from "@/components/FilterSelect";
import { MetricsCards } from "@/components/MetricsCards";
import { LeadsChart } from "@/components/LeadsChart";
import { RevenueChart } from "@/components/RevenueChart";
import { StatusDistribution } from "@/components/StatusDistribution";
import { CloserPerformance } from "@/components/CloserPerformance";
import { OriginAnalysis } from "@/components/OriginAnalysis";
import { LeadsTable } from "@/components/LeadsTable";
import { FilterIcon, RefreshCw } from "lucide-react";
import { generateMockData } from "@/utils/mockData";
import { fetchLeadsFromWebhook } from "@/services/webhookService";
import { filterLeads } from "@/utils/dataFilters";
import { useToast } from "@/hooks/use-toast";
import type { Lead, DateRange, Filters } from "@/types/lead";

const Index = () => {
  const { toast } = useToast();
  
  // Estado dos dados
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
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
    try {
      console.log('Iniciando busca de dados do webhook...');
      const webhookLeads = await fetchLeadsFromWebhook();
      
      if (webhookLeads.length > 0) {
        setAllLeads(webhookLeads);
        setLastUpdated(new Date());
        toast({
          title: "Dados atualizados!",
          description: `${webhookLeads.length} leads carregados com sucesso.`,
        });
        console.log('Dados carregados com sucesso:', webhookLeads.length, 'leads');
      } else {
        // Fallback para dados mock se webhook não retornar dados
        console.log('Webhook retornou dados vazios, usando dados mock');
        const mockLeads = generateMockData(500);
        setAllLeads(mockLeads);
        setLastUpdated(new Date());
        toast({
          title: "Usando dados de demonstração",
          description: "Não foi possível carregar dados do webhook. Usando dados mock.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      // Fallback para dados mock em caso de erro
      const mockLeads = generateMockData(500);
      setAllLeads(mockLeads);
      setLastUpdated(new Date());
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

  // Get unique values for filter options - garantir que sempre retorne arrays válidos
  const filterOptions = useMemo(() => {
    if (!allLeads || allLeads.length === 0) {
      return {
        statusOptions: [],
        closerOptions: [],
        origemOptions: []
      };
    }

    const statusOptions = [...new Set(allLeads
      .map(lead => lead.Status)
      .filter(status => status && status.trim() !== '')
    )];
    
    const closerOptions = [...new Set(allLeads
      .map(lead => lead.Closer)
      .filter(closer => closer && closer.trim() !== '')
    )];
    
    const origemOptions = [...new Set(allLeads
      .map(lead => lead.origem)
      .filter(origem => origem && origem.trim() !== '')
    )];
    
    console.log('Opções de filtro:', { statusOptions, closerOptions, origemOptions });
    return { statusOptions, closerOptions, origemOptions };
  }, [allLeads]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Closer Insights</h1>
              <p className="text-gray-600 mt-1">
                Dashboard Analytics para Gestão de Leads
                {lastUpdated && (
                  <span className="ml-2 text-sm">
                    • Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <FilterIcon className="w-4 h-4" />
                <span>Filtros</span>
                {hasPendingFilters && (
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={fetchLeadsData}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-8 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Filtros Globais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período
                  </label>
                  <DatePickerWithRange 
                    dateRange={tempDateRange} 
                    onDateRangeChange={setTempDateRange} 
                  />
                </div>
                
                <FilterSelect
                  label="Status"
                  options={filterOptions.statusOptions}
                  selectedValues={tempFilters.status}
                  onChange={(values) => handleTempFilterChange('status', values)}
                  placeholder="Todos os status"
                />
                
                <FilterSelect
                  label="Closer"
                  options={filterOptions.closerOptions}
                  selectedValues={tempFilters.closer}
                  onChange={(values) => handleTempFilterChange('closer', values)}
                  placeholder="Todos os closers"
                />
                
                <FilterSelect
                  label="Origem"
                  options={filterOptions.origemOptions}
                  selectedValues={tempFilters.origem}
                  onChange={(values) => handleTempFilterChange('origem', values)}
                  placeholder="Todas as origens"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button 
                    onClick={applyFilters}
                    disabled={!hasPendingFilters}
                    className={hasPendingFilters ? 'bg-orange-500 hover:bg-orange-600' : ''}
                  >
                    Aplicar Filtros
                    {hasPendingFilters && (
                      <span className="ml-2 w-2 h-2 bg-white rounded-full"></span>
                    )}
                  </Button>
                  <Button variant="ghost" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                </div>
                
                {hasPendingFilters && (
                  <span className="text-sm text-orange-600 font-medium">
                    Existem filtros não aplicados
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
