
import type { StandardizedMetrics } from "./metricsDefinitions";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateMetricsConsistency(metrics: StandardizedMetrics): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const { totalLeads, fechados, aSerAtendido, atendidoNaoFechou, perdidoInativo } = metrics;
  
  // Verificar se a soma dos grupos bate com o total
  const somaGrupos = fechados + aSerAtendido + atendidoNaoFechou + perdidoInativo;
  if (somaGrupos !== totalLeads) {
    errors.push(`Soma dos grupos (${somaGrupos}) ≠ Total (${totalLeads})`);
  }
  
  // Verificar se apresentações = fechados + atendidoNaoFechou
  if (metrics.apresentacoes !== fechados + atendidoNaoFechou) {
    errors.push(`Apresentações (${metrics.apresentacoes}) ≠ Fechados + Não Fecharam (${fechados + atendidoNaoFechou})`);
  }
  
  // Verificar se as taxas principais somam ~100%
  const taxaASerAtendido = totalLeads > 0 ? (aSerAtendido / totalLeads) * 100 : 0;
  const somaDistribuicao = metrics.taxaComparecimento + taxaASerAtendido + metrics.taxaDesmarque;
  if (Math.abs(somaDistribuicao - 100) > 0.1) {
    errors.push(`Distribuição total ${somaDistribuicao.toFixed(1)}% ≠ 100%`);
  }
  
  // Verificar se fechamento + não fechamento = 100% (das apresentações)
  if (metrics.apresentacoes > 0) {
    const somaApresentacoes = metrics.taxaFechamento + metrics.taxaNaoFechamento;
    if (Math.abs(somaApresentacoes - 100) > 0.1) {
      errors.push(`Fechamento + Não Fechamento ${somaApresentacoes.toFixed(1)}% ≠ 100%`);
    }
  }
  
  // Avisos para métricas questionáveis
  if (metrics.taxaDesmarque > 40) {
    warnings.push(`Taxa de desmarque muito alta: ${metrics.taxaDesmarque.toFixed(1)}%`);
  }
  
  if (metrics.taxaFechamento < 20 && metrics.apresentacoes > 5) {
    warnings.push(`Taxa de fechamento baixa: ${metrics.taxaFechamento.toFixed(1)}%`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function calculateLossMetrics(metrics: StandardizedMetrics) {
  const naoCompareceram = metrics.perdidoInativo;
  const atendidosSemConversao = metrics.atendidoNaoFechou;
  const totalNaoConvertidos = naoCompareceram + atendidosSemConversao;
  
  return {
    naoCompareceram,
    atendidosSemConversao,
    totalNaoConvertidos,
    taxaNaoConversao: metrics.totalLeads > 0 ? (totalNaoConvertidos / metrics.totalLeads) * 100 : 0,
    taxaDesmarque: metrics.taxaDesmarque,
    taxaNaoFechamento: metrics.taxaNaoFechamento
  };
}
