
import type { Lead } from "@/types/lead";
import { calculateStandardizedMetrics, validateMetricsConsistency } from "@/utils/metricsDefinitions";

export function calculateMetrics(leads: Lead[]) {
  console.log('🔄 [LEGACY] Função calculateMetrics (usando métricas padronizadas)');
  
  // Usar a função padronizada
  const standardMetrics = calculateStandardizedMetrics(leads);
  
  // Validar consistência
  validateMetricsConsistency(standardMetrics);
  
  // Retornar no formato esperado pela interface (já compatível)
  const metrics = {
    ...standardMetrics,
    
    // Para retrocompatibilidade com códigos antigos
    fechou: standardMetrics.fechados,
    agendados: standardMetrics.aSerAtendido,
    naoFecharam: standardMetrics.atendidoNaoFechou,
    perdidos: standardMetrics.perdidoInativo,
    naoApareceu: standardMetrics.perdidoInativo,
    desmarcou: standardMetrics.perdidoInativo,
    leadsAproveitaveis: standardMetrics.totalLeads,
    elegiveisParaComparecimento: standardMetrics.totalLeads,
    baseParaDesmarque: standardMetrics.totalLeads,
    
    // Grupos de status para debug
    statusGroups: {
      fechados: standardMetrics.fechados,
      aSerAtendido: standardMetrics.aSerAtendido,
      atendidoNaoFechou: standardMetrics.atendidoNaoFechou,
      perdidoInativo: standardMetrics.perdidoInativo,
      mentorados: standardMetrics.mentorados
    }
  };
  
  console.log('✅ [LEGACY] Métricas calculadas usando definições padronizadas');
  console.log(`🎓 [INFO] ${standardMetrics.mentorados} mentorados excluídos dos cálculos`);
  return metrics;
}
