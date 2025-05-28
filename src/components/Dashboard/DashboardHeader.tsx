
import React from "react";
import { Button } from "@/components/ui/button";
import { FilterIcon, RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  isLoading: boolean;
  lastUpdated: Date | null;
  showFilters: boolean;
  hasPendingFilters: boolean;
  onToggleFilters: () => void;
  onRefreshData: () => void;
}

export function DashboardHeader({
  isLoading,
  lastUpdated,
  showFilters,
  hasPendingFilters,
  onToggleFilters,
  onRefreshData
}: DashboardHeaderProps) {
  return (
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
              onClick={onToggleFilters}
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
              onClick={onRefreshData}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
