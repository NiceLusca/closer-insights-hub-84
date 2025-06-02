
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CustomTooltip } from "./CustomTooltip";
import type { DayData } from "@/hooks/useTemporalData";

interface DayOfWeekChartProps {
  data: DayData[];
}

export const DayOfWeekChart = React.memo(({ data }: DayOfWeekChartProps) => {
  return (
    <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100">
          Performance por Dia da Semana
        </CardTitle>
        <p className="text-sm text-gray-400">
          Análise considera apenas dias com pelo menos 5% do volume total de leads
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="leads" fill="#60a5fa" name="Leads Recebidos" radius={[2, 2, 0, 0]} />
            <Bar dataKey="conversoes" fill="#34d399" name="Conversões" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

DayOfWeekChart.displayName = 'DayOfWeekChart';
