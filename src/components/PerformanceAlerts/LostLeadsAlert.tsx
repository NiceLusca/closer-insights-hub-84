
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
  
  console.log('🚨 [LOST LEADS] Usando métricas padronizadas:', {
    totalLeads: metrics.totalLeads,
    perdidoInativo: metrics.perdidoInativo,
    taxaDesmarque: metrics.taxaDesmarque.toFixed(1),
    mentoradosExcluidos: metrics.mentorados
  });

  // Usar a taxa de desmarque padronizada (deve ser ~21,0%)
  const taxaDesmarque = metrics.taxaDesmarque;

  // Só mostrar se taxa de desmarque for realmente alta (>25%)
  if (taxaDesmarque <= 25) {
    return null;
  }

  const alertType = taxaDesmarque > 40 ? 'danger' : 'warning';

  return (
    <Alert className={`${getAlertStyles(alertType)} border-l-4 mb-4`}>
      <UserX className={`h-4 w-4 ${getIconColor(alertType)}`} />
      <AlertDescription>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-medium text-white text-sm mb-1">
              Alto índice de leads perdidos
            </p>
            <p className="text-xs text-gray-300">
              {metrics.perdidoInativo} leads perdidos ({taxaDesmarque.toFixed(1)}% do total válido). 
              Revisar processo de acompanhamento.
            </p>
          </div>
          <div className="ml-3 text-right">
            <p className={`font-bold text-sm ${getIconColor(alertType)}`}>
              {taxaDesmarque.toFixed(1)}%
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
});

LostLeadsAlert.displayName = 'LostLeadsAlert';
