
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/DatePickerWithRange";
import { FilterSelect } from "@/components/FilterSelect";
import type { DateRange, Filters } from "@/types/lead";

interface FiltersPanelProps {
  showFilters: boolean;
  tempDateRange: DateRange;
  tempFilters: Filters;
  filterOptions: {
    statusOptions: string[];
    closerOptions: string[];
    origemOptions: string[];
  };
  hasPendingFilters: boolean;
  allLeads?: any[];
  isLoading?: boolean;
  onTempDateRangeChange: (dateRange: DateRange) => void;
  onTempFilterChange: (filterType: keyof Filters, values: string[]) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export function FiltersPanel({
  showFilters,
  tempDateRange,
  tempFilters,
  filterOptions,
  hasPendingFilters,
  allLeads,
  isLoading = false,
  onTempDateRangeChange,
  onTempFilterChange,
  onApplyFilters,
  onClearFilters
}: FiltersPanelProps) {
  if (!showFilters) return null;

  const hasValidOptions = filterOptions && 
    Array.isArray(filterOptions.statusOptions) && 
    Array.isArray(filterOptions.closerOptions) && 
    Array.isArray(filterOptions.origemOptions);

  console.log('=== FILTERS PANEL DEBUG ===');
  console.log('isLoading:', isLoading);
  console.log('hasValidOptions:', hasValidOptions);
  console.log('filterOptions:', filterOptions);
  console.log('tempFilters:', tempFilters);

  return (
    <Card className="mb-8 bg-white/90 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardTitle className="text-xl font-bold">Filtros do Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período de Análise
            </label>
            <DatePickerWithRange 
              dateRange={tempDateRange} 
              onDateRangeChange={onTempDateRangeChange}
              allLeads={allLeads}
            />
          </div>
          
          <FilterSelect
            label="Status dos Leads"
            options={filterOptions?.statusOptions || []}
            selectedValues={tempFilters?.status || []}
            onChange={(values) => onTempFilterChange('status', values)}
            placeholder="Todos os status"
            isLoading={isLoading}
          />
          
          <FilterSelect
            label="Closers"
            options={filterOptions?.closerOptions || []}
            selectedValues={tempFilters?.closer || []}
            onChange={(values) => onTempFilterChange('closer', values)}
            placeholder="Todos os closers"
            isLoading={isLoading}
          />
          
          <FilterSelect
            label="Origem/Campanha"
            options={filterOptions?.origemOptions || []}
            selectedValues={tempFilters?.origem || []}
            onChange={(values) => onTempFilterChange('origem', values)}
            placeholder="Todas as origens"
            isLoading={isLoading}
          />
        </div>
        
        <div className="flex justify-between items-center border-t pt-4">
          <div className="flex space-x-3">
            <Button 
              onClick={onApplyFilters}
              disabled={!hasPendingFilters || isLoading}
              className={`px-6 py-2 font-medium transition-all ${
                hasPendingFilters 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg' 
                  : 'bg-gray-300'
              }`}
            >
              Aplicar Filtros
              {hasPendingFilters && (
                <span className="ml-2 w-2 h-2 bg-white rounded-full animate-pulse"></span>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClearFilters}
              disabled={isLoading}
              className="px-6 py-2 border-2 border-gray-300 hover:border-gray-400"
            >
              Limpar Tudo
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            {isLoading && (
              <span className="text-sm text-blue-600 font-medium">
                🔄 Carregando filtros...
              </span>
            )}
            {!isLoading && hasPendingFilters && (
              <span className="text-sm text-orange-600 font-medium">
                ⚠️ Filtros pendentes de aplicação
              </span>
            )}
            {!isLoading && !hasPendingFilters && hasValidOptions && (
              <span className="text-sm text-green-600 font-medium">
                ✅ Filtros atualizados
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
