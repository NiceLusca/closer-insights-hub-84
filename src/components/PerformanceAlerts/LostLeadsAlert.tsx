
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserX, AlertTriangle } from "lucide-react";
import { getAlertStyles, getIconColor } from "./AlertTypes";
import type { Lead } from "@/types/lead";

interface LostLeadsAlertProps {
  leads: Lead[];
}

export const LostLeadsAlert = React.memo(({ leads }: LostLeadsAlertProps) => {
  const validLeads = leads.filter(lead => lead.Status !== 'Mentorado');
  const totalLeads = validLeads.length;
  
  const perdidoInativo = validLeads.filter(lead => 
    ['Não Apareceu', 'Desmarcou', 'Não Atendeu'].includes(lead.Status || '')
  ).length;
  
  const taxaPerdaGeral = totalLeads > 0 ? (perdidoInativo / totalLeads) * 100 : 0;

  // Só mostrar se taxa de perda for alta (>20%)
  if (taxaPerdaGeral <= 20) {
    return null;
  }

  const alertType = taxaPerdaGeral > 40 ? 'danger' : 'warning';

  return (
    <Alert className={`${getAlertStyles(alertType)} border mb-4`}>
      <UserX className={`h-4 w-4 ${getIconColor(alertType)}`} />
      <AlertDescription>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-medium text-white mb-1">
              Alto índice de leads perdidos
            </p>
            <p className="text-sm text-gray-300">
              {perdidoInativo} leads perdidos ({taxaPerdaGeral.toFixed(1)}% do total). 
              Revisar processo de acompanhamento e confirmação.
            </p>
          </div>
          <div className="ml-4 text-right">
            <p className={`font-bold text-sm ${getIconColor(alertType)}`}>
              {taxaPerdaGeral.toFixed(1)}%
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
});

LostLeadsAlert.displayName = 'LostLeadsAlert';
