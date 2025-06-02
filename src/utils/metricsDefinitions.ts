
import type { Lead } from "@/types/lead";
import { getLeadsByStatusGroup, getLeadsExcludingMentorados, validateStatusClassification } from "@/utils/statusClassification";

export interface StandardizedMetrics {
  // Contadores básicos
  totalLeads: number;
  fechados: number;
  aSerAtendido: number;
  atendidoNaoFechou: number;
  perdidoInativo: number;
  mentorados: number; // Adicionado para visibilidade
  
  // Grupos derivados
  apresentacoes: number; // Fechados + Atendidos Não Fecharam
  compareceram: number; // Total - Perdidos/Inativos - Mentorados
  
  // Taxas padronizadas
  taxaFechamento: number; // Fechados / Apresentações
  taxaComparecimento: number; // Compareceram / Total
  taxaDesmarque: number; // Perdidos/Inativos / Total
  aproveitamentoGeral: number; // Fechados / Total
  taxaNaoFechamento: number; // Atendidos Não Fecharam / Apresentações
  
  // Receitas
  receitaTotal: number;
  receitaCompleta: number;
  receitaRecorrente: number;
  vendasCompletas: number;
  vendasRecorrentes: number;
}

/**
 * DEFINIÇÕES PADRONIZADAS PARA TODA A PLATAFORMA:
 * 
 * 1. GRUPOS DE STATUS (5 GRUPOS):
 *    - Fechado: Leads que compraram
 *    - A Ser Atendido: Leads no processo (Agendado, Confirmado, Remarcou, DCAUSENTE)
 *    - Atendido Não Fechou: Leads atendidos sem conversão (Não Fechou, Aguardando resposta)
 *    - Perdido/Inativo: Leads perdidos (Desmarcou, Não Apareceu, Número errado)
 *    - Mentorado: Leads mentorados (SEMPRE EXCLUÍDOS dos cálculos de conversão)
 * 
 * 2. GRUPOS DERIVADOS:
 *    - Apresentações = Fechados + Atendidos Não Fecharam
 *    - Compareceram = Total Válidos - Perdidos/Inativos (Válidos = excluindo mentorados)
 * 
 * 3. FÓRMULAS PADRONIZADAS (sempre excluindo mentorados):
 *    - Taxa de Fechamento = Fechados / Apresentações
 *    - Taxa de Comparecimento = Compareceram / Total Válidos
 *    - Taxa de Desmarque = Perdidos/Inativos / Total Válidos
 *    - Aproveitamento Geral = Fechados / Total Válidos
 *    - Taxa de Não Fechamento = Atendidos Não Fecharam / Apresentações
 */

