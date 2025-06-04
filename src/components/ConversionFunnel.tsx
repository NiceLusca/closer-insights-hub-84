
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

        {/* Métricas Resumo */}
        <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
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
