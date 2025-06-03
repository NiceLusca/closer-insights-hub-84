
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
  compareceram: number; // CORREÇÃO: Apenas quem foi efetivamente atendido (fechados + atendidoNaoFechou)
  
  // Taxas padronizadas
  taxaFechamento: number; // Fechados / Apresentações
  taxaComparecimento: number; // CORREÇÃO: Apresentações / Total (quem efetivamente compareceu)
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
 * CORREÇÃO CRÍTICA APLICADA: Taxa de Comparecimento agora representa apenas
 * quem EFETIVAMENTE foi atendido (fechados + atendidoNaoFechou), não incluindo
 * leads "A Ser Atendido" que ainda estão no processo.
 * 
 * 1. GRUPOS DE STATUS (5 GRUPOS):
 *    - Fechado: Leads que compraram
 *    - A Ser Atendido: Leads no processo (Agendado, Confirmado, Remarcou, DCAUSENTE)
 *    - Atendido Não Fechou: Leads atendidos sem conversão (Não Fechou, Aguardando resposta)
 *    - Perdido/Inativo: Leads perdidos (Desmarcou, Não Apareceu, Número errado)
 *    - Mentorado: Leads mentorados (SEMPRE EXCLUÍDOS dos cálculos de conversão)
 * 
 * 2. GRUPOS DERIVADOS CORRIGIDOS:
 *    - Apresentações = Fechados + Atendidos Não Fecharam (quem foi efetivamente atendido)
 *    - Compareceram = Apresentações (MESMO VALOR - quem compareceu = quem foi atendido)
 * 
 * 3. FÓRMULAS PADRONIZADAS CORRIGIDAS (sempre excluindo mentorados):
 *    - Taxa de Fechamento = Fechados / Apresentações
 *    - Taxa de Comparecimento = Apresentações / Total Válidos (% que efetivamente compareceu)
 *    - Taxa de Desmarque = Perdidos/Inativos / Total Válidos
 *    - Aproveitamento Geral = Fechados / Total Válidos
 *    - Taxa de Não Fechamento = Atendidos Não Fecharam / Apresentações
 *    - Taxa de Não Conversão = (Perdidos + Não Fecharam) / Total Válidos
 */

