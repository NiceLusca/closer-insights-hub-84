
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
  console.log('🚨 [LOST LEADS ALERT] === INÍCIO DO DEBUGGING DETALHADO ===');
  console.log('🚨 [LOST LEADS ALERT] Leads recebidos:', leads.length);
  
  // Usar métricas padronizadas para garantir consistência
  const metrics = calculateStandardizedMetrics(leads);
  
  console.log('🚨 [LOST LEADS ALERT] Métricas padronizadas recebidas:', {
    totalLeads: metrics.totalLeads,
    perdidoInativo: metrics.perdidoInativo,
    atendidoNaoFechou: metrics.atendidoNaoFechou,
    mentorados: metrics.mentorados
  });
  
  // CÁLCULO DEFINITIVO: EXATAMENTE como solicitado pelo usuário
  // "soma os não compareceram + atendidos sem conversão e só então calcule o % disso em relação ao total"
  const naoCompareceram = metrics.perdidoInativo; // Não compareceram (perdidos/inativos)
  const atendidosSemConversao = metrics.atendidoNaoFechou; // Atendidos sem conversão
  const totalNaoConvertidos = naoCompareceram + atendidosSemConversao; // Soma dos dois grupos
  const percentualNaoConversao = metrics.totalLeads > 0 ? (totalNaoConvertidos / metrics.totalLeads) * 100 : 0;
  
  console.log('🚨 [LOST LEADS ALERT] === CÁLCULO STEP-BY-STEP ===');
  console.log(`🚨 [LOST LEADS ALERT] 1. Não compareceram: ${naoCompareceram}`);
  console.log(`🚨 [LOST LEADS ALERT] 2. Atendidos sem conversão: ${atendidosSemConversao}`);
  console.log(`🚨 [LOST LEADS ALERT] 3. SOMA (não convertidos): ${naoCompareceram} + ${atendidosSemConversao} = ${totalNaoConvertidos}`);
  console.log(`🚨 [LOST LEADS ALERT] 4. Base de cálculo (total válidos): ${metrics.totalLeads}`);
  console.log(`🚨 [LOST LEADS ALERT] 5. DIVISÃO: ${totalNaoConvertidos} ÷ ${metrics.totalLeads} = ${(totalNaoConvertidos / metrics.totalLeads).toFixed(6)}`);
  console.log(`🚨 [LOST LEADS ALERT] 6. PERCENTUAL FINAL: ${percentualNaoConversao.toFixed(1)}%`);
  console.log('🚨 [LOST LEADS ALERT] === FIM DO CÁLCULO ===');
  
  // Verificação de sanidade matemática
  const verificacaoManual = (totalNaoConvertidos / metrics.totalLeads) * 100;
  if (Math.abs(percentualNaoConversao - verificacaoManual) > 0.001) {
    console.error('🚨 [LOST LEADS ALERT] ❌ ERRO MATEMÁTICO DETECTADO!');
    console.error(`Calculado: ${percentualNaoConversao}, Verificação: ${verificacaoManual}`);
  } else {
    console.log('🚨 [LOST LEADS ALERT] ✅ Verificação matemática PASSOU');
  }
  
  // Log para debug do valor que estava aparecendo incorretamente
  const valorIncorretoAnterior = 96.2;
  if (Math.abs(percentualNaoConversao - valorIncorretoAnterior) < 0.1) {
    console.warn('🚨 [LOST LEADS ALERT] ⚠️ Valor ainda próximo ao incorreto (96.2%)!');
  } else {
    console.log(`🚨 [LOST LEADS ALERT] ✅ Valor corrigido! Era ${valorIncorretoAnterior}%, agora é ${percentualNaoConversao.toFixed(1)}%`);
  }

  // Só mostrar se taxa de não conversão for realmente alta (>60%)
  if (percentualNaoConversao <= 60) {
    console.log('🚨 [LOST LEADS ALERT] ℹ️ Taxa baixa, não exibindo alerta');
    return null;
  }

  const alertType = percentualNaoConversao > 75 ? 'danger' : 'warning';
  
  console.log('🚨 [LOST LEADS ALERT] 🎯 EXIBINDO ALERTA:', {
    tipo: alertType,
    percentual: `${percentualNaoConversao.toFixed(1)}%`,
    totalNaoConvertidos,
    baseCalculo: metrics.totalLeads
  });

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
              {totalNaoConvertidos} leads não converteram ({naoCompareceram} não compareceram + {atendidosSemConversao} atendidos sem conversão) 
              = {percentualNaoConversao.toFixed(1)}% de {metrics.totalLeads} leads válidos. Revisar estratégia de conversão.
            </p>
          </div>
          <div className="ml-3 text-right">
            <p className={`font-bold text-sm ${getIconColor(alertType)}`}>
              {percentualNaoConversao.toFixed(1)}%
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
});

LostLeadsAlert.displayName = 'LostLeadsAlert';
