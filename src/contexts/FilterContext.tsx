
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { DateRange, Filters } from "@/types/lead";

interface FilterContextType {
  dateRange: DateRange;
  filters: Filters;
  tempDateRange: DateRange;
  tempFilters: Filters;
  hasPendingFilters: boolean;
  isApplyingFilters: boolean;
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
  
  // Estado de aplicação
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  const handleTempFilterChange = (filterType: keyof Filters, values: string[]) => {
    console.log('🔄 Mudança temporária de filtro:', filterType, values);
    setTempFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
  };

  const applyFilters = async () => {
    if (isApplyingFilters) {
      console.log('⚠️ Aplicação de filtros já em andamento, ignorando...');
      return;
    }

    try {
      setIsApplyingFilters(true);
      console.log('✅ Aplicando filtros globais:', { tempDateRange, tempFilters });
      
      // Aplicar com pequeno delay para evitar bugs de estado
      setTimeout(() => {
        setDateRange(tempDateRange);
        setFilters(tempFilters);
        setIsApplyingFilters(false);
        
        toast({
          title: "✅ Filtros aplicados!",
          description: "Todos os dashboards foram atualizados com os novos filtros.",
        });
      }, 100);
      
    } catch (error) {
      console.error('❌ Erro ao aplicar filtros:', error);
      setIsApplyingFilters(false);
      toast({
        title: "❌ Erro ao aplicar filtros",
        description: "Tente novamente ou recarregue a página.",
        variant: "destructive"
      });
    }
  };

  const clearFilters = () => {
    try {
      console.log('🗑️ Limpando filtros globais');
      setDateRange(defaultDateRange);
      setFilters(defaultFilters);
      setTempDateRange(defaultDateRange);
      setTempFilters(defaultFilters);
      
      toast({
        title: "🗑️ Filtros limpos",
        description: "Todos os filtros foram removidos.",
      });
    } catch (error) {
      console.error('❌ Erro ao limpar filtros:', error);
      toast({
        title: "❌ Erro ao limpar filtros",
        description: "Tente recarregar a página.",
        variant: "destructive"
      });
    }
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
      isApplyingFilters,
      setTempDateRange,
      handleTempFilterChange,
      applyFilters,
      clearFilters
    }}>
      {children}
    </FilterContext.Provider>
  );
}
