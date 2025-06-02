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
      
      console.log(`👤 [${closerName}] Após filtragem: ${metrics.totalLeads} leads válidos, ${metrics.fechados} fechados`);
      console.log(`👤 [${closerName}] Aproveitamento: ${metrics.aproveitamentoGeral.toFixed(1)}%`);
      
      return {
        closer: closerName,
        totalLeads: metrics.totalLeads,
        agendamentos: metrics.aSerAtendido,
        apresentacoes: metrics.apresentacoes,
        fechamentos: metrics.fechados,
        receita: metrics.receitaTotal,
        taxaAgendamento: metrics.totalLeads > 0 ? (metrics.aSerAtendido / metrics.totalLeads) * 100 : 0,
        taxaFechamento: metrics.taxaFechamento, // Usar taxa padronizada
        aproveitamento: metrics.aproveitamentoGeral, // Usar aproveitamento padronizado
        receitaMedia: metrics.fechados > 0 ? metrics.receitaTotal / metrics.fechados : 0,
        rank: 0
      };
    }).filter(closer => closer.totalLeads > 0); // Filtrar closers sem leads válidos

    // Ordenar por aproveitamento geral (fechados / total)
    closerMetrics.sort((a, b) => b.aproveitamento - a.aproveitamento);
    closerMetrics.forEach((closer, index) => {
      closer.rank = index + 1;
    });

    // Validação cruzada: verificar se a soma dos leads válidos por closer = total de leads válidos geral
    const totalLeadsValidosPorCloser = closerMetrics.reduce((sum, closer) => sum + closer.totalLeads, 0);
    const metricsGerais = calculateStandardizedMetrics(leads);
    
    console.log('🔍 [VALIDAÇÃO CRUZADA] Verificando consistência na análise:');
    console.log(`  📊 Total leads válidos (soma closers): ${totalLeadsValidosPorCloser}`);
    console.log(`  📊 Total leads válidos (geral): ${metricsGerais.totalLeads}`);
    console.log(`  📊 Fechados (soma closers): ${closerMetrics.reduce((sum, c) => sum + c.fechamentos, 0)}`);
    console.log(`  📊 Fechados (geral): ${metricsGerais.fechados}`);
    
    if (totalLeadsValidosPorCloser !== metricsGerais.totalLeads) {
      console.warn('⚠️ [INCONSISTÊNCIA] Soma dos leads por closer ≠ total geral na análise!');
    }

    console.log('🎯 [CLOSER ANALYSIS] Processados', closerMetrics.length, 'closers com base consistente');
    return closerMetrics;
  }, [leads]);

  const chartData = useMemo(() => {
    return closerData.slice(0, 10).map(closer => ({
      closer: closer.closer.length > 12 ? closer.closer.substring(0, 12) + '...' : closer.closer,
      totalLeads: closer.totalLeads,
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
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl z-[10000]">
            <p className="text-gray-200 font-medium mb-2">{closerFullData.closer}</p>
            <div className="space-y-1 text-xs">
              <p className="text-blue-400">Total de Leads: {closerFullData.totalLeads}</p>
              <p className="text-green-400">Fechamentos: {closerFullData.fechamentos}</p>
              <p className="text-purple-400">Aproveitamento: {closerFullData.aproveitamento.toFixed(1)}%</p>
              <p className="text-yellow-400">Taxa Fechamento: {closerFullData.taxaFechamento.toFixed(1)}%</p>
              <p className="text-cyan-400">Receita: {formatCurrency(closerFullData.receita)}</p>
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
            (base de cálculo consistente com métricas gerais)
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
          <h4 className="text-sm font-medium text-gray-200 mb-4">Top 10 Closers por Aproveitamento Geral</h4>
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
                dataKey="totalLeads" 
                fill="#60a5fa" 
                name="Total de Leads"
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
