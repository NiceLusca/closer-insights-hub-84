
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Lead } from "@/types/lead";

interface RevenueChartProps {
  leads: Lead[];
}

export function RevenueChart({ leads }: RevenueChartProps) {
  const chartData = useMemo(() => {
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date()
    });

    return last30Days.map(date => {
      const dayLeads = leads.filter(lead => {
        if (!lead.parsedDate) return false;
        return format(lead.parsedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });

      const receita = dayLeads.reduce((sum, lead) => sum + (lead['Venda Completa'] || 0), 0);
      const recorrente = dayLeads.reduce((sum, lead) => {
        const rec = typeof lead.recorrente === 'number' ? lead.recorrente : 0;
        return sum + rec;
      }, 0);

      return {
        date: format(date, 'dd/MM', { locale: ptBR }),
        receita,
        recorrente
      };
    });
  }, [leads]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100">
          Receita por Dia (Últimos 30 dias)
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
            <YAxis 
              stroke="#9ca3af" 
              fontSize={12}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                color: '#f3f4f6'
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="receita" 
              stroke="#10b981" 
              strokeWidth={3}
              name="Receita Total"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="recorrente" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="Receita Recorrente"
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
