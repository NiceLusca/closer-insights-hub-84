
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { generateStatusDistributionData } from "@/utils/chartDataUtils";
import { getStatusColor } from "@/utils/statusColors";
import type { Lead } from "@/types/lead";

interface StatusDistributionProps {
  leads: Lead[];
}

export function StatusDistribution({ leads }: StatusDistributionProps) {
  const statusData = useMemo(() => {
    console.log('StatusDistribution: Gerando dados para', leads.length, 'leads');
    const data = generateStatusDistributionData(leads);
    console.log('StatusDistribution: Dados gerados:', data);
    return data;
  }, [leads]);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const totalLeads = statusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-100">
          Distribuição por Status (excluindo Mentorados)
        </CardTitle>
        <p className="text-sm text-gray-400">
          Total de {totalLeads} leads analisados
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              stroke="#374151"
              strokeWidth={2}
            >
              {statusData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getStatusColor(entry.name)}
                  className="hover:opacity-80 transition-opacity duration-200"
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                color: '#f3f4f6',
                fontSize: '14px'
              }}
              formatter={(value, name) => [
                `${value} leads (${statusData.find(d => d.name === name)?.percentage}%)`, 
                name
              ]}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '14px',
                color: '#d1d5db'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
