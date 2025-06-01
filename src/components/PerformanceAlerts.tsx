
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingDown, TrendingUp, Target, Zap, Users } from "lucide-react";
import type { Lead } from "@/types/lead";

interface PerformanceAlertsProps {
  leads: Lead[];
}

interface AlertItem {
  id: string;
  type: 'warning' | 'danger' | 'success' | 'info';
  icon: React.ElementType;
  title: string;
  description: string;
  metric?: string;
  priority: number;
}

export const PerformanceAlerts = React.memo(({ leads }: PerformanceAlertsProps) => {
  const alerts = useMemo(() => {
    const validLeads = leads.filter(lead => lead.Status !== 'Mentorado');
    const alertsList: AlertItem[] = [];

    if (validLeads.length === 0) {
      alertsList.push({
        id: 'no-data',
        type: 'info',
        icon: Users,
        title: 'Nenhum dado disponível',
        description: 'Não há leads suficientes para análise de alertas.',
        priority: 1
      });
      return alertsList;
    }

    // 1. Análise de Conversão Geral
    const totalLeads = validLeads.length;
    const fechamentos = validLeads.filter(lead => lead.Status === 'Fechou').length;
    const taxaConversaoGeral = (fechamentos / totalLeads) * 100;

    if (taxaConversaoGeral < 10) {
      alertsList.push({
        id: 'low-conversion',
        type: 'danger',
        icon: AlertTriangle,
        title: 'Taxa de conversão muito baixa',
        description: `Apenas ${taxaConversaoGeral.toFixed(1)}% dos leads estão fechando. Revisar processo de vendas.`,
        metric: `${taxaConversaoGeral.toFixed(1)}%`,
        priority: 10
      });
    } else if (taxaConversaoGeral > 25) {
      alertsList.push({
        id: 'high-conversion',
        type: 'success',
        icon: TrendingUp,
        title: 'Excelente performance de conversão',
        description: `Taxa de ${taxaConversaoGeral.toFixed(1)}% está acima da média. Parabéns!`,
        metric: `${taxaConversaoGeral.toFixed(1)}%`,
        priority: 2
      });
    }

    // 2. Análise de No-Show
    const apresentacoes = validLeads.filter(lead => 
      ['Fechou', 'Não Apareceu', 'Não Fechou'].includes(lead.Status || '')
    ).length;
    const noShows = validLeads.filter(lead => lead.Status === 'Não Apareceu').length;
    const taxaNoShow = apresentacoes > 0 ? (noShows / apresentacoes) * 100 : 0;

    if (taxaNoShow > 30) {
      alertsList.push({
        id: 'high-noshow',
        type: 'warning',
        icon: AlertTriangle,
        title: 'Alto índice de faltas',
        description: `${taxaNoShow.toFixed(1)}% dos agendados não compareceram. Melhorar confirmação.`,
        metric: `${taxaNoShow.toFixed(1)}%`,
        priority: 8
      });
    }

    // 3. Análise por Closer - Identificar underperformers
    const closerStats = validLeads.reduce((acc, lead) => {
      if (!lead.Closer || lead.Closer.trim() === '') return acc;
      
      const closerName = lead.Closer.trim();
      if (!acc[closerName]) {
        acc[closerName] = { total: 0, fechamentos: 0 };
      }
      acc[closerName].total++;
      if (lead.Status === 'Fechou') {
        acc[closerName].fechamentos++;
      }
      return acc;
    }, {} as Record<string, { total: number; fechamentos: number }>);

    const closersComDados = Object.entries(closerStats)
      .filter(([_, stats]) => stats.total >= 5) // Mínimo 5 leads para análise
      .map(([closer, stats]) => ({
        closer,
        taxa: (stats.fechamentos / stats.total) * 100,
        total: stats.total,
        fechamentos: stats.fechamentos
      }));

    if (closersComDados.length > 0) {
      const mediaClosers = closersComDados.reduce((sum, c) => sum + c.taxa, 0) / closersComDados.length;
      
      // Closers com performance muito abaixo da média
      const underperformers = closersComDados.filter(c => c.taxa < mediaClosers * 0.5);
      if (underperformers.length > 0) {
        alertsList.push({
          id: 'underperforming-closers',
          type: 'warning',
          icon: TrendingDown,
          title: 'Closers com baixa performance',
          description: `${underperformers.length} closer(s) com taxa muito abaixo da média (${mediaClosers.toFixed(1)}%).`,
          metric: underperformers.map(c => c.closer).join(', '),
          priority: 7
        });
      }

      // Top performer
      const topPerformer = closersComDados.reduce((best, current) => 
        current.taxa > best.taxa ? current : best
      );
      if (topPerformer.taxa > 20) {
        alertsList.push({
          id: 'top-performer',
          type: 'success',
          icon: Target,
          title: 'Destaque em performance',
          description: `${topPerformer.closer} está com ${topPerformer.taxa.toFixed(1)}% de aproveitamento.`,
          metric: `${topPerformer.taxa.toFixed(1)}%`,
          priority: 3
        });
      }
    }

    // 4. Análise de Origem - Identificar campanhas problemáticas
    const origemStats = validLeads.reduce((acc, lead) => {
      const origem = lead.origem || 'Desconhecida';
      if (!acc[origem]) {
        acc[origem] = { total: 0, fechamentos: 0 };
      }
      acc[origem].total++;
      if (lead.Status === 'Fechou') {
        acc[origem].fechamentos++;
      }
      return acc;
    }, {} as Record<string, { total: number; fechamentos: number }>);

    const origensComDados = Object.entries(origemStats)
      .filter(([_, stats]) => stats.total >= 10) // Mínimo 10 leads para análise
      .map(([origem, stats]) => ({
        origem,
        taxa: (stats.fechamentos / stats.total) * 100,
        total: stats.total
      }));

    if (origensComDados.length > 0) {
      const origemProblematica = origensComDados.find(o => o.taxa < 5);
      if (origemProblematica) {
        alertsList.push({
          id: 'problematic-origin',
          type: 'danger',
          icon: AlertTriangle,
          title: 'Origem com baixíssima conversão',
          description: `"${origemProblematica.origem}" tem apenas ${origemProblematica.taxa.toFixed(1)}% de conversão.`,
          metric: `${origemProblematica.taxa.toFixed(1)}%`,
          priority: 9
        });
      }

      const melhorOrigem = origensComDados.reduce((best, current) => 
        current.taxa > best.taxa ? current : best
      );
      if (melhorOrigem.taxa > 15) {
        alertsList.push({
          id: 'best-origin',
          type: 'success',
          icon: Zap,
          title: 'Campanha de alta performance',
          description: `"${melhorOrigem.origem}" está convertendo ${melhorOrigem.taxa.toFixed(1)}%.`,
          metric: `${melhorOrigem.taxa.toFixed(1)}%`,
          priority: 4
        });
      }
    }

    // 5. Análise de Leads Estagnados
    const aguardandoResposta = validLeads.filter(lead => lead.Status === 'Aguardando resposta').length;
    if (aguardandoResposta > totalLeads * 0.3) {
      alertsList.push({
        id: 'stagnant-leads',
        type: 'warning',
        icon: AlertTriangle,
        title: 'Muitos leads aguardando resposta',
        description: `${aguardandoResposta} leads (${((aguardandoResposta/totalLeads)*100).toFixed(1)}%) sem definição.`,
        metric: `${aguardandoResposta} leads`,
        priority: 6
      });
    }

    // Ordenar por prioridade (maior = mais importante)
    return alertsList.sort((a, b) => b.priority - a.priority);
  }, [leads]);

  const getAlertStyles = (type: AlertItem['type']) => {
    switch (type) {
      case 'danger':
        return 'border-red-500/50 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'success':
        return 'border-green-500/50 bg-green-500/10';
      case 'info':
      default:
        return 'border-blue-500/50 bg-blue-500/10';
    }
  };

  const getIconColor = (type: AlertItem['type']) => {
    switch (type) {
      case 'danger':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'success':
        return 'text-green-400';
      case 'info':
      default:
        return 'text-blue-400';
    }
  };

  if (alerts.length === 0) {
    return (
      <Card className="mb-8 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Alertas de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum alerta no momento</p>
            <p className="text-sm text-gray-500">Sistema monitorando performance...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Alertas de Performance
          <span className="text-sm font-normal text-gray-400">
            ({alerts.length} alerta{alerts.length !== 1 ? 's' : ''})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <Alert 
                key={alert.id} 
                className={`${getAlertStyles(alert.type)} border`}
              >
                <Icon className={`h-4 w-4 ${getIconColor(alert.type)}`} />
                <AlertDescription>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-white mb-1">{alert.title}</p>
                      <p className="text-sm text-gray-300">{alert.description}</p>
                    </div>
                    {alert.metric && (
                      <div className="ml-4 text-right">
                        <p className={`font-bold text-sm ${getIconColor(alert.type)}`}>
                          {alert.metric}
                        </p>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

PerformanceAlerts.displayName = 'PerformanceAlerts';
