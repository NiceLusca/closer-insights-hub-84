
import React from "react";
import { Target, TrendingUp, DollarSign } from "lucide-react";
import type { MonthlyData } from "./types";
import { formatCurrency } from "./utils";

interface MetricsCardsProps {
  monthlyData: MonthlyData;
}

export const MetricsCards = React.memo(({ monthlyData }: MetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Meta */}
      <div className="p-4 rounded-xl bg-gray-700/50 border border-gray-600/50 hover-scale transition-all duration-200 group">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-sm font-medium text-gray-300">Meta Mensal</span>
        </div>
        <p className="text-xl font-bold text-white">{formatCurrency(monthlyData.goal)}</p>
      </div>
      
      {/* Faturado */}
      <div className="p-4 rounded-xl bg-gray-700/50 border border-gray-600/50 hover-scale transition-all duration-200 group">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-sm font-medium text-gray-300">Faturado</span>
        </div>
        <p className="text-xl font-bold text-green-400">{formatCurrency(monthlyData.monthlyRevenue)}</p>
        <p className="text-xs text-gray-400 mt-1">
          {monthlyData.leadsCount} leads fechados • 
          {monthlyData.vendasCompletas > 0 && ` ${monthlyData.vendasCompletas} completas`}
          {monthlyData.vendasCompletas > 0 && monthlyData.vendasRecorrentes > 0 && ' • '}
          {monthlyData.vendasRecorrentes > 0 && ` ${monthlyData.vendasRecorrentes} recorrentes`}
        </p>
      </div>
      
      {/* Restante */}
      <div className="p-4 rounded-xl bg-gray-700/50 border border-gray-600/50 hover-scale transition-all duration-200 group">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-sm font-medium text-gray-300">Restante</span>
        </div>
        <p className="text-xl font-bold text-orange-400">{formatCurrency(monthlyData.remaining)}</p>
        <p className="text-xs text-gray-400 mt-1">
          {monthlyData.progress >= 100 ? 'Meta atingida! 🎉' : 'para atingir a meta'}
        </p>
      </div>
    </div>
  );
});

MetricsCards.displayName = 'MetricsCards';
