
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
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Receita por Dia (Últimos 30 dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="receita" 
              stroke="#059669" 
              strokeWidth={3}
              name="Receita Total"
              dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="recorrente" 
              stroke="#7c3aed" 
              strokeWidth={2}
              name="Receita Recorrente"
              dot={{ fill: '#7c3aed', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
