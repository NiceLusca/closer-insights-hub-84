
import React from "react";
import { TooltipContent } from "@/components/ui/tooltip";
import type { MonthlyData } from "./types";
import { getCloserColor } from "./constants";
import { formatCurrency } from "./utils";

interface ProgressTooltipProps {
  monthlyData: MonthlyData;
}

export const ProgressTooltip = React.memo(({ monthlyData }: ProgressTooltipProps) => {
  return (
    <TooltipContent side="bottom" className="max-w-sm p-4">
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-gray-200 border-b border-gray-600 pb-2">
          🎯 Contribuições para a Meta (por Valor)
        </h4>
        
        {monthlyData.closerContributions.length > 0 ? (
          <div className="space-y-2">
            {monthlyData.closerContributions.map(([closer, data], index) => (
              <div key={closer} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-current ${getCloserColor(index)}`}></div>
                    <span className="text-gray-300 font-medium">{closer}</span>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${getCloserColor(index)}`}>
                      {formatCurrency(data.revenue)}
                    </div>
                    <div className="text-gray-400 font-medium">
                      {data.percentage.toFixed(1)}% da meta
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 ml-4">
                  {data.salesCount} vendas • 
                  {data.vendasCompletas > 0 && ` ${data.vendasCompletas} completas`}
                  {data.vendasCompletas > 0 && data.vendasRecorrentes > 0 && ' • '}
                  {data.vendasRecorrentes > 0 && ` ${data.vendasRecorrentes} recorrentes`}
                </div>
              </div>
            ))}
            
            <div className="border-t border-gray-600 pt-2 mt-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-200">Total Geral:</span>
                <div className="text-right">
                  <div className="text-green-400">{formatCurrency(monthlyData.monthlyRevenue)}</div>
                  <div className="text-gray-400">
                    {monthlyData.leadsCount} leads fechados
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 text-right mt-1">
                {monthlyData.vendasCompletas} completas • {monthlyData.vendasRecorrentes} recorrentes
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-xs">Nenhuma venda registrada neste mês</p>
        )}
      </div>
    </TooltipContent>
  );
});

ProgressTooltip.displayName = 'ProgressTooltip';
