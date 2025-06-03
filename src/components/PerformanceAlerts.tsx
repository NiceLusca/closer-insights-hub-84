
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Target, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { generateConversionAlerts, generateNoShowAlerts, getAlertStyles, getIconColor } from "./PerformanceAlerts/AlertTypes";
import { LostLeadsAlert } from "./PerformanceAlerts/LostLeadsAlert";
import { calculateStandardizedMetrics } from "@/utils/metricsDefinitions";
import { validateStatusClassification } from "@/utils/statusClassification";
import type { Lead } from "@/types/lead";
import type { AlertItem } from "./PerformanceAlerts/AlertTypes";

interface PerformanceAlertsProps {
  leads: Lead[];
  position?: 'top' | 'bottom';
  showTitle?: boolean;
}

const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

export const PerformanceAlerts = React.memo(({ 
  leads, 
  position = 'bottom',
  showTitle = true 
}: PerformanceAlertsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { alerts, criticalCount } = useMemo(() => {
    console.log('🚨 [ALERTAS] Calculando alertas com métricas padronizadas');
    
    // Validar classificação de status primeiro
    const validation = validateStatusClassification(leads);
    if (validation.unmappedStatus.length > 0) {
      console.warn('⚠️ [ALERTAS] Status não mapeados detectados:', validation.unmappedStatus);
    }
    
    const metrics = calculateStandardizedMetrics(leads);
    const alertsList: AlertItem[] = [];

    if (metrics.totalLeads === 0) {
      return { alerts: alertsList, criticalCount: 0 };
    }

    console.log('🚨 [ALERTAS] Base de cálculo:', {
      totalLeads: metrics.totalLeads,
      fechados: metrics.fechados,
      perdidoInativo: metrics.perdidoInativo,
      taxaFechamento: metrics.taxaFechamento,
      taxaDesmarque: metrics.taxaDesmarque
    });

    // Gerar alertas usando métricas padronizadas
    alertsList.push(...generateConversionAlerts(leads));
    alertsList.push(...generateNoShowAlerts(leads));

    // Análise de Leads Estagnados usando métricas padronizadas
    if (metrics.aSerAtendido > metrics.totalLeads * 0.3) {
      alertsList.push({
        id: 'stagnant-leads',
        type: 'warning',
        icon: Target,
        title: 'Muitos leads a ser atendido',
        description: `${metrics.aSerAtendido} leads (${((metrics.aSerAtendido/metrics.totalLeads)*100).toFixed(1)}%) ainda aguardando atendimento.`,
        metric: `${metrics.aSerAtendido} leads`,
        priority: 6
      });
    }

    // Alerta de Taxa de Desmarque Alta (usando definição padronizada)
    if (metrics.taxaDesmarque > 30) {
      alertsList.push({
        id: 'high-no-show',
        type: metrics.taxaDesmarque > 40 ? 'danger' : 'warning',
        icon: AlertTriangle,
        title: 'Taxa de perda alta',
        description: `${formatPercentage(metrics.taxaDesmarque)} dos leads estão sendo perdidos (não comparecem, desmarcam, etc.).`,
        metric: `${formatPercentage(metrics.taxaDesmarque)}`,
        priority: metrics.taxaDesmarque > 40 ? 8 : 6
      });
    }

    // Alerta de Taxa de Fechamento Baixa
    if (metrics.taxaFechamento < 20 && metrics.apresentacoes > 5) {
      alertsList.push({
        id: 'low-closing-rate',
        type: 'danger',
        icon: Target,
        title: 'Taxa de fechamento baixa',
        description: `Apenas ${formatPercentage(metrics.taxaFechamento)} das apresentações estão fechando.`,
        metric: `${formatPercentage(metrics.taxaFechamento)}`,
        priority: 9
      });
    }

    const sortedAlerts = alertsList.sort((a, b) => b.priority - a.priority);
    const criticalCount = sortedAlerts.filter(alert => alert.type === 'danger').length;

    console.log(`🚨 [ALERTAS] ${alertsList.length} alertas gerados (${criticalCount} críticos)`);
    return { alerts: sortedAlerts, criticalCount };
  }, [leads]);

  // Não renderizar se não há alertas significativos
  if (alerts.length === 0) {
    return (
      <div className="mb-4">
        <LostLeadsAlert leads={leads} />
      </div>
    );
  }

  // Mostrar apenas alertas críticos por padrão
  const displayAlerts = isExpanded ? alerts : alerts.filter(alert => alert.type === 'danger');

  return (
    <div className={position === 'bottom' ? 'mt-6' : 'mb-6'}>
      <LostLeadsAlert leads={leads} />
      
      {displayAlerts.length > 0 && (
        <Card className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-400" />
                <CardTitle className="text-sm font-medium text-gray-200">
                  Alertas de Performance
                </CardTitle>
                {criticalCount > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                    <span className="text-xs text-red-400 font-medium">
                      {criticalCount} crítico{criticalCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
              
              {alerts.length > displayAlerts.length && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-400 hover:text-gray-200 text-xs h-6 px-2"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 mr-1" />
                      +{alerts.length - displayAlerts.length}
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-2">
              {displayAlerts.map((alert) => {
                const Icon = alert.icon;
                return (
                  <Alert 
                    key={alert.id} 
                    className={`${getAlertStyles(alert.type)} border-l-4 py-2`}
                  >
                    <Icon className={`h-4 w-4 ${getIconColor(alert.type)}`} />
                    <AlertDescription>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-white text-sm mb-1">{alert.title}</p>
                          <p className="text-xs text-gray-300">{alert.description}</p>
                        </div>
                        {alert.metric && (
                          <div className="ml-3 text-right">
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
      )}
    </div>
  );
});

PerformanceAlerts.displayName = 'PerformanceAlerts';
