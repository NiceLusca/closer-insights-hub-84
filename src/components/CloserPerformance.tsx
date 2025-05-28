
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Lead } from "@/types/lead";

interface CloserPerformanceProps {
  leads: Lead[];
}

export function CloserPerformance({ leads }: CloserPerformanceProps) {
  const closerData = useMemo(() => {
    const closerStats: Record<string, { leads: number; vendas: number; receita: number }> = {};
    
    leads.forEach(lead => {
      if (!closerStats[lead.Closer]) {
        closerStats[lead.Closer] = { leads: 0, vendas: 0, receita: 0 };
      }
      
      closerStats[lead.Closer].leads++;
      
      if (lead.Status === 'Fechou') {
        closerStats[lead.Closer].vendas++;
        closerStats[lead.Closer].receita += lead['Venda Completa'] || 0;
      }
    });

    return Object.entries(closerStats)
      .map(([closer, stats]) => ({
        closer: closer.split(' ')[0], // Show only first name for better display
        leads: stats.leads,
        vendas: stats.vendas,
        conversao: stats.leads > 0 ? ((stats.vendas / stats.leads) * 100).toFixed(1) : '0',
        receita: stats.receita
      }))
      .sort((a, b) => b.vendas - a.vendas);
  }, [leads]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Performance por Closer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={closerData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="closer" 
              stroke="#64748b"
              fontSize={12}
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
      </CardContent>
    </Card>
  );
}
