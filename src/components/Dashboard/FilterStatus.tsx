
import React from "react";

interface FilterStatusProps {
  isLoading: boolean;
  hasPendingFilters: boolean;
  hasValidOptions: boolean;
}

export function FilterStatus({
  isLoading,
  hasPendingFilters,
  hasValidOptions
}: FilterStatusProps) {
  if (isLoading) {
    return (
      <span className="text-sm text-blue-600 font-medium">
        🔄 Carregando filtros...
      </span>
    );
  }
  
  if (hasPendingFilters) {
    return (
      <span className="text-sm text-orange-600 font-medium">
        ⚠️ Filtros pendentes de aplicação
      </span>
    );
  }
  
  if (hasValidOptions) {
    return (
      <span className="text-sm text-green-600 font-medium">
        ✅ Filtros atualizados
      </span>
    );
  }
  
  return null;
}
