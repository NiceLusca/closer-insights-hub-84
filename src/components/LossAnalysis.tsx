
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateStandardizedMetrics } from "@/utils/metricsDefinitions";
import { getLeadsExcludingMentorados } from "@/utils/statusClassification";
import { LossOverviewCards } from "./LossAnalysis/LossOverviewCards";
import { LossBehaviorChart } from "./LossAnalysis/LossBehaviorChart";
import { CloserLossChart } from "./LossAnalysis/CloserLossChart";
import { LossInsights } from "./LossAnalysis/LossInsights";
import type { Lead } from "@/types/lead";

interface LossAnalysisProps {
  leads: Lead[];
}

export const LossAnalysis = React.memo(({ leads }: LossAnalysisProps) => {
  const detailedAnalysis = useMemo(() => {
    console.log('🔍 [LOSS ANALYSIS] Calculando análise detalhada de perdas');
    
    const validLeads = getLeadsExcludingMentorados(leads);
    const metrics = calculateStandardizedMetrics(validLeads);
    
    // 1. Análise por Etapa do Funil
    const funnelLosses = [
      {
        etapa: "Não Compareceram",
        quantidade: validLeads.filter(l => ['Não Apareceu', 'Desmarcou'].includes(l.Status || '')).length,
        percentualDoTotal: 0,
        cor: "#f59e0b"
      },
      {
        etapa: "Compareceram mas Não Fecharam",
        quantidade: metrics.atendidoNaoFechou,
        percentualDoTotal: 0,
        cor: "#ef4444"
      },
      {
        etapa: "Perdidos/Inativos",
        quantidade: metrics.perdidoInativo,
        percentualDoTotal: 0,
        cor: "#6b7280"
      }
    ];

    // Calcular percentuais
    funnelLosses.forEach(item => {
      item.percentualDoTotal = metrics.totalLeads > 0 ? (item.quantidade / metrics.totalLeads) * 100 : 0;
    });

    // 2. Análise por Tipo de Comportamento
    const behaviorAnalysis = [
      {
        tipo: "Não Apareceu",
        quantidade: validLeads.filter(l => l.Status === 'Não Apareceu').length,
        percentual: 0,
        impactoFinanceiro: 0,
        cor: "#f59e0b"
      },
      {
        tipo: "Desmarcou",
        quantidade: validLeads.filter(l => l.Status === 'Desmarcou').length,
        percentual: 0,
        impactoFinanceiro: 0,
        cor: "#f97316"
      },
      {
        tipo: "Não Fechou após Atendimento",
        quantidade: validLeads.filter(l => l.Status === 'Não Fechou').length,
        percentual: 0,
        impactoFinanceiro: 0,
        cor: "#ef4444"
      },
      {
        tipo: "Aguardando Resposta",
        quantidade: validLeads.filter(l => l.Status === 'Aguardando resposta').length,
        percentual: 0,
        impactoFinanceiro: 0,
        cor: "#eab308"
      }
    ];

    // Calcular percentuais e impacto financeiro
    const ticketMedioEstimado = metrics.ticketMedio || 2500;
    behaviorAnalysis.forEach(item => {
      item.percentual = metrics.totalLeads > 0 ? (item.quantidade / metrics.totalLeads) * 100 : 0;
      item.impactoFinanceiro = item.quantidade * ticketMedioEstimado;
    });

    // 3. Análise de Eficiência por Closer
    const closerLossAnalysis: any[] = [];
    const closersStats: Record<string, any> = {};
    
    validLeads.forEach(lead => {
      const closer = lead.Closer || 'Sem Closer';
      if (!closersStats[closer]) {
        closersStats[closer] = {
          total: 0,
          apresentacoes: 0,
          fechamentos: 0,
          perdas: 0
        };
      }
      
      closersStats[closer].total++;
      
      if (['Fechou', 'Não Fechou', 'Aguardando resposta'].includes(lead.Status || '')) {
        closersStats[closer].apresentacoes++;
        if (lead.Status === 'Fechou') {
          closersStats[closer].fechamentos++;
        } else {
          closersStats[closer].perdas++;
        }
      }
    });

    Object.entries(closersStats).forEach(([closer, stats]) => {
      if (stats.apresentacoes > 0) {
        closerLossAnalysis.push({
          closer: closer.length > 12 ? closer.substring(0, 12) + '...' : closer,
          perdas: stats.perdas,
          apresentacoes: stats.apresentacoes,
          taxaPerda: (stats.perdas / stats.apresentacoes) * 100,
          eficiencia: (stats.fechamentos / stats.apresentacoes) * 100
        });
      }
    });

    return {
      funnelLosses: funnelLosses.filter(item => item.quantidade > 0),
      behaviorAnalysis: behaviorAnalysis.filter(item => item.quantidade > 0),
      closerLossAnalysis: closerLossAnalysis.sort((a, b) => b.taxaPerda - a.taxaPerda).slice(0, 6),
      totalPerdaFinanceira: behaviorAnalysis.reduce((acc, item) => acc + item.impactoFinanceiro, 0),
      metrics
    };
  }, [leads]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
          <p className="text-gray-200 font-medium mb-1">{data.tipo || data.etapa || data.closer}</p>
          <p className="text-blue-400 text-sm">Quantidade: {data.quantidade || data.perdas}</p>
          <p className="text-yellow-400 text-sm">
            Percentual: {(data.percentual || data.taxaPerda || data.percentualDoTotal || 0).toFixed(1)}%
          </p>
          {data.impactoFinanceiro && (
            <p className="text-red-400 text-sm">
              Impacto: R$ {data.impactoFinanceiro.toLocaleString()}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-8 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-100 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Análise Detalhada de Perdas
        </CardTitle>
        <p className="text-sm text-gray-400">
          Análise comportamental e financeira das perdas no processo comercial
        </p>
      </CardHeader>
      <CardContent>
        {/* 1. Resumo Executivo */}
        <LossOverviewCards
          funnelLosses={detailedAnalysis.funnelLosses}
          totalPerdaFinanceira={detailedAnalysis.totalPerdaFinanceira}
          totalLeads={detailedAnalysis.metrics.totalLeads}
        />

        {/* 2. Análise por Tipo de Comportamento */}
        <LossBehaviorChart
          behaviorAnalysis={detailedAnalysis.behaviorAnalysis}
          customTooltip={CustomTooltip}
        />

        {/* 3. Análise de Performance dos Closers */}
        <CloserLossChart
          closerLossAnalysis={detailedAnalysis.closerLossAnalysis}
          customTooltip={CustomTooltip}
        />

        {/* 4. Insights e Recomendações */}
        <LossInsights behaviorAnalysis={detailedAnalysis.behaviorAnalysis} />
      </CardContent>
    </Card>
  );
});

LossAnalysis.displayName = 'LossAnalysis';
