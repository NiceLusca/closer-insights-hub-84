
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CustomTooltip } from "./CustomTooltip";
import type { DailyData } from "@/hooks/useTemporalData";

interface DailyTrendChartProps {
  data: DailyData[];
}

export const DailyTrendChart = React.memo(({ data }: DailyTrendChartProps) => {
  return (
    <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100">
          Tendência dos Últimos 30 Dias
        </CardTitle>
        <p className="text-sm text-gray-400">
          Volume diário de leads e vendas efetivadas
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
            <YAxis stroke="#9ca3af" fontSize={11} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="leads" 
              stroke="#60a5fa" 
              name="Leads Recebidos"
              strokeWidth={3}
              dot={{ fill: '#60a5fa', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="conversoes" 
              stroke="#34d399" 
              name="Vendas Fechadas"
              strokeWidth={3}
              dot={{ fill: '#34d399', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-400">
            <strong className="text-blue-400">Leads Recebidos:</strong> Número de novos leads que chegaram em cada dia<br/>
            <strong className="text-green-400">Vendas Fechadas:</strong> Quantidade de leads que efetivamente compraram (status "Fechou")<br/>
            <strong className="text-yellow-400">Critério de Análise:</strong> Insights considerados apenas com volume ≥5% para maior confiabilidade
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

DailyTrendChart.displayName = 'DailyTrendChart';
