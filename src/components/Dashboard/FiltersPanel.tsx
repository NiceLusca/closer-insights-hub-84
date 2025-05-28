
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

  // Verificações mais rigorosas para dados válidos
  const hasValidFilterOptions = filterOptions && 
    typeof filterOptions === 'object' &&
    Array.isArray(filterOptions.statusOptions) && 
    Array.isArray(filterOptions.closerOptions) && 
    Array.isArray(filterOptions.origemOptions);

  const hasAnyFilterData = hasValidFilterOptions && (
    filterOptions.statusOptions.length > 0 ||
    filterOptions.closerOptions.length > 0 ||
    filterOptions.origemOptions.length > 0
  );

  const filtersReady = !isLoading && hasValidFilterOptions;
  const showFilterComponents = filtersReady && hasAnyFilterData;

  console.log('=== FILTERS PANEL STATE ===');
  console.log('isLoading:', isLoading);
  console.log('hasValidFilterOptions:', hasValidFilterOptions);
  console.log('hasAnyFilterData:', hasAnyFilterData);
  console.log('filtersReady:', filtersReady);
  console.log('showFilterComponents:', showFilterComponents);
  
  if (hasValidFilterOptions) {
    console.log('Opções disponíveis:', {
      status: filterOptions.statusOptions.length,
      closer: filterOptions.closerOptions.length,
      origem: filterOptions.origemOptions.length
    });
  }

  return (
    <Card className="mb-8 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">Filtros Globais</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <DatePickerWithRange 
              dateRange={tempDateRange} 
              onDateRangeChange={onTempDateRangeChange}
              allLeads={allLeads}
            />
          </div>
          
          {/* Status Filter */}
          {showFilterComponents ? (
            <FilterSelect
              label="Status"
              options={filterOptions.statusOptions}
              selectedValues={tempFilters?.status || []}
              onChange={(values) => onTempFilterChange('status', values)}
              placeholder="Todos os status"
              isLoading={false}
            />
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Button
                variant="outline"
                disabled
                className="w-full justify-between opacity-50"
              >
                {isLoading ? "Carregando..." : "Nenhuma opção disponível"}
              </Button>
            </div>
          )}
          
          {/* Closer Filter */}
          {showFilterComponents ? (
            <FilterSelect
              label="Closer"
              options={filterOptions.closerOptions}
              selectedValues={tempFilters?.closer || []}
              onChange={(values) => onTempFilterChange('closer', values)}
              placeholder="Todos os closers"
              isLoading={false}
            />
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Closer
              </label>
              <Button
                variant="outline"
                disabled
                className="w-full justify-between opacity-50"
              >
                {isLoading ? "Carregando..." : "Nenhuma opção disponível"}
              </Button>
            </div>
          )}
          
          {/* Origem Filter */}
          {showFilterComponents ? (
            <FilterSelect
              label="Origem"
              options={filterOptions.origemOptions}
              selectedValues={tempFilters?.origem || []}
              onChange={(values) => onTempFilterChange('origem', values)}
              placeholder="Todas as origens"
              isLoading={false}
            />
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origem
              </label>
              <Button
                variant="outline"
                disabled
                className="w-full justify-between opacity-50"
              >
                {isLoading ? "Carregando..." : "Nenhuma opção disponível"}
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button 
              onClick={onApplyFilters}
              disabled={!hasPendingFilters || !filtersReady}
              className={hasPendingFilters ? 'bg-orange-500 hover:bg-orange-600' : ''}
            >
              Aplicar Filtros
              {hasPendingFilters && (
                <span className="ml-2 w-2 h-2 bg-white rounded-full"></span>
              )}
            </Button>
            <Button 
              variant="ghost" 
              onClick={onClearFilters}
              disabled={!filtersReady}
            >
              Limpar Filtros
            </Button>
          </div>
          
          <div className="flex items-center">
            {isLoading && (
              <span className="text-sm text-gray-600">
                Carregando filtros...
              </span>
            )}
            {!isLoading && !hasAnyFilterData && hasValidFilterOptions && (
              <span className="text-sm text-yellow-600">
                Nenhum dado válido para filtros
              </span>
            )}
            {!isLoading && hasPendingFilters && (
              <span className="text-sm text-orange-600 font-medium">
                Existem filtros não aplicados
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
