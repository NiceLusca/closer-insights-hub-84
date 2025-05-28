
import React from "react";
import { Button } from "@/components/ui/button";

interface FilterActionsProps {
  hasPendingFilters: boolean;
  isLoading: boolean;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export function FilterActions({
  hasPendingFilters,
  isLoading,
  onApplyFilters,
  onClearFilters
}: FilterActionsProps) {
  return (
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
  );
}
