
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserX } from "lucide-react";
import { getAlertStyles, getIconColor } from "./AlertTypes";
import { calculateStandardizedMetrics } from "@/utils/metricsDefinitions";
import type { Lead } from "@/types/lead";

interface LostLeadsAlertProps {
  leads: Lead[];
}

export const LostLeadsAlert = React.memo(({ leads }: LostLeadsAlertProps) => {
  // Usar métricas padronizadas para garantir consistência
  const metrics = calculateStandardizedMetrics(leads);
  
  // CORREÇÃO FINAL: Calcular corretamente a não conversão
  const leadsNaoConvertidos = metrics.perdidoInativo + metrics.atendidoNaoFechou;
  const taxaNaoConversao = metrics.totalLeads > 0 ? (leadsNaoConvertidos / metrics.totalLeads) * 100 : 0;
  
  console.log('🚨 [LOST LEADS] Cálculo FINAL corrigido:', {
    totalLeads: metrics.totalLeads,
    perdidoInativo: metrics.perdidoInativo,
    atendidoNaoFechou: metrics.atendidoNaoFechou,
    leadsNaoConvertidos,
    taxaNaoConversao: taxaNaoConversao.toFixed(1),
    verificacao: `${leadsNaoConvertidos}/${metrics.totalLeads} = ${taxaNaoConversao.toFixed(1)}%`
  });

  // Só mostrar se taxa de não conversão for realmente alta (>60%)
  if (taxaNaoConversao <= 60) {
    return null;
  }

  const alertType = taxaNaoConversao > 75 ? 'danger' : 'warning';

  return (
    <Alert className={`${getAlertStyles(alertType)} border-l-4 mb-4`}>
      <UserX className={`h-4 w-4 ${getIconColor(alertType)}`} />
      <AlertDescription>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-medium text-white text-sm mb-1">
              Alta taxa de não conversão
            </p>
            <p className="text-xs text-gray-300">
              {leadsNaoConvertidos} leads não converteram ({metrics.perdidoInativo} perdidos + {metrics.atendidoNaoFechou} não fecharam) 
              = {taxaNaoConversao.toFixed(1)}% de {metrics.totalLeads} leads válidos. Revisar estratégia de conversão.
            </p>
          </div>
          <div className="ml-3 text-right">
            <p className={`font-bold text-sm ${getIconColor(alertType)}`}>
              {taxaNaoConversao.toFixed(1)}%
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
});

LostLeadsAlert.displayName = 'LostLeadsAlert';
