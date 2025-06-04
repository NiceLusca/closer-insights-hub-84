
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateStandardizedMetrics } from "@/utils/metricsDefinitions";
import type { Lead } from "@/types/lead";

interface ConversionFunnelProps {
  leads: Lead[];
}

export const ConversionFunnel = React.memo(({ leads }: ConversionFunnelProps) => {
  const metrics = useMemo(() => {
    console.log('🔄 [FUNNEL] Calculando métricas para', leads.length, 'leads');
    return calculateStandardizedMetrics(leads);
  }, [leads]);

  const funnelSteps = [
    {
      label: "Total de Leads",
      value: metrics.totalLeads,
      percentage: 100,
      color: "bg-blue-500",
      description: "Leads válidos no período (excl. Mentorados)"
    },
    {
      label: "Compareceram",
      value: metrics.apresentacoes,
      percentage: metrics.taxaComparecimento,
      color: "bg-green-500",
      description: `${metrics.taxaComparecimento.toFixed(1)}% dos leads compareceram`
    },
    {
      label: "Fecharam",
      value: metrics.fechados,
      percentage: metrics.taxaFechamento,
      color: "bg-emerald-500",
      description: `${metrics.taxaFechamento.toFixed(1)}% dos que compareceram fecharam`
    }
  ];

  // Nova análise de perdas focada nos dois grupos
  const perdas = [
    {
      label: "Atendido, mas Não Fechou",
      value: metrics.atendidoNaoFechou,
      percentage: metrics.totalLeads > 0 ? (metrics.atendidoNaoFechou / metrics.totalLeads) * 100 : 0,
      description: "Leads que foram atendidos mas não converteram",
      color: "bg-yellow-600",
      icon: "⚠️"
    },
    {
      label: "Perdido ou Inativo",
      value: metrics.perdidoInativo,
      percentage: metrics.totalLeads > 0 ? (metrics.perdidoInativo / metrics.totalLeads) * 100 : 0,
      description: "Leads que se perderam no processo",
      color: "bg-red-600",
      icon: "❌"
    }
  ];

  const totalPerdas = metrics.atendidoNaoFechou + metrics.perdidoInativo;
  const percentualTotalPerdas = metrics.totalLeads > 0 ? (totalPerdas / metrics.totalLeads) * 100 : 0;

  return (
    <Card className="mb-8 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100">
          Funil de Conversão
        </CardTitle>
        <p className="text-sm text-gray-400">
          Análise do processo de conversão de leads
        </p>
      </CardHeader>
      <CardContent>
        {/* Funil Visual */}
        <div className="space-y-4 mb-6">
          {funnelSteps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-200">{step.label}</span>
                <span className="text-sm text-gray-400">{step.description}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-8 relative overflow-hidden">
                <div
                  className={`h-full ${step.color} rounded-full transition-all duration-500 flex items-center justify-center`}
                  style={{ width: `${step.percentage}%` }}
                >
                  <span className="text-white font-bold text-sm">
                    {step.value} ({step.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nova Análise de Perdas - Detalhada e em Percentual */}
        <div className="border-t border-gray-700/50 pt-6">
          <h4 className="text-md font-semibold text-gray-200 mb-4">Análise Detalhada de Perdas</h4>
          
          {/* Cards dos dois grupos de perdas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {perdas.map((perda, index) => (
              <div key={index} className={`${perda.color} p-4 rounded-lg border border-gray-600/50`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{perda.icon}</span>
                  <div className="flex-1">
                    <span className="text-white font-semibold text-sm block">
                      {perda.label.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{perda.value}</p>
                  <p className="text-xl font-bold text-gray-100">
                    {perda.percentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-200 mt-1">
                    {perda.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Resumo Total das Perdas */}
          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/50">
            <div className="text-center">
              <h5 className="text-sm font-semibold text-gray-300 mb-2">Total de Perdas</h5>
              <p className="text-2xl font-bold text-red-400">{totalPerdas} leads</p>
              <p className="text-lg font-bold text-red-300">{percentualTotalPerdas.toFixed(1)}% do total</p>
              <p className="text-xs text-gray-400 mt-1">
                Soma dos leads que foram atendidos mas não fecharam + perdidos/inativos
              </p>
            </div>
          </div>
        </div>

        {/* Métricas Resumo */}
        <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
            <div>
              <p className="text-gray-400">A Ser Atendido</p>
              <p className="text-white font-bold text-lg">
                {metrics.aSerAtendido}
              </p>
              <p className="text-xs text-gray-400">
                {metrics.totalLeads > 0 ? ((metrics.aSerAtendido / metrics.totalLeads) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div>
              <p className="text-gray-400">Aproveitamento Geral</p>
              <p className="text-white font-bold text-lg">
                {metrics.aproveitamentoGeral.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-gray-400">Receita Total</p>
              <p className="text-white font-bold text-lg">
                R$ {(metrics.receitaTotal / 1000).toFixed(0)}k
              </p>
            </div>
            <div>
              <p className="text-gray-400">Ticket Médio</p>
              <p className="text-white font-bold text-lg">
                R$ {metrics.ticketMedio.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ConversionFunnel.displayName = 'ConversionFunnel';