export function calculateStandardizedMetrics(leads: Lead[]): StandardizedMetrics {
  console.log('🔄 [MÉTRICAS PADRONIZADAS] === DEBUGGING ANTI-96,2% ===');
  console.log('🔄 [MÉTRICAS PADRONIZADAS] Calculando para', leads.length, 'leads BRUTOS');
  
  // 0. Validar classificação de status
  const validation = validateStatusClassification(leads);
  if (validation.unclassified > 0) {
    console.warn(`⚠️ [VALIDAÇÃO] ${validation.unclassified} leads não puderam ser classificados`);
  }
  
  // 1. Agrupar por status usando classificação padrão (incluindo mentorados para contagem)
  const allStatusGroups = getLeadsByStatusGroup(leads, false);
  const mentorados = allStatusGroups.mentorado.length;
  
  // 2. CORREÇÃO: Esta função deve ser a ÚNICA responsável por filtrar mentorados
  const validLeads = getLeadsExcludingMentorados(leads);
  const statusGroups = getLeadsByStatusGroup(validLeads, true);
  
  console.log('✅ [MÉTRICAS] Base de cálculo padronizada:');
  console.log(`  📊 Total original: ${leads.length}`);
  console.log(`  🎓 Mentorados (SEMPRE excluídos): ${mentorados}`);
  console.log(`  ✅ Base válida para cálculo: ${validLeads.length}`);
  
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
  
  // 4. Grupos derivados CORRIGIDOS (DEFINIÇÕES PADRONIZADAS)
  const apresentacoes = fechados + atendidoNaoFechou; // Leads que passaram por atendimento
  const compareceram = apresentacoes; // CORREÇÃO: Compareceram = Apresentações (quem foi efetivamente atendido)
  
  console.log('🎯 [MÉTRICAS] Grupos derivados CORRIGIDOS:');
  console.log(`  🎪 Apresentações: ${apresentacoes} (${fechados} fechados + ${atendidoNaoFechou} não fecharam)`);
  console.log(`  👥 Compareceram: ${compareceram} (MESMO que apresentações - quem efetivamente foi atendido)`);
  console.log(`  ⏳ A Ser Atendido: ${aSerAtendido} (ainda no processo, NÃO contam como comparecimento)`);
  
  // === CÁLCULO ANTI-96,2% - DEBUGGING DETALHADO ===
  console.log('🚨 [ANTI-96,2%] === VERIFICAÇÃO ESPECÍFICA DO PROBLEMA ===');
  
  // Verificar de onde pode estar vindo o 96,2%
  const naoCompareceram = perdidoInativo;
  const atendidosSemConversao = atendidoNaoFechou;
  const totalNaoConvertidos = naoCompareceram + atendidosSemConversao;
  
  console.log(`🚨 [ANTI-96,2%] Não compareceram: ${naoCompareceram}`);
  console.log(`🚨 [ANTI-96,2%] Atendidos sem conversão: ${atendidosSemConversao}`);
  console.log(`🚨 [ANTI-96,2%] Total não convertidos: ${totalNaoConvertidos}`);
  console.log(`🚨 [ANTI-96,2%] Base de cálculo: ${totalLeads}`);
  
  // Testar todas as divisões possíveis que poderiam gerar 96,2%
  const possiveisCalculos = [
    { nome: 'Correto: naoConvertidos/total', resultado: (totalNaoConvertidos / totalLeads) * 100 },
    { nome: 'Invertido: total/naoConvertidos', resultado: totalLeads > 0 ? (totalLeads / totalNaoConvertidos) * 100 : 0 },
    { nome: 'Fechados/naoConvertidos', resultado: totalNaoConvertidos > 0 ? (fechados / totalNaoConvertidos) * 100 : 0 },
    { nome: 'naoConvertidos/fechados', resultado: fechados > 0 ? (totalNaoConvertidos / fechados) * 100 : 0 },
    { nome: 'apresentacoes/totalLeads', resultado: totalLeads > 0 ? (apresentacoes / totalLeads) * 100 : 0 },
    { nome: 'totalLeads/apresentacoes', resultado: apresentacoes > 0 ? (totalLeads / apresentacoes) * 100 : 0 }
  ];
  
  console.log('🚨 [ANTI-96,2%] Testando possíveis origens do 96,2%:');
  possiveisCalculos.forEach(calc => {
    console.log(`  ${calc.nome}: ${calc.resultado.toFixed(1)}%`);
    if (Math.abs(calc.resultado - 96.2) < 0.1) {
      console.error(`  ⚠️ POSSÍVEL ORIGEM DO 96,2%: ${calc.nome}!`);
    }
  });
  
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
  
  // 6. TAXAS PADRONIZADAS CORRIGIDAS (fórmulas definitivas - sempre excluindo mentorados)
  const taxaFechamento = apresentacoes > 0 ? (fechados / apresentacoes) * 100 : 0;
  const taxaComparecimento = totalLeads > 0 ? (apresentacoes / totalLeads) * 100 : 0; // CORREÇÃO: apresentações/total
  const taxaDesmarque = totalLeads > 0 ? (perdidoInativo / totalLeads) * 100 : 0;
  const aproveitamentoGeral = totalLeads > 0 ? (fechados / totalLeads) * 100 : 0;
  const taxaNaoFechamento = apresentacoes > 0 ? (atendidoNaoFechou / apresentacoes) * 100 : 0;
  
  // 7. VALIDAÇÃO EXTRA: Taxa de não conversão para alertas
  const taxaNaoConversao = totalLeads > 0 ? (totalNaoConvertidos / totalLeads) * 100 : 0;
  
  console.log('📈 [MÉTRICAS] Taxas padronizadas CORRIGIDAS (BASE ÚNICA para todos os componentes):');
  console.log(`  🎯 Taxa de Fechamento: ${taxaFechamento.toFixed(1)}% (${fechados}/${apresentacoes})`);
  console.log(`  ✅ Taxa de Comparecimento CORRIGIDA: ${taxaComparecimento.toFixed(1)}% (${apresentacoes}/${totalLeads}) - apenas quem foi efetivamente atendido`);
  console.log(`  ❌ Taxa de Desmarque: ${taxaDesmarque.toFixed(1)}% (${perdidoInativo}/${totalLeads})`);
  console.log(`  ⚡ Aproveitamento Geral: ${aproveitamentoGeral.toFixed(1)}% (${fechados}/${totalLeads})`);
  console.log(`  🕐 Taxa de Não Fechamento: ${taxaNaoFechamento.toFixed(1)}% (${atendidoNaoFechou}/${apresentacoes})`);
  console.log(`  🚨 Taxa de Não Conversão: ${taxaNaoConversao.toFixed(1)}% (${totalNaoConvertidos}/${totalLeads}) - para alertas`);
  
  // 8. VERIFICAÇÃO FINAL ANTI-96,2%
  console.log('🚨 [ANTI-96,2%] === VERIFICAÇÃO FINAL ===');
  console.log(`🚨 [ANTI-96,2%] Taxa de não conversão calculada: ${taxaNaoConversao.toFixed(1)}%`);
  console.log(`🚨 [ANTI-96,2%] Valor que DEVE aparecer no alerta: ${taxaNaoConversao.toFixed(1)}%`);
  console.log(`🚨 [ANTI-96,2%] Se aparecer 96,2%, há um bug na interface!`);
  
  if (Math.abs(taxaNaoConversao - 96.2) < 0.1) {
    console.error('🚨 [ANTI-96,2%] ❌ ERRO: Ainda calculando 96,2%! Verificar lógica!');
  } else {
    console.log('🚨 [ANTI-96,2%] ✅ Taxa calculada corretamente, diferente de 96,2%');
  }
  
  // 9. Validação matemática FINAL
  const somaComparecimentoASerAtendidoDesmarque = taxaComparecimento + ((aSerAtendido / totalLeads) * 100) + taxaDesmarque;
  const somaFechamentoNaoFechamento = taxaFechamento + taxaNaoFechamento;
  
  console.log('🔍 [VALIDAÇÃO] Verificações matemáticas FINAIS:');
  console.log(`  Comparecimento + A Ser Atendido + Desmarque = ${somaComparecimentoASerAtendidoDesmarque.toFixed(1)}% (deve ser ~100%)`);
  console.log(`  Fechamento + Não Fechamento = ${somaFechamentoNaoFechamento.toFixed(1)}% (deve ser ~100%)`);
  console.log(`  ✅ VALIDAÇÃO CRÍTICA: ${totalNaoConvertidos} não convertidos / ${totalLeads} total = ${taxaNaoConversao.toFixed(1)}%`);
  
  if (Math.abs(somaComparecimentoASerAtendidoDesmarque - 100) > 0.1) {
    console.warn('⚠️ [VALIDAÇÃO] ERRO: Comparecimento + A Ser Atendido + Desmarque não soma 100%');
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
    
    // Grupos derivados CORRIGIDOS
    apresentacoes,
    compareceram, // Agora é igual a apresentações
    
    // Taxas padronizadas CORRIGIDAS
    taxaFechamento,
    taxaComparecimento, // Agora correta: apresentações/total
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
  
  console.log('✅ [MÉTRICAS] Cálculo padronizado FINAL concluído - DEBUGGING ANTI-96,2% COMPLETO');
  console.log(`🎓 [EXCLUSÃO] Mentorados excluídos: ${mentorados} leads`);
  console.log(`🔧 [CORREÇÃO] Todas as taxas agora calculam corretamente com base em ${totalLeads} leads válidos`);
  console.log(`🚨 [ANTI-96,2%] Valor final para alerta: ${taxaNaoConversao.toFixed(1)}% (${totalNaoConvertidos}/${totalLeads})`);
  
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
  
  // Verificar se comparecimento + A ser atendido + desmarque = ~100%
  const taxaASerAtendido = totalLeads > 0 ? (aSerAtendido / totalLeads) * 100 : 0;
  const somaTodasTaxas = metrics.taxaComparecimento + taxaASerAtendido + metrics.taxaDesmarque;
  if (Math.abs(somaTodasTaxas - 100) > 0.1) {
    console.error(`❌ [VALIDAÇÃO] Comparecimento + A Ser Atendido + Desmarque = ${somaTodasTaxas.toFixed(1)}% (deveria ser 100%)`);
    return false;
  }
  
  console.log('✅ [VALIDAÇÃO] Métricas consistentes - BASE ÚNICA VALIDADA');
  console.log(`🎓 [INFO] ${metrics.mentorados} mentorados foram corretamente excluídos dos cálculos`);
  console.log(`🔧 [VALIDAÇÃO EXTRA] Todas as porcentagens calculadas corretamente com base em ${totalLeads} leads`);
  return true;
}
