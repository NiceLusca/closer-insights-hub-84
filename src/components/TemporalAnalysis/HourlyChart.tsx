
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertTriangle, Clock } from "lucide-react";
import { CustomTooltip } from "./CustomTooltip";
import { getVolumeIndicator } from "@/utils/volumeAnalysis";
import type { HourData } from "@/hooks/useTemporalData";

interface HourlyChartProps {
  data: HourData[];
  peakHours: HourData[];
  totalValidLeads: number;
}

const EnhancedTooltip = React.memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const hourData = payload[0]?.payload;
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl z-[9999] relative" style={{ zIndex: 9999 }}>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <p className="text-gray-200 font-medium">{label}</p>
        </div>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}{entry.name.includes('Taxa') || entry.name.includes('Conversão') ? '%' : ''}
          </p>
        ))}
        {hourData && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <p className="text-xs text-gray-400">
              Conversão: {hourData.conversoes}/{hourData.leads} leads
            </p>
            <p className="text-xs text-gray-400">
              Volume: {((hourData.leads / payload[0]?.payload?.totalValidLeads || 1) * 100).toFixed(1)}% do total
            </p>
          </div>
        )}
      </div>
    );
  }
  return null;
});

EnhancedTooltip.displayName = 'EnhancedTooltip';

export const HourlyChart = React.memo(({ data, peakHours, totalValidLeads }: HourlyChartProps) => {
  // Enriquecer dados com informações adicionais para o tooltip
  const enrichedData = data.map(hour => ({
    ...hour,
    totalValidLeads
  }));

  return (
    <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Performance por Horário do Dia
        </CardTitle>
        <p className="text-sm text-gray-400">
          Horários quebrados (ex: 8h45) são agrupados na hora cheia (8h00) • Volume ≥5% para ranking
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={enrichedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="hourLabel" stroke="#9ca3af" fontSize={11} />
            <YAxis stroke="#9ca3af" fontSize={11} />
            <Tooltip content={<EnhancedTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="leads" 
              stroke="#60a5fa" 
              name="Leads Recebidos"
              strokeWidth={2}
              dot={{ fill: '#60a5fa', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="taxa" 
              stroke="#f59e0b" 
              name="Taxa de Conversão (%)"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {peakHours.length > 0 ? (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-200 mb-3">
              Melhores Horários de Conversão (Volume ≥5%)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {peakHours.map((hour, index) => (
                <div key={hour.hour} className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      'bg-amber-600 text-white'
                    }`}>
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium text-white">{hour.hourLabel}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {hour.conversoes}/{hour.leads} leads • {hour.taxa}% conversão
                  </p>
                  <p className="text-xs text-green-400">
                    {getVolumeIndicator(hour.leads, totalValidLeads).percentage.toFixed(1)}% do total
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-medium">Dados Insuficientes para Ranking</span>
            </div>
            <p className="text-sm text-gray-300">
              Nenhum horário possui volume significativo (≥5% do total) para análise confiável.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

HourlyChart.displayName = 'HourlyChart';
