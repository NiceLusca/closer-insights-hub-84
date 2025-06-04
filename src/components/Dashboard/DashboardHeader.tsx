
import React from "react";
import { Button } from "@/components/ui/button";
import { Filter, RefreshCw } from "lucide-react";

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
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-xl border-b border-gray-700/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Clarity
            </h1>
            <p className="text-gray-300 mt-2 text-lg">
              Dashboard Analytics para Gestão de Leads
              {lastUpdated && (
                <span className="ml-2 text-sm text-gray-400">
                  • Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={onToggleFilters}
              className="flex items-center space-x-2 bg-gray-800/50 border-gray-600 text-gray-200 hover:bg-gray-700/50 hover:text-white transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              {hasPendingFilters && (
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={onRefreshData}
              disabled={isLoading}
              className="bg-gray-800/50 border-gray-600 text-gray-200 hover:bg-gray-700/50 hover:text-white transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
