
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
  allLeads?: any[]; // Para passar para o DatePickerWithRange
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
  onTempDateRangeChange,
  onTempFilterChange,
  onApplyFilters,
  onClearFilters
}: FiltersPanelProps) {
  if (!showFilters) return null;

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
          
          <FilterSelect
            label="Status"
            options={filterOptions.statusOptions}
            selectedValues={tempFilters.status}
            onChange={(values) => onTempFilterChange('status', values)}
            placeholder="Todos os status"
          />
          
          <FilterSelect
            label="Closer"
            options={filterOptions.closerOptions}
            selectedValues={tempFilters.closer}
            onChange={(values) => onTempFilterChange('closer', values)}
            placeholder="Todos os closers"
          />
          
          <FilterSelect
            label="Origem"
            options={filterOptions.origemOptions}
            selectedValues={tempFilters.origem}
            onChange={(values) => onTempFilterChange('origem', values)}
            placeholder="Todas as origens"
          />
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button 
              onClick={onApplyFilters}
              disabled={!hasPendingFilters}
              className={hasPendingFilters ? 'bg-orange-500 hover:bg-orange-600' : ''}
            >
              Aplicar Filtros
              {hasPendingFilters && (
                <span className="ml-2 w-2 h-2 bg-white rounded-full"></span>
              )}
            </Button>
            <Button variant="ghost" onClick={onClearFilters}>
              Limpar Filtros
            </Button>
          </div>
          
          <div className="flex items-center">
            {hasPendingFilters && (
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
