
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { generateOriginAnalysisData } from "@/utils/chartDataUtils";
import type { Lead } from "@/types/lead";

interface OriginAnalysisProps {
  leads: Lead[];
}

export const OriginAnalysis = React.memo(({ leads }: OriginAnalysisProps) => {
  const originData = useMemo(() => generateOriginAnalysisData(leads), [leads]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = React.memo(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl">
          <p className="text-gray-200 font-medium mb-2">{`Origem: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'leads' && `Total de Leads: ${entry.value}`}
              {entry.name === 'vendas' && `Vendas: ${entry.value}`}
              {entry.name === 'conversao' && `Taxa de Conversão: ${entry.value}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  });

  CustomTooltip.displayName = 'CustomTooltip';

  return (
    <Card className="mb-8 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100">
          Análise por Origem de Campanha (excluindo Mentorados)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={originData} margin={{ bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="origem" 
              stroke="#9ca3af"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="leads" 
              fill="#60a5fa" 
              name="Total de Leads"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="vendas" 
              fill="#34d399" 
              name="Vendas"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Informações adicionais */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {originData.slice(0, 3).map((item, index) => (
            <div key={index} className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/50">
              <h4 className="font-medium text-sm text-gray-200 truncate">{item.origem}</h4>
              <div className="text-xs text-gray-400 mt-1">
                <div>Taxa: {item.conversao}%</div>
                <div>Receita: {formatCurrency(item.receita)}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

OriginAnalysis.displayName = 'OriginAnalysis';
