
import type { Lead } from "@/types/lead";
import { getLeadsByStatusGroup, getLeadsExcludingMentorados } from "@/utils/statusClassification";

export function calculateMetrics(leads: Lead[]) {
  console.log('🔄 Calculando métricas para', leads.length, 'leads');
  
  // Filtrar apenas leads válidos (excluindo mentorados)
  const validLeads = getLeadsExcludingMentorados(leads);
  console.log('✅ Leads válidos (excluindo mentorados):', validLeads.length);
  
  // Agrupar leads por status usando a classificação padrão
  const statusGroups = getLeadsByStatusGroup(validLeads, true);
  
  // Debug: mostrar distribuição por grupos
  console.log('📊 Distribuição por grupos de status:');
  Object.entries(statusGroups).forEach(([group, groupLeads]) => {
    console.log(`  ${group}: ${groupLeads.length} leads`);
  });
  
  const totalLeads = validLeads.length;
  
  // Contadores baseados nos grupos de status
  const fechados = statusGroups.fechado.length;
  const aSerAtendido = statusGroups.aSerAtendido.length;
  const atendidoNaoFechou = statusGroups.atendidoNaoFechou.length;
  const perdidoInativo = statusGroups.perdidoInativo.length;
  
  // Para retrocompatibilidade, mapear para os nomes antigos
  const fechou = fechados;
  const agendados = aSerAtendido; // A Ser Atendido = Agendado, Confirmado, Remarcou
  const naoFecharam = atendidoNaoFechou; // Não Fechou, Aguardando resposta
  const perdidos = perdidoInativo; // Desmarcou, Não Apareceu, Número errado
  
  // Cálculo de receitas
  const receitaCompleta = validLeads.reduce((sum, lead) => {
    const venda = lead['Venda Completa'];
    return sum + (typeof venda === 'number' ? venda : 0);
  }, 0);
  
  const receitaRecorrente = validLeads.reduce((sum, lead) => {
    const recorrente = lead.recorrente;
    return sum + (typeof recorrente === 'number' ? recorrente : 0);
  }, 0);
  
  const receitaTotal = receitaCompleta + receitaRecorrente;
  
  // Contadores de vendas
  const vendasCompletas = validLeads.filter(lead => 
    lead['Venda Completa'] && lead['Venda Completa'] > 0
  ).length;
  
  const vendasRecorrentes = validLeads.filter(lead => 
    lead.recorrente && lead.recorrente > 0
  ).length;
  
  // CÁLCULOS CORRIGIDOS BASEADOS NOS GRUPOS DE STATUS:
  
  // Taxa de Fechamento = Fechados / (Fechados + Atendidos que Não Fecharam)
  const baseParaFechamento = fechados + atendidoNaoFechou;
  const taxaFechamento = baseParaFechamento > 0 ? (fechados / baseParaFechamento) * 100 : 0;
  
  // Taxa de Comparecimento = A Ser Atendido + Fechados / (A Ser Atendido + Fechados + Perdidos/Inativos)
  const compareceram = aSerAtendido + fechados;
  const elegiveisParaComparecimento = aSerAtendido + fechados + perdidoInativo;
  const taxaComparecimento = elegiveisParaComparecimento > 0 ? (compareceram / elegiveisParaComparecimento) * 100 : 0;
  
  // Taxa de Desmarque = Perdidos/Inativos / (A Ser Atendido + Perdidos/Inativos)
  const baseParaDesmarque = aSerAtendido + perdidoInativo;
  const taxaDesmarque = baseParaDesmarque > 0 ? (perdidoInativo / baseParaDesmarque) * 100 : 0;
  
  // Aproveitamento geral = Fechamentos / Total de leads válidos
  const aproveitamentoGeral = totalLeads > 0 ? (fechados / totalLeads) * 100 : 0;
  
  const metrics = {
    totalLeads,
    aproveitamentoGeral,
    receitaTotal,
    receitaCompleta,
    receitaRecorrente,
    taxaFechamento,
    taxaComparecimento,
    taxaDesmarque,
    vendasCompletas,
    vendasRecorrentes,
    
    // Dados adicionais para compatibilidade e debug
    fechou: fechados,
    agendados: aSerAtendido,
    naoApareceu: perdidoInativo, // Simplificado para o grupo perdido/inativo
    desmarcou: perdidoInativo, // Simplificado para o grupo perdido/inativo
    apresentacoes: fechados + atendidoNaoFechou, // Leads que tiveram apresentação
    compareceram,
    elegiveisParaComparecimento,
    leadsAproveitaveis: totalLeads,
    
    // Grupos de status para debug
    statusGroups: {
      fechados,
      aSerAtendido,
      atendidoNaoFechou,
      perdidoInativo
    }
  };
  
  console.log('📈 Métricas calculadas com grupos de status:');
  console.log(`  Taxa de Fechamento: ${taxaFechamento.toFixed(1)}% (${fechados}/${baseParaFechamento})`);
  console.log(`  Taxa de Comparecimento: ${taxaComparecimento.toFixed(1)}% (${compareceram}/${elegiveisParaComparecimento})`);
  console.log(`  Taxa de Desmarque: ${taxaDesmarque.toFixed(1)}% (${perdidoInativo}/${baseParaDesmarque})`);
  console.log(`  Aproveitamento Geral: ${aproveitamentoGeral.toFixed(1)}% (${fechados}/${totalLeads})`);
  
  return metrics;
}
