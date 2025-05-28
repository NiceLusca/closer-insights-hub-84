
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
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                color: '#f3f4f6'
              }}
              formatter={(value, name) => {
                if (name === 'leads') return [value, 'Total de Leads'];
                if (name === 'vendas') return [value, 'Vendas'];
                if (name === 'conversao') return [`${value}%`, 'Taxa de Conversão'];
                return [value, name];
              }}
              labelFormatter={(label) => `Origem: ${label}`}
              labelStyle={{ color: '#f3f4f6' }}
              separator=": "
              itemStyle={{ color: '#f3f4f6' }}
            />
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
}
