
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { generateLeadsChartData } from "@/utils/chartDataUtils";
import type { Lead } from "@/types/lead";

interface LeadsChartProps {
  leads: Lead[];
}

export function LeadsChart({ leads }: LeadsChartProps) {
  const chartData = useMemo(() => generateLeadsChartData(leads), [leads]);

  return (
    <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100">
          Leads por Dia - Últimos 30 dias (excluindo Mentorados)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              fontSize={12}
            />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                color: '#f3f4f6'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#60a5fa" 
              strokeWidth={2}
              name="Total de Leads"
              dot={{ fill: '#60a5fa', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="agendados" 
              stroke="#34d399" 
              strokeWidth={2}
              name="Agendados"
              dot={{ fill: '#34d399', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="fechamentos" 
              stroke="#fbbf24" 
              strokeWidth={2}
              name="Fechamentos"
              dot={{ fill: '#fbbf24', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
