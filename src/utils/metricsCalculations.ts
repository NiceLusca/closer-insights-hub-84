
import type { Lead } from "@/types/lead";
import { calculateStandardizedMetrics, validateMetricsConsistency } from "@/utils/metricsDefinitions";

export function calculateMetrics(leads: Lead[]) {
  console.log('🔄 [LEGACY] Função calculateMetrics (usando métricas padronizadas)');
  
  // Usar a função padronizada
  const standardMetrics = calculateStandardizedMetrics(leads);
  
  // Validar consistência
  validateMetricsConsistency(standardMetrics);
  
  // Retornar no formato esperado pela interface (retrocompatibilidade)
  const metrics = {
    totalLeads: standardMetrics.totalLeads,
    aproveitamentoGeral: standardMetrics.aproveitamentoGeral,
    receitaTotal: standardMetrics.receitaTotal,
    receitaCompleta: standardMetrics.receitaCompleta,
    receitaRecorrente: standardMetrics.receitaRecorrente,
    taxaFechamento: standardMetrics.taxaFechamento,
    taxaComparecimento: standardMetrics.taxaComparecimento,
    taxaDesmarque: standardMetrics.taxaDesmarque,
    taxaNaoFechamento: standardMetrics.taxaNaoFechamento,
    vendasCompletas: standardMetrics.vendasCompletas,
    vendasRecorrentes: standardMetrics.vendasRecorrentes,
    
    // Dados detalhados para debug e funil
    fechados: standardMetrics.fechados,
    aSerAtendido: standardMetrics.aSerAtendido,
    atendidoNaoFechou: standardMetrics.atendidoNaoFechou,
    perdidoInativo: standardMetrics.perdidoInativo,
    apresentacoes: standardMetrics.apresentacoes,
    compareceram: standardMetrics.compareceram,
    elegiveisParaComparecimento: standardMetrics.totalLeads, // Total válido é elegível
    baseParaDesmarque: standardMetrics.totalLeads, // Total válido é a base
    
    // Para retrocompatibilidade
    fechou: standardMetrics.fechados,
    agendados: standardMetrics.aSerAtendido,
    naoFecharam: standardMetrics.atendidoNaoFechou,
    perdidos: standardMetrics.perdidoInativo,
    naoApareceu: standardMetrics.perdidoInativo,
    desmarcou: standardMetrics.perdidoInativo,
    leadsAproveitaveis: standardMetrics.totalLeads,
    
    // Grupos de status para debug
    statusGroups: {
      fechados: standardMetrics.fechados,
      aSerAtendido: standardMetrics.aSerAtendido,
      atendidoNaoFechou: standardMetrics.atendidoNaoFechou,
      perdidoInativo: standardMetrics.perdidoInativo,
      mentorados: standardMetrics.mentorados // Adicionar para visibilidade
    }
  };
  
  console.log('✅ [LEGACY] Métricas calculadas usando definições padronizadas');
  console.log(`🎓 [INFO] ${standardMetrics.mentorados} mentorados excluídos dos cálculos`);
  return metrics;
}
