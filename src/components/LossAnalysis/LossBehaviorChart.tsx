
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface BehaviorData {
  tipo: string;
  quantidade: number;
  percentual: number;
  impactoFinanceiro: number;
  cor: string;
}

interface LossBehaviorChartProps {
  behaviorAnalysis: BehaviorData[];
  customTooltip: React.ComponentType<any>;
}

export const LossBehaviorChart = React.memo(({ behaviorAnalysis, customTooltip: CustomTooltip }: LossBehaviorChartProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div>
        <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <span className="text-xl">🎯</span>
          Distribuição por Tipo de Perda
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={behaviorAnalysis}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="quantidade"
            >
              {behaviorAnalysis.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.cor} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px', color: '#d1d5db' }}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>
                  {value} ({entry.payload?.percentual?.toFixed(1) || '0'}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <span className="text-xl">💰</span>
          Impacto Financeiro por Tipo
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={behaviorAnalysis}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="tipo" 
              stroke="#9ca3af" 
              fontSize={10}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#9ca3af" fontSize={10} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="impactoFinanceiro" 
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

LossBehaviorChart.displayName = 'LossBehaviorChart';
