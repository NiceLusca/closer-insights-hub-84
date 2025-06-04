
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users } from "lucide-react";
import { CloserMetricsCards } from "./CloserPerformance/CloserMetrics";
import { CloserRanking } from "./CloserPerformance/CloserRanking";
import { calculateStandardizedMetrics } from "@/utils/metricsDefinitions";
import type { Lead } from "@/types/lead";

interface CloserPerformanceAnalysisProps {
  leads: Lead[];
}

interface CloserMetrics {
  closer: string;
  totalLeads: number;
  agendamentos: number;
  apresentacoes: number;
  fechamentos: number;
  receita: number;
  taxaAgendamento: number;
  taxaFechamento: number;
  aproveitamento: number;
  receitaMedia: number;
  rank: number;
}

export const CloserPerformanceAnalysis = React.memo(({ leads }: CloserPerformanceAnalysisProps) => {
  const closerData = useMemo(() => {
    console.log('🎯 [CLOSER ANALYSIS] Processando', leads.length, 'leads BRUTOS (com mentorados)');
    
    // Agrupar leads por closer ANTES de qualquer filtragem
    const closerGroups = leads.reduce((acc, lead) => {
      const closerName = lead.Closer?.trim() || 'Sem Closer';
      if (closerName && closerName !== '') {
        if (!acc[closerName]) {
          acc[closerName] = [];
        }
        acc[closerName].push(lead);
      }
      return acc;
    }, {} as Record<string, Lead[]>);

    console.log('🎯 [CLOSER ANALYSIS] Closers encontrados:', Object.keys(closerGroups).length);

    const closerMetrics: CloserMetrics[] = Object.entries(closerGroups).map(([closerName, closerLeads]) => {
      console.log(`👤 [${closerName}] Processando ${closerLeads.length} leads brutos`);
      
      // Usar métricas padronizadas (que já filtra mentorados internamente)
      const metrics = calculateStandardizedMetrics(closerLeads);
      
      // CORREÇÃO: Aproveitamento agora é fechados/apresentações
      const aproveitamento = metrics.apresentacoes > 0 ? (metrics.fechados / metrics.apresentacoes) * 100 : 0;
      
      console.log(`👤 [${closerName}] Após filtragem: ${metrics.totalLeads} leads válidos, ${metrics.fechados} fechados de ${metrics.apresentacoes} apresentações`);
      console.log(`👤 [${closerName}] Aproveitamento CORRIGIDO: ${aproveitamento.toFixed(1)}% (${metrics.fechados}/${metrics.apresentacoes})`);
      
      return {
        closer: closerName,
        totalLeads: metrics.totalLeads,
        agendamentos: metrics.aSerAtendido,
        apresentacoes: metrics.apresentacoes,
        fechamentos: metrics.fechados,
        receita: metrics.receitaTotal,
        taxaAgendamento: metrics.totalLeads > 0 ? (metrics.aSerAtendido / metrics.totalLeads) * 100 : 0,
        taxaFechamento: metrics.taxaFechamento, // Usar taxa padronizada (fechados/apresentações)
        aproveitamento: aproveitamento, // CORRIGIDO: fechados/apresentações
        receitaMedia: metrics.fechados > 0 ? metrics.receitaTotal / metrics.fechados : 0,
        rank: 0
      };
    }).filter(closer => closer.totalLeads > 0); // Filtrar closers sem leads válidos

    // Ordenar por aproveitamento (fechados/apresentações)
    closerMetrics.sort((a, b) => b.aproveitamento - a.aproveitamento);
    closerMetrics.forEach((closer, index) => {
      closer.rank = index + 1;
    });

    console.log('🎯 [CLOSER ANALYSIS] Processados', closerMetrics.length, 'closers com aproveitamento CORRIGIDO');
    return closerMetrics;
  }, [leads]);

  const chartData = useMemo(() => {
    return closerData.slice(0, 10).map(closer => ({
      closer: closer.closer.length > 12 ? closer.closer.substring(0, 12) + '...' : closer.closer,
      totalLeads: closer.totalLeads,
      apresentacoes: closer.apresentacoes,
      fechamentos: closer.fechamentos,
      aproveitamento: Number(closer.aproveitamento.toFixed(1))
    }));
  }, [closerData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = React.memo(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const closerFullData = closerData.find(c => 
        c.closer.startsWith(label.replace('...', ''))
      );
      
      if (closerFullData) {
        return (
          <div 
            className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl"
            style={{ 
              zIndex: 99999,
              position: 'relative',
              pointerEvents: 'none'
            }}
          >
            <p className="text-gray-200 font-medium mb-2">{closerFullData.closer}</p>
            <div className="space-y-1 text-xs">
              <p className="text-blue-400">Total de Leads: {closerFullData.totalLeads}</p>
              <p className="text-cyan-400">Apresentações: {closerFullData.apresentacoes}</p>
              <p className="text-green-400">Fechamentos: {closerFullData.fechamentos}</p>
              <p className="text-purple-400 font-bold">Aproveitamento: {closerFullData.aproveitamento.toFixed(1)}% (vendas/apresentações)</p>
              <p className="text-yellow-400">Receita: {formatCurrency(closerFullData.receita)}</p>
              <p className="text-gray-300">Receita Média: {formatCurrency(closerFullData.receitaMedia)}</p>
            </div>
          </div>
        );
      }
    }
    return null;
  });

  CustomTooltip.displayName = 'CustomTooltip';

  const topPerformer = closerData[0];
  const avgAproveitamento = closerData.length > 0 
    ? closerData.reduce((sum, closer) => sum + closer.aproveitamento, 0) / closerData.length 
    : 0;

  return (
    <Card className="mb-8 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Performance dos Closers
          <span className="text-sm font-normal text-gray-400">
            (aproveitamento = vendas/apresentações)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Estatísticas Resumo */}
        <CloserMetricsCards
          topPerformer={topPerformer}
          avgAproveitamento={avgAproveitamento}
          totalClosers={closerData.length}
          totalReceita={closerData.reduce((sum, c) => sum + c.receita, 0)}
        />

        {/* Gráfico de Performance */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-200 mb-4">Top 10 Closers por Aproveitamento (Vendas/Apresentações)</h4>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="closer" 
                stroke="#9ca3af"
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke="#9ca3af" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="apresentacoes" 
                fill="#60a5fa" 
                name="Apresentações"
                radius={[1, 1, 0, 0]}
              />
              <Bar 
                dataKey="fechamentos" 
                fill="#34d399" 
                name="Fechamentos"
                radius={[1, 1, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ranking Detalhado */}
        <CloserRanking closerData={closerData} />
      </CardContent>
    </Card>
  );
});

CloserPerformanceAnalysis.displayName = 'CloserPerformanceAnalysis';
