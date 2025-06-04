
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CloserLossData {
  closer: string;
  perdas: number;
  apresentacoes: number;
  taxaPerda: number;
  eficiencia: number;
}

interface CloserLossChartProps {
  closerLossAnalysis: CloserLossData[];
  customTooltip: React.ComponentType<any>;
}

export const CloserLossChart = React.memo(({ closerLossAnalysis, customTooltip: CustomTooltip }: CloserLossChartProps) => {
  if (closerLossAnalysis.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
        <span className="text-xl">👥</span>
        Taxa de Perda por Closer
      </h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={closerLossAnalysis}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="closer" 
            stroke="#9ca3af" 
            fontSize={10}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis stroke="#9ca3af" fontSize={10} />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="taxaPerda" 
            fill="#f59e0b"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

CloserLossChart.displayName = 'CloserLossChart';
