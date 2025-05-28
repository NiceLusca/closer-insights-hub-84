
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, Target, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/DatePickerWithRange";
import { FilterSelect } from "@/components/FilterSelect";
import { FilterActions } from "./FilterActions";
import { FilterStatus } from "./FilterStatus";
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
    <Card className="mb-8 bg-gray-800/90 backdrop-blur-sm shadow-2xl border border-gray-700/50 animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-blue-600/80 via-purple-600/80 to-cyan-600/80 text-white rounded-t-lg">
        <CardTitle className="text-xl font-bold flex items-center space-x-2">
          <Target className="w-6 h-6" />
          <span>Filtros do Dashboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div className="lg:col-span-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Período de Análise</span>
            </label>
            <DatePickerWithRange 
              dateRange={tempDateRange} 
              onDateRangeChange={onTempDateRangeChange}
              allLeads={allLeads}
            />
          </div>
          
          <FilterSelect
            label="Status dos Leads"
            icon={<Target className="w-4 h-4" />}
            options={filterOptions?.statusOptions || []}
            selectedValues={tempFilters?.status || []}
            onChange={(values) => onTempFilterChange('status', values)}
            placeholder="Todos os status"
            isLoading={isLoading}
          />
          
          <FilterSelect
            label="Closers"
            icon={<User className="w-4 h-4" />}
            options={filterOptions?.closerOptions || []}
            selectedValues={tempFilters?.closer || []}
            onChange={(values) => onTempFilterChange('closer', values)}
            placeholder="Todos os closers"
            isLoading={isLoading}
          />
          
          <FilterSelect
            label="Origem/Campanha"
            icon={<Target className="w-4 h-4" />}
            options={filterOptions?.origemOptions || []}
            selectedValues={tempFilters?.origem || []}
            onChange={(values) => onTempFilterChange('origem', values)}
            placeholder="Todas as origens"
            isLoading={isLoading}
          />
        </div>
        
        <div className="flex justify-between items-center border-t border-gray-700 pt-4">
          <div className="flex items-center space-x-3">
            <FilterActions
              hasPendingFilters={hasPendingFilters}
              isLoading={isLoading}
              onApplyFilters={onApplyFilters}
              onClearFilters={onClearFilters}
            />
            
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="flex items-center space-x-2 bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-red-600/20 hover:border-red-500 hover:text-red-300 transition-all duration-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Limpar Filtros</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <FilterStatus
              isLoading={isLoading}
              hasPendingFilters={hasPendingFilters}
              hasValidOptions={hasValidOptions}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
