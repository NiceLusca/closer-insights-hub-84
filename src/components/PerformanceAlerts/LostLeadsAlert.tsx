
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserX } from "lucide-react";
import { getAlertStyles, getIconColor } from "./AlertTypes";
import { getLeadsByStatusGroup, classifyLeadByStatus } from "@/utils/statusClassification";
import type { Lead } from "@/types/lead";

interface LostLeadsAlertProps {
  leads: Lead[];
}

export const LostLeadsAlert = React.memo(({ leads }: LostLeadsAlertProps) => {
  // Usar classificação padronizada para consistência
  const statusGroups = getLeadsByStatusGroup(leads, true); // Excluir mentorados
  const totalValidLeads = Object.values(statusGroups).reduce((sum, group) => sum + group.length, 0) - statusGroups.mentorado.length;
  
  // Leads perdidos = grupo "perdidoInativo" da classificação padrão
  const leadsPeridos = statusGroups.perdidoInativo.length;
  const taxaPerdaGeral = totalValidLeads > 0 ? (leadsPeridos / totalValidLeads) * 100 : 0;

  // Debug da classificação para identificar discrepâncias
  console.log('🚨 [LOST LEADS DEBUG] Análise de leads perdidos:', {
    totalOriginal: leads.length,
    totalValidLeads,
    mentoradosExcluidos: statusGroups.mentorado.length,
    leadsPeridos,
    taxaPerdaCalculada: taxaPerdaGeral.toFixed(1),
    distribuicao: {
      fechados: statusGroups.fechado.length,
      aSerAtendido: statusGroups.aSerAtendido.length,
      atendidoNaoFechou: statusGroups.atendidoNaoFechou.length,
      perdidoInativo: statusGroups.perdidoInativo.length,
      mentorados: statusGroups.mentorado.length
    }
  });

  // Verificar se há status não mapeados
  const statusUnicos = [...new Set(leads.map(lead => lead.Status).filter(Boolean))];
  const statusNaoMapeados = statusUnicos.filter(status => {
    const classificacao = classifyLeadByStatus(status);
    return classificacao === 'aSerAtendido' && !['Agendado', 'Confirmado', 'Remarcou', 'DCAUSENTE'].includes(status);
  });

  if (statusNaoMapeados.length > 0) {
    console.warn('⚠️ [LOST LEADS] Status não mapeados encontrados:', statusNaoMapeados);
  }

  // Só mostrar se taxa de perda for realmente alta (>25%) baseada na classificação padrão
  if (taxaPerdaGeral <= 25) {
    return null;
  }

  const alertType = taxaPerdaGeral > 40 ? 'danger' : 'warning';

  // Detalhes dos status que compõem os perdidos
  const statusPerdidos = statusGroups.perdidoInativo.reduce((acc, lead) => {
    const status = lead.Status || 'Sem Status';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const descricaoDetalhada = Object.entries(statusPerdidos)
    .map(([status, count]) => `${count} ${status}`)
    .join(', ');

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
              {leadsPeridos} leads perdidos ({taxaPerdaGeral.toFixed(1)}% do total válido). 
              Revisar processo de acompanhamento.
            </p>
            {descricaoDetalhada && (
              <p className="text-xs text-gray-400 mt-1">
                Detalhes: {descricaoDetalhada}
              </p>
            )}
          </div>
          <div className="ml-3 text-right">
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