export function calculateStandardizedMetrics(leads: Lead[]): StandardizedMetrics {
  console.log('🔄 [MÉTRICAS PADRONIZADAS] Calculando para', leads.length, 'leads');
  
  // 0. Validar classificação de status
  const validation = validateStatusClassification(leads);
  if (validation.unclassified > 0) {
    console.warn(`⚠️ [VALIDAÇÃO] ${validation.unclassified} leads não puderam ser classificados`);
  }
  
  // 1. Agrupar por status usando classificação padrão (incluindo mentorados para contagem)
  const allStatusGroups = getLeadsByStatusGroup(leads, false);
  const mentorados = allStatusGroups.mentorado.length;
  
  // 2. Filtrar leads válidos (excluindo mentorados para cálculos)
  const validLeads = getLeadsExcludingMentorados(leads);
  const statusGroups = getLeadsByStatusGroup(validLeads, true);
  
  console.log('✅ [MÉTRICAS] Leads processados:');
  console.log(`  📊 Total original: ${leads.length}`);
  console.log(`  🎓 Mentorados (excluídos): ${mentorados}`);
  console.log(`  ✅ Válidos para cálculo: ${validLeads.length}`);
  
  // 3. Contadores básicos dos 4 grupos principais (excluindo mentorados)
  const totalLeads = validLeads.length;
  const fechados = statusGroups.fechado.length;
  const aSerAtendido = statusGroups.aSerAtendido.length;
  const atendidoNaoFechou = statusGroups.atendidoNaoFechou.length;
  const perdidoInativo = statusGroups.perdidoInativo.length;
  
  console.log('📊 [MÉTRICAS] Distribuição dos 4 grupos válidos:');
  console.log(`  ✅ Fechados: ${fechados}`);
  console.log(`  ⏳ A Ser Atendido: ${aSerAtendido}`);
  console.log(`  🕐 Atendido Não Fechou: ${atendidoNaoFechou}`);
  console.log(`  ❌ Perdido/Inativo: ${perdidoInativo}`);
  console.log(`  📈 Total Válidos: ${totalLeads} (verificação: ${fechados + aSerAtendido + atendidoNaoFechou + perdidoInativo})`);
  
  // 4. Grupos derivados (DEFINIÇÕES PADRONIZADAS)
  const apresentacoes = fechados + atendidoNaoFechou; // Leads que passaram por atendimento
  const compareceram = totalLeads - perdidoInativo; // Leads válidos que não sumiram
  
  console.log('🎯 [MÉTRICAS] Grupos derivados:');
  console.log(`  🎪 Apresentações: ${apresentacoes} (${fechados} fechados + ${atendidoNaoFechou} não fecharam)`);
  console.log(`  👥 Compareceram: ${compareceram} (${totalLeads} válidos - ${perdidoInativo} perdidos)`);
  
  // 5. Cálculo de receitas
  const receitaCompleta = validLeads.reduce((sum, lead) => {
    const venda = lead['Venda Completa'];
    return sum + (typeof venda === 'number' ? venda : 0);
  }, 0);
  
  const receitaRecorrente = validLeads.reduce((sum, lead) => {
    const recorrente = lead.recorrente;
    return sum + (typeof recorrente === 'number' ? recorrente : 0);
  }, 0);
  
  const receitaTotal = receitaCompleta + receitaRecorrente;
  
  const vendasCompletas = validLeads.filter(lead => 
    lead['Venda Completa'] && lead['Venda Completa'] > 0
  ).length;
  
  const vendasRecorrentes = validLeads.filter(lead => 
    lead.recorrente && lead.recorrente > 0
  ).length;
  
  // 6. TAXAS PADRONIZADAS (fórmulas definitivas - sempre excluindo mentorados)
  const taxaFechamento = apresentacoes > 0 ? (fechados / apresentacoes) * 100 : 0;
  const taxaComparecimento = totalLeads > 0 ? (compareceram / totalLeads) * 100 : 0;
  const taxaDesmarque = totalLeads > 0 ? (perdidoInativo / totalLeads) * 100 : 0;
  const aproveitamentoGeral = totalLeads > 0 ? (fechados / totalLeads) * 100 : 0;
  const taxaNaoFechamento = apresentacoes > 0 ? (atendidoNaoFechou / apresentacoes) * 100 : 0;
  
  console.log('📈 [MÉTRICAS] Taxas padronizadas (excluindo mentorados):');
  console.log(`  🎯 Taxa de Fechamento: ${taxaFechamento.toFixed(1)}% (${fechados}/${apresentacoes})`);
  console.log(`  ✅ Taxa de Comparecimento: ${taxaComparecimento.toFixed(1)}% (${compareceram}/${totalLeads})`);
  console.log(`  ❌ Taxa de Desmarque: ${taxaDesmarque.toFixed(1)}% (${perdidoInativo}/${totalLeads})`);
  console.log(`  ⚡ Aproveitamento Geral: ${aproveitamentoGeral.toFixed(1)}% (${fechados}/${totalLeads})`);
  console.log(`  🕐 Taxa de Não Fechamento: ${taxaNaoFechamento.toFixed(1)}% (${atendidoNaoFechou}/${apresentacoes})`);
  
  // 7. Validação matemática
  const somaComparecimentoDesmarque = taxaComparecimento + taxaDesmarque;
  const somaFechamentoNaoFechamento = taxaFechamento + taxaNaoFechamento;
  
  console.log('🔍 [VALIDAÇÃO] Verificações matemáticas:');
  console.log(`  Comparecimento + Desmarque = ${somaComparecimentoDesmarque.toFixed(1)}% (deve ser ~100%)`);
  console.log(`  Fechamento + Não Fechamento = ${somaFechamentoNaoFechamento.toFixed(1)}% (deve ser ~100%)`);
  
  if (Math.abs(somaComparecimentoDesmarque - 100) > 0.1) {
    console.warn('⚠️ [VALIDAÇÃO] ERRO: Comparecimento + Desmarque não soma 100%');
  }
  
  if (apresentacoes > 0 && Math.abs(somaFechamentoNaoFechamento - 100) > 0.1) {
    console.warn('⚠️ [VALIDAÇÃO] ERRO: Fechamento + Não Fechamento não soma 100%');
  }
  
  const metrics: StandardizedMetrics = {
    // Contadores básicos
    totalLeads,
    fechados,
    aSerAtendido,
    atendidoNaoFechou,
    perdidoInativo,
    mentorados,
    
    // Grupos derivados
    apresentacoes,
    compareceram,
    
    // Taxas padronizadas
    taxaFechamento,
    taxaComparecimento,
    taxaDesmarque,
    aproveitamentoGeral,
    taxaNaoFechamento,
    
    // Receitas
    receitaTotal,
    receitaCompleta,
    receitaRecorrente,
    vendasCompletas,
    vendasRecorrentes
  };
  
  console.log('✅ [MÉTRICAS] Cálculo padronizado concluído');
  console.log(`🎓 [EXCLUSÃO] Mentorados excluídos: ${mentorados} leads`);
  
  return metrics;
}

export function validateMetricsConsistency(metrics: StandardizedMetrics): boolean {
  const { totalLeads, fechados, aSerAtendido, atendidoNaoFechou, perdidoInativo } = metrics;
  
  // Verificar se a soma dos grupos bate com o total (excluindo mentorados)
  const somaGrupos = fechados + aSerAtendido + atendidoNaoFechou + perdidoInativo;
  if (somaGrupos !== totalLeads) {
    console.error(`❌ [VALIDAÇÃO] Soma dos grupos (${somaGrupos}) ≠ Total Válidos (${totalLeads})`);
    return false;
  }
  
  // Verificar se comparecimento + desmarque = 100%
  const somaComparecimentoDesmarque = metrics.taxaComparecimento + metrics.taxaDesmarque;
  if (Math.abs(somaComparecimentoDesmarque - 100) > 0.1) {
    console.error(`❌ [VALIDAÇÃO] Comparecimento + Desmarque = ${somaComparecimentoDesmarque.toFixed(1)}% (deveria ser 100%)`);
    return false;
  }
  
  console.log('✅ [VALIDAÇÃO] Métricas consistentes');
  console.log(`🎓 [INFO] ${metrics.mentorados} mentorados foram corretamente excluídos dos cálculos`);
  return true;
}
