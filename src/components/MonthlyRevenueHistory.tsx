
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Lead } from "@/types/lead";

interface MonthlyRevenueHistoryProps {
  leads: Lead[];
}

interface MonthlyData {
  month: string;
  monthName: string;
  total: number;
  byOrigin: Record<string, number>;
}

export const MonthlyRevenueHistory = ({ leads }: MonthlyRevenueHistoryProps) => {
  const monthlyData = useMemo(() => {
    const now = new Date();
    const last12Months: MonthlyData[] = [];
    
    // Gerar os últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      last12Months.push({
        month: monthKey,
        monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        total: 0,
        byOrigin: {}
      });
    }
    
    // Processar leads fechados
    const closedLeads = leads.filter(lead => 
      lead.Status === 'Fechou' && 
      lead.parsedDate && 
      lead['Venda Completa'] && 
      lead['Venda Completa'] > 0
    );
    
    closedLeads.forEach(lead => {
      if (!lead.parsedDate) return;
      
      const fechamentoDate = lead.parsedDate;
      const monthKey = `${fechamentoDate.getFullYear()}-${String(fechamentoDate.getMonth() + 1).padStart(2, '0')}`;
      
      const monthData = last12Months.find(m => m.month === monthKey);
      if (monthData) {
        const valor = lead['Venda Completa'] || 0;
        const origem = lead.origem || 'Não informado';
        
        monthData.total += valor;
        monthData.byOrigin[origem] = (monthData.byOrigin[origem] || 0) + valor;
      }
    });
    
    return last12Months;
  }, [leads]);
  
  // Obter todas as origens únicas
  const allOrigins = useMemo(() => {
    const origins = new Set<string>();
    monthlyData.forEach(month => {
      Object.keys(month.byOrigin).forEach(origin => origins.add(origin));
    });
    return Array.from(origins).sort();
  }, [monthlyData]);
  
  // Preparar dados para o gráfico
  const chartData = useMemo(() => {
    return monthlyData.map(month => ({
      month: month.monthName,
      total: month.total,
      ...month.byOrigin
    }));
  }, [monthlyData]);
  
  // Cores para as origens
  const getOriginColor = (index: number) => {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    return colors[index % colors.length];
  };
  
  const totalRevenue = monthlyData.reduce((sum, month) => sum + month.total, 0);
  const avgMonthly = totalRevenue / 12;
  
  return (
    <div className="mb-8 space-y-6">
      <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-100">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Histórico de Faturamento - Últimos 12 Meses
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-medium">Total 12 Meses</span>
              </div>
              <p className="text-2xl font-bold text-green-400 mt-2">
                {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span className="text-blue-300 font-medium">Média Mensal</span>
              </div>
              <p className="text-2xl font-bold text-blue-400 mt-2">
                {avgMonthly.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span className="text-purple-300 font-medium">Origens Ativas</span>
              </div>
              <p className="text-2xl font-bold text-purple-400 mt-2">
                {allOrigins.length}
              </p>
            </div>
          </div>
          
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  formatter={(value: number) => [
                    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                    'Faturamento'
                  ]}
                />
                <Legend />
                {allOrigins.map((origem, index) => (
                  <Bar 
                    key={origem}
                    dataKey={origem} 
                    stackId="origem"
                    fill={getOriginColor(index)}
                    name={origem}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700/50">
                  <TableHead className="text-gray-300">Mês</TableHead>
                  <TableHead className="text-gray-300 text-right">Total</TableHead>
                  {allOrigins.map(origem => (
                    <TableHead key={origem} className="text-gray-300 text-right">
                      {origem}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.slice().reverse().map((month) => (
                  <TableRow key={month.month} className="border-gray-700/50 hover:bg-gray-700/30">
                    <TableCell className="text-gray-200 font-medium">
                      {month.monthName}
                    </TableCell>
                    <TableCell className="text-gray-200 text-right font-bold">
                      {month.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    {allOrigins.map(origem => (
                      <TableCell key={origem} className="text-gray-300 text-right">
                        {month.byOrigin[origem] 
                          ? month.byOrigin[origem].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : '-'
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
