
import React from "react";
import type { MonthlyData } from "./types";
import { formatCurrency } from "./utils";

interface StatusIndicatorProps {
  monthlyData: MonthlyData;
}

export const StatusIndicator = React.memo(({ monthlyData }: StatusIndicatorProps) => {
  return (
    <div className="text-center p-4 rounded-xl bg-gradient-to-r from-gray-700/30 to-gray-600/30 border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300">
      <p className="text-sm font-medium">
        {monthlyData.progress >= 100 ? (
          <span className="text-green-400 animate-pulse">🎉 Parabéns! Meta do mês atingida!</span>
        ) : monthlyData.progress >= 70 ? (
          <span className="text-yellow-400">🔥 Quase lá! Faltam apenas {formatCurrency(monthlyData.remaining)}</span>
        ) : (
          <span className="text-gray-300">💪 Continue focado na meta mensal</span>
        )}
      </p>
    </div>
  );
});

StatusIndicator.displayName = 'StatusIndicator';
