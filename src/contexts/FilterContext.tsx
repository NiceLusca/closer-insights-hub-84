
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { DateRange, Filters } from "@/types/lead";

interface FilterContextType {
  dateRange: DateRange;
  filters: Filters;
  tempDateRange: DateRange;
  tempFilters: Filters;
  hasPendingFilters: boolean;
  setTempDateRange: (dateRange: DateRange) => void;
  handleTempFilterChange: (filterType: keyof Filters, values: string[]) => void;
  applyFilters: () => void;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function useGlobalFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useGlobalFilters must be used within a FilterProvider');
  }
  return context;
}

interface FilterProviderProps {
  children: ReactNode;
}

export function FilterProvider({ children }: FilterProviderProps) {
  const { toast } = useToast();
  
  const defaultDateRange = {
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  };

  const defaultFilters = {
    status: [],
    closer: [],
    origem: []
  };

  // Filtros aplicados
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  // Filtros temporários
  const [tempDateRange, setTempDateRange] = useState<DateRange>(defaultDateRange);
  const [tempFilters, setTempFilters] = useState<Filters>(defaultFilters);

  const handleTempFilterChange = (filterType: keyof Filters, values: string[]) => {
    console.log('🔄 Mudança temporária de filtro:', filterType, values);
    setTempFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
  };

  const applyFilters = () => {
    console.log('✅ Aplicando filtros globais:', { tempDateRange, tempFilters });
    setDateRange(tempDateRange);
    setFilters(tempFilters);
    toast({
      title: "✅ Filtros aplicados!",
      description: "Todos os dashboards foram atualizados com os novos filtros.",
    });
  };

  const clearFilters = () => {
    setDateRange(defaultDateRange);
    setFilters(defaultFilters);
    setTempDateRange(defaultDateRange);
    setTempFilters(defaultFilters);
    
    toast({
      title: "🗑️ Filtros limpos",
      description: "Todos os filtros foram removidos.",
    });
  };

  const hasPendingFilters = 
    JSON.stringify(filters) !== JSON.stringify(tempFilters) ||
    JSON.stringify(dateRange) !== JSON.stringify(tempDateRange);

  return (
    <FilterContext.Provider value={{
      dateRange,
      filters,
      tempDateRange,
      tempFilters,
      hasPendingFilters,
      setTempDateRange,
      handleTempFilterChange,
      applyFilters,
      clearFilters
    }}>
      {children}
    </FilterContext.Provider>
  );
}
