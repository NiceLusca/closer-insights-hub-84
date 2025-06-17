
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProgressTooltip } from "./ProgressTooltip";
import type { MonthlyData } from "./types";
import { getProgressColor, getProgressBg } from "./utils";

interface ProgressBarProps {
  monthlyData: MonthlyData;
}

export const ProgressBar = React.memo(({ monthlyData }: ProgressBarProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400 font-medium">Progresso da Meta</span>
        <span className={`font-bold text-lg transition-colors duration-300 ${getProgressColor(monthlyData.progress)}`}>
          {monthlyData.progress.toFixed(1)}%
        </span>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative overflow-hidden cursor-help">
              <Progress 
                value={monthlyData.progress} 
                className="h-4 bg-gray-700/50 rounded-full shadow-inner" 
              />
              <div 
                className={`absolute top-0 left-0 h-4 rounded-full transition-all duration-1000 ease-out ${getProgressBg(monthlyData.progress)} shadow-lg`}
                style={{ 
                  width: `${Math.min(monthlyData.progress, 100)}%`,
                  boxShadow: `0 0 10px ${monthlyData.progress >= 70 ? 'rgba(34, 197, 94, 0.5)' : monthlyData.progress >= 30 ? 'rgba(245, 158, 11, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`
                }}
              >
                <div className="h-full w-full rounded-full bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </TooltipTrigger>
          <ProgressTooltip monthlyData={monthlyData} />
        </Tooltip>
      </TooltipProvider>
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';
