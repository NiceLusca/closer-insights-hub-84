
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
                return value;
              }}
              labelFormatter={(label) => `Origem: ${label}`}
              formatter={(value, name, props) => {
                if (name === 'leads') return [value, 'Total de Leads'];
                if (name === 'vendas') return [value, 'Vendas'];
                return [value, name];
              }}
              labelStyle={{ color: '#374151' }}
              separator=": "
              itemStyle={{ color: '#374151' }}
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
          </BarChart>
        </ResponsiveContainer>
        
        {/* Informações adicionais */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {originData.slice(0, 3).map((item, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm text-gray-900 truncate">{item.origem}</h4>
              <div className="text-xs text-gray-600 mt-1">
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
