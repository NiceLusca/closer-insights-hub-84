
import React from "react";
import { useTemporalData } from "@/hooks/useTemporalData";
import { TemporalInsightsCard } from "./TemporalAnalysis/TemporalInsights";
import { DayOfWeekChart } from "./TemporalAnalysis/DayOfWeekChart";
import { HourlyChart } from "./TemporalAnalysis/HourlyChart";
import { DailyTrendChart } from "./TemporalAnalysis/DailyTrendChart";
import type { Lead } from "@/types/lead";

interface TemporalAnalysisProps {
  leads: Lead[];
}

export const TemporalAnalysis = React.memo(({ leads }: TemporalAnalysisProps) => {
  const temporalData = useTemporalData(leads);

  return (
    <div className="space-y-8">
      {/* Insights Cards */}
      <TemporalInsightsCard insights={temporalData.insights} />

      {/* Análise por Dia da Semana */}
      <DayOfWeekChart data={temporalData.dayOfWeekData} />

      {/* Análise por Horário */}
      <HourlyChart 
        data={temporalData.hourData}
        peakHours={temporalData.insights.peakHours}
        totalValidLeads={temporalData.insights.totalValidLeads}
      />

      {/* Tendência dos Últimos 30 Dias */}
      <DailyTrendChart data={temporalData.dailyData} />
    </div>
  );
});

TemporalAnalysis.displayName = 'TemporalAnalysis';
