
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Target } from "lucide-react";
import { generateConversionAlerts, generateNoShowAlerts, getAlertStyles, getIconColor } from "./PerformanceAlerts/AlertTypes";
import type { Lead } from "@/types/lead";
import type { AlertItem } from "./PerformanceAlerts/AlertTypes";

interface PerformanceAlertsProps {
  leads: Lead[];
}

export const PerformanceAlerts = React.memo(({ leads }: PerformanceAlertsProps) => {
  const alerts = useMemo(() => {
    const validLeads = leads.filter(lead => lead.Status !== 'Mentorado');
    const alertsList: AlertItem[] = [];

    if (validLeads.length === 0) {
      alertsList.push({
        id: 'no-data',
        type: 'info',
        icon: Target,
        title: 'Nenhum dado disponível',
        description: 'Não há leads suficientes para análise de alertas.',
        priority: 1
      });
      return alertsList;
    }

    // Gerar alertas por categoria
    alertsList.push(...generateConversionAlerts(validLeads));
    alertsList.push(...generateNoShowAlerts(validLeads));

    // Análise de Leads Estagnados
    const totalLeads = validLeads.length;
    const aguardandoResposta = validLeads.filter(lead => lead.Status === 'Aguardando resposta').length;
    if (aguardandoResposta > totalLeads * 0.3) {
      alertsList.push({
        id: 'stagnant-leads',
        type: 'warning',
        icon: Target,
        title: 'Muitos leads aguardando resposta',
        description: `${aguardandoResposta} leads (${((aguardandoResposta/totalLeads)*100).toFixed(1)}%) sem definição.`,
        metric: `${aguardandoResposta} leads`,
        priority: 6
      });
    }

    return alertsList.sort((a, b) => b.priority - a.priority);
  }, [leads]);

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
