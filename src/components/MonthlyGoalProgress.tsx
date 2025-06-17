
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { ProgressBar } from "./MonthlyGoalProgress/ProgressBar";
import { MetricsCards } from "./MonthlyGoalProgress/MetricsCards";
import { StatusIndicator } from "./MonthlyGoalProgress/StatusIndicator";
import { calculateMonthlyData } from "./MonthlyGoalProgress/utils";
import type { Lead } from "@/types/lead";

interface MonthlyGoalProgressProps {
  allLeads: Lead[];
}

export const MonthlyGoalProgress = React.memo(({ allLeads }: MonthlyGoalProgressProps) => {
  const monthlyData = useMemo(() => calculateMonthlyData(allLeads), [allLeads]);
  
  const currentDate = new Date();
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  
  return (
    <Card className="mb-8 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 hover-lift transition-all duration-300 card-entrance">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-100">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 hover:scale-110 transition-transform duration-200">
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Meta de Faturamento - {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProgressBar monthlyData={monthlyData} />
        <MetricsCards monthlyData={monthlyData} />
        <StatusIndicator monthlyData={monthlyData} />
      </CardContent>
    </Card>
  );
});

MonthlyGoalProgress.displayName = 'MonthlyGoalProgress';
