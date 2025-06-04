
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, Users, Clock } from "lucide-react";
import { calculateStandardizedMetrics } from "@/utils/metricsDefinitions";
import type { Lead } from "@/types/lead";

interface PerformanceAlertsProps {
  leads: Lead[];
  position?: 'top' | 'bottom';
}

export function PerformanceAlerts({ leads, position = 'top' }: PerformanceAlertsProps) {
  const metrics = calculateStandardizedMetrics(leads);
  
  // Calcular taxa de não conversão total
  const taxaNaoConversao = metrics.totalLeads > 0 
    ? ((metrics.perdidoInativo + metrics.atendidoNaoFechou) / metrics.totalLeads) * 100 
    : 0;
  
  const alerts = [
    {
      id: 'low-conversion',
      show: metrics.taxaFechamento < 30,
      type: 'warning',
      icon: TrendingDown,
      title: 'Taxa de Fechamento Baixa',
      message: `Taxa atual: ${metrics.taxaFechamento.toFixed(1)}%. Recomendado: acima de 30%`,
      color: 'orange'
    },
    {
      id: 'high-loss',
      show: taxaNaoConversao > 50,
      type: 'error',
      icon: AlertTriangle,
      title: 'Alta Taxa de Não Conversão',
      message: `${taxaNaoConversao.toFixed(1)}% dos leads não converteram. Analise os motivos das perdas.`,
      color: 'red'
    },
    {
      id: 'pending-leads',
      show: metrics.aSerAtendido > (metrics.totalLeads * 0.3),
      type: 'info',
      icon: Clock,
      title: 'Muitos Leads Pendentes',
      message: `${((metrics.aSerAtendido / metrics.totalLeads) * 100).toFixed(1)}% dos leads aguardam atendimento. Acelere o processo.`,
      color: 'blue'
    },
    {
      id: 'low-attendance',
      show: metrics.taxaComparecimento < 60,
      type: 'warning',
      icon: Users,
      title: 'Taxa de Comparecimento Baixa',
      message: `${metrics.taxaComparecimento.toFixed(1)}% de comparecimento. Melhore a qualificação dos leads.`,
      color: 'yellow'
    }
  ];

  const activeAlerts = alerts.filter(alert => alert.show);

  if (activeAlerts.length === 0) {
    return null;
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red':
        return 'border-red-500/50 bg-red-500/10 text-red-200';
      case 'orange':
        return 'border-orange-500/50 bg-orange-500/10 text-orange-200';
      case 'yellow':
        return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-200';
      case 'blue':
        return 'border-blue-500/50 bg-blue-500/10 text-blue-200';
      default:
        return 'border-gray-500/50 bg-gray-500/10 text-gray-200';
    }
  };

  return (
    <div className={`mb-6 ${position === 'bottom' ? 'mt-6' : ''}`}>
      <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Alertas de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeAlerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border ${getColorClasses(alert.color)}`}
                >
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">{alert.title}</h4>
                    <p className="text-sm opacity-90">{alert.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700/30">
            <p className="text-xs text-gray-400">
              💡 <strong>Dica:</strong> Use os filtros para analisar períodos específicos e identificar padrões de performance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
