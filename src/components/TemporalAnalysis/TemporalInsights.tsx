
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Activity, AlertTriangle } from "lucide-react";
import { getVolumeIndicator } from "@/utils/volumeAnalysis";
import type { TemporalInsights } from "@/hooks/useTemporalData";

interface TemporalInsightsProps {
  insights: TemporalInsights;
}

export const TemporalInsights = React.memo(({ insights }: TemporalInsightsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className={`${insights.bestDay ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30' : 'bg-gray-700/50 border border-gray-600/50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">MELHOR DIA</span>
          </div>
          {insights.bestDay ? (
            <>
              <p className="text-lg font-bold text-white">{insights.bestDay.day}</p>
              <p className="text-sm text-blue-300">{insights.bestDay.taxa}% conversão</p>
              <p className="text-xs text-gray-400">{insights.bestDay.leads} leads</p>
              <p className="text-xs text-green-400 mt-1">
                {getVolumeIndicator(insights.bestDay.leads, insights.totalValidLeads).message}
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1 mb-1">
                <AlertTriangle className="w-3 h-3 text-yellow-400" />
                <p className="text-sm font-bold text-yellow-400">Dados Insuficientes</p>
              </div>
              <p className="text-xs text-gray-400">
                Nenhum dia com volume significativo (≥5% do total)
              </p>
              <p className="text-xs text-gray-500">
                {insights.significantDays} de 7 dias com dados suficientes
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className={`${insights.bestHour ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30' : 'bg-gray-700/50 border border-gray-600/50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400 font-medium">MELHOR HORÁRIO</span>
          </div>
          {insights.bestHour ? (
            <>
              <p className="text-lg font-bold text-white">{insights.bestHour.hourLabel}</p>
              <p className="text-sm text-green-300">{insights.bestHour.taxa}% conversão</p>
              <p className="text-xs text-gray-400">{insights.bestHour.leads} leads</p>
              <p className="text-xs text-green-400 mt-1">
                {getVolumeIndicator(insights.bestHour.leads, insights.totalValidLeads).message}
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1 mb-1">
                <AlertTriangle className="w-3 h-3 text-yellow-400" />
                <p className="text-sm font-bold text-yellow-400">Dados Insuficientes</p>
              </div>
              <p className="text-xs text-gray-400">
                Nenhum horário com volume significativo (≥5% do total)
              </p>
              <p className="text-xs text-gray-500">
                {insights.significantHours} horários com dados suficientes
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-400 font-medium">LEADS ANALISADOS</span>
          </div>
          <p className="text-lg font-bold text-white">{insights.totalValidLeads}</p>
          <p className="text-sm text-purple-300">com data válida</p>
          <p className="text-xs text-gray-400">excluindo mentorados</p>
        </CardContent>
      </Card>
    </div>
  );
});

TemporalInsights.displayName = 'TemporalInsights';
