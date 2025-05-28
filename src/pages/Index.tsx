
import React, { useState, useMemo } from 'react';
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
import { filterLeads } from "@/utils/dataFilters";
import type { Lead, DateRange, Filters } from "@/types/lead";

const Index = () => {
  // Generate mock data for demonstration
  const allLeads = useMemo(() => generateMockData(500), []);
  
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const [filters, setFilters] = useState<Filters>({
    status: [],
    closer: [],
    origem: []
  });

  const [showFilters, setShowFilters] = useState(false);

  // Filter data based on selected filters and date range
  const filteredLeads = useMemo(() => {
    return filterLeads(allLeads, dateRange, filters);
  }, [allLeads, dateRange, filters]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const statusOptions = [...new Set(allLeads.map(lead => lead.Status))];
    const closerOptions = [...new Set(allLeads.map(lead => lead.Closer))];
    const origemOptions = [...new Set(allLeads.map(lead => lead.origem))];
    
    return { statusOptions, closerOptions, origemOptions };
  }, [allLeads]);

  const handleFilterChange = (filterType: keyof Filters, values: string[]) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      closer: [],
      origem: []
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Closer Insights</h1>
              <p className="text-gray-600 mt-1">Dashboard Analytics para Gestão de Leads</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <FilterIcon className="w-4 h-4" />
                <span>Filtros</span>
              </Button>
              <Button variant="outline" size="icon">
                <RefreshCw className="w-4 h-4" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período
                  </label>
                  <DatePickerWithRange 
                    dateRange={dateRange} 
                    onDateRangeChange={setDateRange} 
                  />
                </div>
                
                <FilterSelect
                  label="Status"
                  options={filterOptions.statusOptions}
                  selectedValues={filters.status}
                  onChange={(values) => handleFilterChange('status', values)}
                  placeholder="Todos os status"
                />
                
                <FilterSelect
                  label="Closer"
                  options={filterOptions.closerOptions}
                  selectedValues={filters.closer}
                  onChange={(values) => handleFilterChange('closer', values)}
                  placeholder="Todos os closers"
                />
                
                <FilterSelect
                  label="Origem"
                  options={filterOptions.origemOptions}
                  selectedValues={filters.origem}
                  onChange={(values) => handleFilterChange('origem', values)}
                  placeholder="Todas as origens"
                />
              </div>
              
              <div className="flex justify-end mt-4">
                <Button variant="ghost" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
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
