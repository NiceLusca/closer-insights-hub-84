
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { generateOriginAnalysisData } from "@/utils/chartDataUtils";
import type { Lead } from "@/types/lead";

interface OriginAnalysisProps {
  leads: Lead[];
}

export function OriginAnalysis({ leads }: OriginAnalysisProps) {
  const originData = useMemo(() => generateOriginAnalysisData(leads), [leads]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="mb-8 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Análise por Origem de Campanha (excluindo Mentorados)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={originData} margin={{ bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="origem" 
              stroke="#64748b"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value, name) => {
                if (name === 'receita') return formatCurrency(value as number);
                if (name === 'conversao') return `${value}%`;
                if (name === 'roi') return formatCurrency(value as number);
                return value;
              }}
            />
            <Legend />
            <Bar 
              dataKey="leads" 
              fill="#3b82f6" 
              name="Total de Leads"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="vendas" 
              fill="#10b981" 
              name="Vendas"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="receita" 
              fill="#f59e0b" 
              name="Receita"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
