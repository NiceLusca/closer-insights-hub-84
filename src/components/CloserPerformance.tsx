
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { calculateStandardizedMetrics } from "@/utils/metricsDefinitions";
import { getLeadsExcludingMentorados } from "@/utils/statusClassification";
import type { Lead } from "@/types/lead";

interface CloserPerformanceProps {
  leads: Lead[];
}

export function CloserPerformance({ leads }: CloserPerformanceProps) {
  const chartData = useMemo(() => {
    console.log('📊 [CLOSER PERFORMANCE] Processando performance dos closers');
    
    const validLeads = getLeadsExcludingMentorados(leads);
    const closerStats: Record<string, { apresentacoes: number; fechamentos: number; receita: number }> = {};
    
    validLeads.forEach(lead => {
      const closer = lead.Closer || 'Sem Closer';
      
      if (!closerStats[closer]) {
        closerStats[closer] = { apresentacoes: 0, fechamentos: 0, receita: 0 };
      }
      
      // Contar apresentações (leads que foram efetivamente atendidos)
      if (['Fechou', 'Não Fechou', 'Aguardando resposta'].includes(lead.Status || '')) {
        closerStats[closer].apresentacoes++;
        
        // Contar fechamentos
        if (lead.Status === 'Fechou') {
          closerStats[closer].fechamentos++;
          closerStats[closer].receita += (lead['Venda Completa'] || 0) + (lead.recorrente || 0);
        }
      }
    });

    return Object.entries(closerStats)
      .map(([closer, stats]) => ({
        closer: closer.length > 15 ? closer.substring(0, 15) + '...' : closer,
        apresentacoes: stats.apresentacoes,
        fechamentos: stats.fechamentos,
        conversao: stats.apresentacoes > 0 ? Number(((stats.fechamentos / stats.apresentacoes) * 100).toFixed(1)) : 0,
        receita: stats.receita,
        ticketMedio: stats.fechamentos > 0 ? Math.round(stats.receita / stats.fechamentos) : 0
      }))
      .sort((a, b) => b.conversao - a.conversao)
      .slice(0, 8);
  }, [leads]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl">
          <p className="text-gray-200 font-medium mb-2">{`Closer: ${label}`}</p>
          <p className="text-blue-400 text-sm">
            {`Apresentações: ${data.apresentacoes}`}
          </p>
          <p className="text-green-400 text-sm">
            {`Fechamentos: ${data.fechamentos}`}
          </p>
          <p className="text-yellow-400 text-sm">
            {`Taxa de Conversão: ${data.conversao}%`}
          </p>
          <p className="text-purple-400 text-sm">
            {`Receita: R$ ${data.receita.toLocaleString()}`}
          </p>
          <p className="text-cyan-400 text-sm">
            {`Ticket Médio: R$ ${data.ticketMedio.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const totalMetrics = useMemo(() => {
    const validLeads = getLeadsExcludingMentorados(leads);
    return calculateStandardizedMetrics(validLeads);
  }, [leads]);

  return (
    <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-100">
          Performance dos Closers
        </CardTitle>
        <p className="text-sm text-gray-400">
          Ranking por taxa de conversão • {totalMetrics.apresentacoes} apresentações • {totalMetrics.fechados} fechamentos
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="closer" 
              stroke="#9ca3af" 
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis stroke="#9ca3af" fontSize={12} tick={{ fill: '#9ca3af' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                color: '#d1d5db'
              }}
            />
            <Bar 
              dataKey="apresentacoes" 
              fill="#60a5fa" 
              name="Apresentações"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="fechamentos" 
              fill="#34d399" 
              name="Fechamentos"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
