
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { generateLeadsChartData } from "@/utils/chartDataUtils";
import type { Lead } from "@/types/lead";

interface LeadsChartProps {
  leads: Lead[];
}

export function LeadsChart({ leads }: LeadsChartProps) {
  const chartData = useMemo(() => {
    console.log('LeadsChart: Gerando dados do gráfico para', leads.length, 'leads');
    const data = generateLeadsChartData(leads);
    console.log('LeadsChart: Dados gerados:', data);
    return data;
  }, [leads]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl">
          <p className="text-gray-200 font-medium mb-2">{`Data: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value} leads`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const totalLeadsInChart = chartData.reduce((sum, day) => sum + day.total, 0);

  return (
    <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-100">
          Leads por Dia - Últimos 30 dias (excluindo Mentorados)
        </CardTitle>
        <p className="text-sm text-gray-400">
          Total de {totalLeadsInChart} leads no período
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                color: '#d1d5db'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#60a5fa" 
              strokeWidth={3}
              name="Total de Leads"
              dot={{ fill: '#60a5fa', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#60a5fa', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="agendados" 
              stroke="#34d399" 
              strokeWidth={3}
              name="Agendados"
              dot={{ fill: '#34d399', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#34d399', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="fechamentos" 
              stroke="#fbbf24" 
              strokeWidth={3}
              name="Fechamentos"
              dot={{ fill: '#fbbf24', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#fbbf24', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
